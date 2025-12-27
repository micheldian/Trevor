import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { TagAlias } from '../entities/tag-alias.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { CreateTagAliasDto } from '../dto/create-tag-alias.dto';
import { GetTagsQueryDto } from '../dto/get-tags-query.dto';
import {
  TagResponseDto,
  TagAliasResponseDto,
  PaginatedTagsResponseDto,
} from '../dto/tag-response.dto';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { Request } from 'express';

@Injectable()
export class AdminTagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TagAlias)
    private readonly tagAliasRepository: Repository<TagAlias>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get all tags with pagination and filters
   */
  async getTags(query: GetTagsQueryDto): Promise<PaginatedTagsResponseDto> {
    const {
      page = 1,
      limit = 20,
      category,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
      includeAliases,
    } = query;

    const queryBuilder = this.tagRepository.createQueryBuilder('tag');

    if (includeAliases) {
      queryBuilder.leftJoinAndSelect('tag.aliases', 'aliases');
    }

    // Apply filters
    if (category !== undefined) {
      queryBuilder.andWhere('tag.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('tag.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(tag.name ILIKE :search OR tag.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`tag.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [tags, total] = await queryBuilder.getManyAndCount();

    return {
      data: tags.map(tag => this.mapToDto(tag)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single tag by ID
   */
  async getTag(tagId: string, includeAliases = true): Promise<TagResponseDto> {
    const queryBuilder = this.tagRepository.createQueryBuilder('tag');

    if (includeAliases) {
      queryBuilder.leftJoinAndSelect('tag.aliases', 'aliases');
    }

    queryBuilder.where('tag.id = :tagId', { tagId });

    const tag = await queryBuilder.getOne();

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.mapToDto(tag);
  }

  /**
   * Create a new tag
   */
  async createTag(
    dto: CreateTagDto,
    adminUserId: string,
    request?: Request,
  ): Promise<TagResponseDto> {
    // Check if tag with same name already exists
    const existing = await this.tagRepository.findOne({
      where: { name: dto.name.trim().toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Tag with name "${dto.name}" already exists`);
    }

    const tag = this.tagRepository.create({
      name: dto.name.trim().toLowerCase(),
      category: dto.category,
      description: dto.description,
      isActive: true,
    });

    const savedTag = await this.tagRepository.save(tag);

    // Create audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'tags.created',
      entityType: 'tag',
      entityId: savedTag.id,
      beforeJson: undefined,
      afterJson: savedTag,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
    });

    return this.mapToDto(savedTag);
  }

  /**
   * Update a tag
   */
  async updateTag(
    tagId: string,
    dto: UpdateTagDto,
    adminUserId: string,
    request?: Request,
  ): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check for name conflicts if name is being updated
    if (dto.name && dto.name.trim().toLowerCase() !== tag.name) {
      const existing = await this.tagRepository.findOne({
        where: { name: dto.name.trim().toLowerCase() },
      });

      if (existing) {
        throw new ConflictException(`Tag with name "${dto.name}" already exists`);
      }
    }

    const beforeState = { ...tag };

    // Update fields
    if (dto.name !== undefined) {
      tag.name = dto.name.trim().toLowerCase();
    }
    if (dto.category !== undefined) {
      tag.category = dto.category;
    }
    if (dto.description !== undefined) {
      tag.description = dto.description;
    }
    if (dto.isActive !== undefined) {
      tag.isActive = dto.isActive;
    }

    const updatedTag = await this.tagRepository.save(tag);

    // Create audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'tags.updated',
      entityType: 'tag',
      entityId: tag.id,
      beforeJson: beforeState,
      afterJson: updatedTag,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
    });

    return this.mapToDto(updatedTag);
  }

  /**
   * Delete a tag
   */
  async deleteTag(
    tagId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id: tagId },
      relations: ['aliases'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check if tag is being used
    if (tag.usageCount > 0) {
      throw new BadRequestException(
        `Cannot delete tag "${tag.name}" as it is being used (${tag.usageCount} times). Consider deactivating it instead.`,
      );
    }

    // Create audit log before deletion
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'tags.deleted',
      entityType: 'tag',
      entityId: tag.id,
      beforeJson: tag,
      afterJson: undefined,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
    });

    await this.tagRepository.remove(tag);
  }

  /**
   * Create a tag alias
   */
  async createTagAlias(
    dto: CreateTagAliasDto,
    adminUserId: string,
    request?: Request,
  ): Promise<TagAliasResponseDto> {
    // Check if tag exists
    const tag = await this.tagRepository.findOne({ where: { id: dto.tagId } });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check if alias already exists
    const existing = await this.tagAliasRepository.findOne({
      where: { alias: dto.alias.trim().toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Alias "${dto.alias}" already exists`);
    }

    // Check if alias matches an existing tag name
    const tagWithSameName = await this.tagRepository.findOne({
      where: { name: dto.alias.trim().toLowerCase() },
    });

    if (tagWithSameName) {
      throw new ConflictException(
        `Cannot create alias "${dto.alias}" as it matches an existing tag name`,
      );
    }

    const alias = this.tagAliasRepository.create({
      tagId: dto.tagId,
      alias: dto.alias.trim().toLowerCase(),
      isActive: true,
    });

    const savedAlias = await this.tagAliasRepository.save(alias);

    // Create audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'tag_aliases.created',
      entityType: 'tag_alias',
      entityId: savedAlias.id,
      beforeJson: undefined,
      afterJson: savedAlias,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
      metadata: { tagId: dto.tagId, tagName: tag.name },
    });

    return this.mapAliasToDto(savedAlias);
  }

  /**
   * Toggle tag alias active status
   */
  async toggleAliasStatus(
    aliasId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<TagAliasResponseDto> {
    const alias = await this.tagAliasRepository.findOne({ where: { id: aliasId } });

    if (!alias) {
      throw new NotFoundException('Tag alias not found');
    }

    const beforeState = { ...alias };
    alias.isActive = !alias.isActive;

    const updatedAlias = await this.tagAliasRepository.save(alias);

    // Create audit log
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'tag_aliases.status_toggled',
      entityType: 'tag_alias',
      entityId: alias.id,
      beforeJson: beforeState,
      afterJson: updatedAlias,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
    });

    return this.mapAliasToDto(updatedAlias);
  }

  /**
   * Delete a tag alias
   */
  async deleteTagAlias(
    aliasId: string,
    adminUserId: string,
    request?: Request,
  ): Promise<void> {
    const alias = await this.tagAliasRepository.findOne({ where: { id: aliasId } });

    if (!alias) {
      throw new NotFoundException('Tag alias not found');
    }

    // Create audit log before deletion
    await this.auditLogService.create({
      actorUserId: adminUserId,
      action: 'tag_aliases.deleted',
      entityType: 'tag_alias',
      entityId: alias.id,
      beforeJson: alias,
      afterJson: undefined,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      requestMethod: request?.method,
      requestUrl: request?.url,
    });

    await this.tagAliasRepository.remove(alias);
  }

  /**
   * Get tag statistics
   */
  async getStatistics(): Promise<{
    totalTags: number;
    activeTags: number;
    totalAliases: number;
    byCategory: Record<string, number>;
  }> {
    const [totalTags, activeTags, totalAliases] = await Promise.all([
      this.tagRepository.count(),
      this.tagRepository.count({ where: { isActive: true } }),
      this.tagAliasRepository.count(),
    ]);

    const tags = await this.tagRepository.find();
    const byCategory: Record<string, number> = {};

    tags.forEach(tag => {
      const cat = tag.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      totalTags,
      activeTags,
      totalAliases,
      byCategory,
    };
  }

  /**
   * Map Tag entity to DTO
   */
  private mapToDto(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      category: tag.category ?? undefined,
      description: tag.description ?? undefined,
      isActive: tag.isActive,
      usageCount: tag.usageCount,
      aliases: tag.aliases ? tag.aliases.map(a => this.mapAliasToDto(a)) : undefined,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  /**
   * Map TagAlias entity to DTO
   */
  private mapAliasToDto(alias: TagAlias): TagAliasResponseDto {
    return {
      id: alias.id,
      alias: alias.alias,
      isActive: alias.isActive,
      createdAt: alias.createdAt,
    };
  }
}
