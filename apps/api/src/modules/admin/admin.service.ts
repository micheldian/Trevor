import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { Match } from '../matches/entities/match.entity';
import { Role } from '../../common/enums/role.enum';
import { AdminIpLockService } from './services/admin-ip-lock.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly ipLockService: AdminIpLockService,
  ) {}

  /**
   * Get platform statistics
   */
  async getStats(user: any) {
    this.logger.log(`Admin ${user.sub} requested platform stats`);

    const [
      totalUsers,
      totalProfiles,
      totalJobs,
      totalMatches,
      activeUsers,
      publishedJobs,
    ] = await Promise.all([
      this.userRepository.count(),
      this.profileRepository.count(),
      this.jobRepository.count(),
      this.matchRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.jobRepository.count({ where: { status: 'published' as any } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      profiles: {
        total: totalProfiles,
      },
      jobs: {
        total: totalJobs,
        published: publishedJobs,
      },
      matches: {
        total: totalMatches,
      },
      requestedBy: {
        userId: user.sub,
        role: user.role,
      },
    };
  }

  /**
   * Get all users with their profiles
   */
  async getAllUsers() {
    return this.userRepository.find({
      relations: ['profiles'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: Role) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const oldRole = user.role;
    user.role = newRole;
    await this.userRepository.save(user);

    this.logger.log(`User ${userId} role updated from ${oldRole} to ${newRole}`);

    return {
      success: true,
      message: `User role updated from ${oldRole} to ${newRole}`,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.isActive = false;
    await this.userRepository.save(user);

    this.logger.log(`User ${userId} deactivated`);

    return {
      success: true,
      message: 'User deactivated successfully',
      userId,
    };
  }

  /**
   * Get all jobs (including drafts, cancelled, etc.)
   */
  async getAllJobs() {
    return this.jobRepository.find({
      relations: ['employer'],
      order: { createdAt: 'DESC' },
      take: 100, // Limit for performance
    });
  }

  /**
   * Get all matches
   */
  async getAllMatches() {
    return this.matchRepository.find({
      relations: ['job', 'candidate'],
      order: { createdAt: 'DESC' },
      take: 100, // Limit for performance
    });
  }

  /**
   * Get platform metrics
   */
  async getMetrics() {
    // Group users by role
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Get job statuses
    const jobsByStatus = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.status')
      .getRawMany();

    // Get match statuses
    const matchesByStatus = await this.matchRepository
      .createQueryBuilder('match')
      .select('match.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('match.status')
      .getRawMany();

    return {
      usersByRole,
      jobsByStatus,
      matchesByStatus,
    };
  }

  /**
   * Get all locked IP addresses
   */
  async getLockedIps() {
    const ips = await this.ipLockService.getLockedIps();

    // Get stats for each locked IP
    const ipsWithStats = await Promise.all(
      ips.map(async (ip) => {
        const stats = await this.ipLockService.getIpStats(ip);
        return {
          ip,
          ...stats,
        };
      }),
    );

    return {
      count: ipsWithStats.length,
      lockedIps: ipsWithStats,
    };
  }

  /**
   * Get IP statistics
   */
  async getIpStats(ip: string) {
    const stats = await this.ipLockService.getIpStats(ip);

    return {
      ip,
      ...stats,
    };
  }

  /**
   * Unlock IP address
   */
  async unlockIp(ip: string) {
    await this.ipLockService.unlockIp(ip);

    this.logger.log(`IP ${ip} manually unlocked by admin`);

    return {
      success: true,
      message: `IP ${ip} has been unlocked`,
      ip,
    };
  }
}
