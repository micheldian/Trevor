import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { Profile } from '../src/modules/profiles/entities/profile.entity';
import { Availability } from '../src/modules/availability/entities/availability.entity';
import {
  DateType,
  TimeSlot,
  AvailabilityStatus,
} from '../src/modules/availability/entities/availability.entity';
import { ProfileType } from '../src/modules/profiles/entities/profile.entity';

describe('SearchController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let worker1: User;
  let worker2: User;
  let teamLead: User;
  let employer: User;
  let workerProfile1: Profile;
  let workerProfile2: Profile;
  let teamLeadProfile: Profile;
  let employerProfile: Profile;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    // Cleanup
    await dataSource.query('TRUNCATE TABLE availabilities CASCADE');
    await dataSource.query('TRUNCATE TABLE profiles CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await app.close();
  });

  async function seedTestData() {
    const userRepo = dataSource.getRepository(User);
    const profileRepo = dataSource.getRepository(Profile);
    const availabilityRepo = dataSource.getRepository(Availability);

    // Create users
    worker1 = await userRepo.save({
      email: 'worker1@example.com',
      phone: '+33612345001',
      phoneVerified: true,
      firstName: 'Jean',
      lastName: 'Dupont',
    });

    worker2 = await userRepo.save({
      email: 'worker2@example.com',
      phone: '+33612345002',
      phoneVerified: true,
      firstName: 'Marie',
      lastName: 'Martin',
    });

    teamLead = await userRepo.save({
      email: 'teamlead@example.com',
      phone: '+33612345003',
      phoneVerified: true,
      firstName: 'Pierre',
      lastName: 'Lefevre',
    });

    employer = await userRepo.save({
      email: 'employer@example.com',
      phone: '+33612345004',
      phoneVerified: true,
      firstName: 'Sophie',
      lastName: 'Bernard',
    });

    // Create profiles
    workerProfile1 = await profileRepo.save({
      userId: worker1.id,
      type: ProfileType.WORKER,
      bio: 'Experienced in viticulture and pomme cultivation',
      city: 'Strasbourg',
      postalCode: '67000',
      skills: ['viticulture', 'vendanges', 'pomme', 'taille'],
      experienceYears: 10,
      certifications: ['CACES R372'],
      hasVehicle: true,
      ratingAvg: 4.5,
      ratingCount: 12,
      isActive: true,
      isComplete: true,
      whatsappNumber: '+33612345001',
      latitude: 48.5734,
      longitude: 7.7521,
    });

    workerProfile2 = await profileRepo.save({
      userId: worker2.id,
      type: ProfileType.WORKER,
      bio: 'Specialist in arboriculture',
      city: 'Obernai',
      postalCode: '67210',
      skills: ['arboriculture', 'pomme', 'cueillette'],
      experienceYears: 5,
      certifications: [],
      hasVehicle: false,
      ratingAvg: 4.0,
      ratingCount: 8,
      isActive: true,
      isComplete: true,
      whatsappNumber: '+33612345002',
      latitude: 48.4623,
      longitude: 7.4817,
    });

    teamLeadProfile = await profileRepo.save({
      userId: teamLead.id,
      type: ProfileType.TEAM_LEAD,
      bio: 'Team leader for agricultural work',
      city: 'Colmar',
      postalCode: '68000',
      skills: ['viticulture', 'vendanges', 'management'],
      experienceYears: 15,
      certifications: ['CACES R372', 'SST'],
      hasVehicle: true,
      ratingAvg: 4.8,
      ratingCount: 20,
      isActive: true,
      isComplete: true,
      whatsappNumber: '+33612345003',
      latitude: 48.0794,
      longitude: 7.3584,
    });

    employerProfile = await profileRepo.save({
      userId: employer.id,
      type: ProfileType.EMPLOYER,
      city: 'Strasbourg',
      postalCode: '67000',
      companyName: 'Vignobles du Rhin',
      siret: '12345678901234',
      isActive: true,
      isComplete: true,
      latitude: 48.5734,
      longitude: 7.7521,
    });

    // Create availabilities
    await availabilityRepo.save({
      profileId: workerProfile1.id,
      status: AvailabilityStatus.ON,
      dateType: DateType.TODAY,
      timeSlot: TimeSlot.MORNING,
      latitude: 48.5734,
      longitude: 7.7521,
      radiusKm: 50,
      notes: 'Available for vendanges',
      isActive: true,
    });

    await availabilityRepo.save({
      profileId: workerProfile2.id,
      status: AvailabilityStatus.ON,
      dateType: DateType.TODAY,
      timeSlot: TimeSlot.MORNING,
      latitude: 48.4623,
      longitude: 7.4817,
      radiusKm: 30,
      notes: 'Available for pomme picking',
      isActive: true,
    });

    await availabilityRepo.save({
      profileId: teamLeadProfile.id,
      status: AvailabilityStatus.ON,
      dateType: DateType.TOMORROW,
      timeSlot: TimeSlot.DAY,
      latitude: 48.0794,
      longitude: 7.3584,
      radiusKm: 100,
      notes: 'Team available',
      isActive: true,
    });

    // Create one OFF availability to test filtering
    await availabilityRepo.save({
      profileId: workerProfile1.id,
      status: AvailabilityStatus.OFF,
      dateType: DateType.TOMORROW,
      timeSlot: TimeSlot.AFTERNOON,
      latitude: 48.5734,
      longitude: 7.7521,
      radiusKm: 50,
      isActive: true,
    });
  }

  describe('GET /search/available', () => {
    it('should return all available profiles without filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should filter profiles by text query (q)', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?q=pomme')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      // Should return profiles with "pomme" in skills or bio
      const hasSkillMatch = response.body.data.some((profile: any) =>
        profile.skills.includes('pomme'),
      );
      const hasBioMatch = response.body.data.some((profile: any) =>
        profile.bio?.toLowerCase().includes('pomme'),
      );
      expect(hasSkillMatch || hasBioMatch).toBe(true);
    });

    it('should filter by dateType', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?dateType=today')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.availability.dateType).toBe('today');
      });
    });

    it('should filter by timeSlot', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?timeSlot=morning')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.availability.timeSlot).toBe('morning');
      });
    });

    it('should filter by minRating', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?minRating=4.5')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.ratingAvg).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should filter by hasVehicle', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?hasVehicle=true')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.hasVehicle).toBe(true);
      });
    });

    it('should filter onlyTeams (team_lead only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?onlyTeams=true')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.type).toBe('team_lead');
      });
    });

    it('should filter by skills', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?skills=viticulture,vendanges')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        const hasSkill =
          profile.skills.includes('viticulture') ||
          profile.skills.includes('vendanges');
        expect(hasSkill).toBe(true);
      });
    });

    it('should calculate distance when employerId is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`/search/available?employerId=${employerProfile.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      // Distance should be included in results
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('distance');
      }
    });

    it('should filter by maxDistanceKm with employerId', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/search/available?employerId=${employerProfile.id}&maxDistanceKm=20`,
        )
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        if (profile.distance !== undefined) {
          expect(profile.distance).toBeLessThanOrEqual(20);
        }
      });
    });

    it('should return matchScore for each profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?skills=viticulture')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.matchScore).toBeDefined();
        expect(profile.matchScore).toBeGreaterThanOrEqual(0);
        expect(profile.matchScore).toBeLessThanOrEqual(100);
      });
    });

    it('should return matchReasons for each profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?skills=viticulture,vendanges')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.matchReasons).toBeDefined();
        expect(profile.matchReasons).toHaveProperty('skillsMatched');
        expect(profile.matchReasons).toHaveProperty('totalSkills');
        expect(profile.matchReasons).toHaveProperty('hasVehicle');
        expect(profile.matchReasons).toHaveProperty('rating');
        expect(profile.matchReasons).toHaveProperty('experience');
      });
    });

    it('should sort by skills match when skills provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?skills=viticulture,vendanges')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 1) {
        // First result should have more skill matches
        const first = response.body.data[0];
        const second = response.body.data[1];
        expect(first.matchReasons.skillsMatched).toBeGreaterThanOrEqual(
          second.matchReasons.skillsMatched,
        );
      }
    });

    it('should handle pagination (limit)', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?limit=1')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.meta.limit).toBe(1);
    });

    it('should handle pagination (offset)', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/search/available?limit=1&offset=0')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/search/available?limit=1&offset=1')
        .expect(200);

      if (response1.body.data.length > 0 && response2.body.data.length > 0) {
        expect(response1.body.data[0].id).not.toBe(response2.body.data[0].id);
      }
    });

    it('should return hasMore=true when more results available', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?limit=1')
        .expect(200);

      if (response.body.meta.total > 1) {
        expect(response.body.meta.hasMore).toBe(true);
      }
    });

    it('should return hasMore=false when no more results', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?limit=100')
        .expect(200);

      if (response.body.data.length === response.body.meta.total) {
        expect(response.body.meta.hasMore).toBe(false);
      }
    });

    it('should include searchQuery in meta', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?q=pomme')
        .expect(200);

      expect(response.body.meta.searchQuery).toBe('pomme');
    });

    it('should include filters in meta', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/search/available?dateType=today&timeSlot=morning&minRating=4.0&maxDistanceKm=50',
        )
        .expect(200);

      expect(response.body.meta.filters).toBeDefined();
      expect(response.body.meta.filters.dateType).toBe('today');
      expect(response.body.meta.filters.timeSlot).toBe('morning');
      expect(response.body.meta.filters.minRating).toBe(4.0);
      expect(response.body.meta.filters.maxDistance).toBe(50);
    });

    it('should return empty array when no matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available?q=nonexistentskill12345')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.hasMore).toBe(false);
    });

    it('should only return profiles with status=on', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.availability.status).toBe('on');
      });
    });

    it('should return all required profile fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/available')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      const profile = response.body.data[0];
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('type');
      expect(profile).toHaveProperty('firstName');
      expect(profile).toHaveProperty('lastName');
      expect(profile).toHaveProperty('city');
      expect(profile).toHaveProperty('postalCode');
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('skills');
      expect(profile).toHaveProperty('experienceYears');
      expect(profile).toHaveProperty('hasVehicle');
      expect(profile).toHaveProperty('ratingAvg');
      expect(profile).toHaveProperty('ratingCount');
      expect(profile).toHaveProperty('availability');
      expect(profile).toHaveProperty('matchScore');
      expect(profile).toHaveProperty('matchReasons');
      expect(profile).toHaveProperty('whatsappNumber');
    });

    it('should return 400 for invalid minRating', async () => {
      await request(app.getHttpServer())
        .get('/search/available?minRating=10')
        .expect(400);
    });

    it('should return 400 for invalid limit', async () => {
      await request(app.getHttpServer())
        .get('/search/available?limit=500')
        .expect(400);
    });

    it('should return 400 for invalid maxDistanceKm', async () => {
      await request(app.getHttpServer())
        .get('/search/available?maxDistanceKm=500')
        .expect(400);
    });

    it('should handle multiple filters combined', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/search/available?q=pomme&dateType=today&timeSlot=morning&hasVehicle=true&minRating=3.5',
        )
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((profile: any) => {
        expect(profile.availability.dateType).toBe('today');
        expect(profile.availability.timeSlot).toBe('morning');
        expect(profile.hasVehicle).toBe(true);
        expect(profile.ratingAvg).toBeGreaterThanOrEqual(3.5);
      });
    });

    it('should be publicly accessible (no auth required)', async () => {
      // Should work without Authorization header
      const response = await request(app.getHttpServer())
        .get('/search/available')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });
});
