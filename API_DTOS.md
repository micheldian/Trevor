# 📦 TREVOR V1 - DTOs & VALIDATION

**Framework**: NestJS + class-validator + class-transformer
**Purpose**: Définitions TypeScript des DTOs pour validation API

---

## 🔧 INSTALLATION

```bash
pnpm add class-validator class-transformer
pnpm add @nestjs/swagger
```

---

## 📋 DTOs PAR MODULE

## 1️⃣ AUTH DTOs

### **SendOtpDto**
```typescript
// apps/api/src/modules/auth/dto/send-otp.dto.ts
import { IsEmail, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'jean.dupont@email.fr',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @ValidateIf(o => !o.phone) // Requis si pas de phone
  email?: string;

  @ApiProperty({
    description: 'Numéro de téléphone français',
    example: '+33612345678',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber('FR', { message: 'Numéro de téléphone invalide (format: +33XXXXXXXXX)' })
  @ValidateIf(o => !o.email) // Requis si pas d'email
  phone?: string;
}
```

### **VerifyOtpDto**
```typescript
// apps/api/src/modules/auth/dto/verify-otp.dto.ts
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'jean.dupont@email.fr', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+33612345678', required: false })
  @IsOptional()
  @IsPhoneNumber('FR')
  phone?: string;

  @ApiProperty({
    description: 'Code OTP à 6 chiffres',
    example: '123456'
  })
  @IsString()
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  @Matches(/^\d{6}$/, { message: 'Le code doit être composé de 6 chiffres' })
  code: string;
}
```

### **RefreshTokenDto**
```typescript
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
```

---

## 2️⃣ PROFILES DTOs

### **CreateProfileDto**
```typescript
// apps/api/src/modules/profiles/dto/create-profile.dto.ts
import {
  IsEnum, IsString, IsOptional, IsArray, IsNumber,
  Min, Max, IsLatitude, IsLongitude, Matches, ValidateIf,
  MinLength, MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileType } from '../enums/profile-type.enum';

export class LocationDto {
  @ApiProperty({ example: 48.5734 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 7.7521 })
  @IsLongitude()
  lng: number;
}

export class CreateProfileDto {
  @ApiProperty({
    enum: ProfileType,
    example: ProfileType.WORKER,
    description: 'Type de profil'
  })
  @IsEnum(ProfileType, { message: 'Type de profil invalide' })
  type: ProfileType;

  @ApiProperty({ example: 'Passionné de viticulture...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Bio trop longue (max 2000 caractères)' })
  bio?: string;

  @ApiProperty({
    example: 'Ferme du Rocher',
    description: 'Nom de l\'entreprise (requis pour employeurs)',
    required: false
  })
  @ValidateIf(o => o.type === ProfileType.EMPLOYER)
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName?: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'SIRET (requis pour employeurs)',
    required: false
  })
  @ValidateIf(o => o.type === ProfileType.EMPLOYER)
  @IsString()
  @Matches(/^\d{14}$/, { message: 'SIRET doit contenir exactement 14 chiffres' })
  siret?: string;

  @ApiProperty({ example: 'Strasbourg' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '67000' })
  @IsString()
  @Matches(/^67\d{3}$/, { message: 'Code postal invalide (format: 67XXX pour Bas-Rhin)' })
  postalCode: string;

  @ApiProperty({ example: '12 Rue du Vin', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  location?: LocationDto;

  @ApiProperty({
    example: ['viticulture', 'taille', 'vendanges'],
    description: 'Compétences (pour workers/team_leads)',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50, { message: 'Expérience max 50 ans' })
  experienceYears?: number;

  @ApiProperty({
    example: ['CACES R372', 'Certiphyto'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ example: '+33612345678', required: false })
  @IsOptional()
  @IsPhoneNumber('FR')
  whatsappNumber?: string;

  @ApiProperty({
    enum: ['whatsapp', 'phone', 'email'],
    example: 'whatsapp',
    required: false
  })
  @IsOptional()
  @IsEnum(['whatsapp', 'phone', 'email'])
  preferredContact?: string;
}
```

### **UpdateProfileDto**
```typescript
// apps/api/src/modules/profiles/dto/update-profile.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  // Tous les champs deviennent optionnels
}
```

### **ProfileFilterDto**
```typescript
// apps/api/src/modules/profiles/dto/profile-filter.dto.ts
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileType } from '../enums/profile-type.enum';

export class ProfileFilterDto {
  @ApiProperty({ enum: ProfileType, required: false })
  @IsOptional()
  @IsEnum(ProfileType)
  type?: ProfileType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  available?: boolean;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ enum: ['rating', 'created', 'experience'], required: false })
  @IsOptional()
  @IsEnum(['rating', 'created', 'experience'])
  sortBy?: string;

  @ApiProperty({ enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
```

---

## 3️⃣ TEAMS DTOs

### **CreateTeamDto**
```typescript
// apps/api/src/modules/teams/dto/create-team.dto.ts
import { IsString, IsOptional, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Équipe Vendanges Pro' })
  @IsString()
  @MinLength(3, { message: 'Nom trop court (min 3 caractères)' })
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Équipe spécialisée dans les vendanges...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 10, default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(2, { message: 'Une équipe doit avoir au minimum 2 places' })
  @Max(50, { message: 'Maximum 50 membres par équipe' })
  maxMembers?: number = 10;
}
```

### **AddTeamMemberDto**
```typescript
// apps/api/src/modules/teams/dto/add-team-member.dto.ts
import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTeamMemberDto {
  @ApiProperty({ example: 'profile-uuid' })
  @IsUUID('4', { message: 'workerProfileId invalide' })
  workerProfileId: string;

  @ApiProperty({
    enum: ['member', 'assistant_lead'],
    default: 'member',
    required: false
  })
  @IsOptional()
  @IsEnum(['member', 'assistant_lead'])
  role?: string = 'member';
}
```

---

## 4️⃣ AVAILABILITY DTOs

### **CreateAvailabilityDto**
```typescript
// apps/api/src/modules/availability/dto/create-availability.dto.ts
import {
  IsUUID, IsOptional, IsDateString, IsEnum, IsArray, IsNumber,
  ValidateIf, Min, Max, ArrayMinSize, ArrayMaxSize
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityType } from '../enums/availability-type.enum';

export class CreateAvailabilityDto {
  @ApiProperty({ example: 'profile-uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  @ValidateIf(o => !o.teamId)
  profileId?: string;

  @ApiProperty({ example: 'team-uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  @ValidateIf(o => !o.profileId)
  teamId?: string;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString({}, { message: 'Format de date invalide (ISO 8601: YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({ example: '2025-10-31' })
  @IsDateString({}, { message: 'Format de date invalide (ISO 8601: YYYY-MM-DD)' })
  endDate: string;

  @ApiProperty({
    enum: AvailabilityType,
    example: AvailabilityType.AVAILABLE
  })
  @IsEnum(AvailabilityType)
  type: AvailabilityType;

  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: 'Jours de la semaine (1=Lundi, 7=Dimanche)',
    required: false,
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  daysOfWeek?: number[];

  @ApiProperty({ example: 8.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursPerDay?: number;

  @ApiProperty({ example: 'Disponible vendanges', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
```

---

## 5️⃣ JOBS DTOs

### **CreateJobDto**
```typescript
// apps/api/src/modules/jobs/dto/create-job.dto.ts
import {
  IsString, IsEnum, IsOptional, IsArray, IsNumber, IsDateString,
  IsEmail, IsPhoneNumber, Min, Max, MinLength, MaxLength, ValidateIf
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../enums/job-type.enum';
import { JobStatus } from '../enums/job-status.enum';
import { LocationDto } from '../../profiles/dto/create-profile.dto';

export class CreateJobDto {
  @ApiProperty({ example: 'Vendangeurs H/F - Domaine AOC' })
  @IsString()
  @MinLength(10, { message: 'Titre trop court (min 10 caractères)' })
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Recherche vendangeurs pour récolte...' })
  @IsString()
  @MinLength(50, { message: 'Description trop courte (min 50 caractères)' })
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: JobType, example: JobType.SEASONAL })
  @IsEnum(JobType, { message: 'Type de job invalide' })
  jobType: JobType;

  @ApiProperty({ example: 'vendanges', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 'Strasbourg' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '67000' })
  @IsString()
  @Matches(/^67\d{3}$/)
  postalCode: string;

  @ApiProperty({ example: '12 Route du Vin', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  location?: LocationDto;

  @ApiProperty({ example: '2025-09-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-10-10', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(1, { message: 'Au moins 1 travailleur requis' })
  @Max(100, { message: 'Maximum 100 travailleurs' })
  workersNeeded: number;

  @ApiProperty({
    example: ['viticulture', 'vendanges'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiProperty({
    example: ['CACES'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCertifications?: string[];

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  minExperience?: number;

  @ApiProperty({ example: 11.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  hourlyRateMin?: number;

  @ApiProperty({ example: 13.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ValidateIf(o => o.hourlyRateMin)
  hourlyRateMax?: number;

  @ApiProperty({ example: 'François Rocher', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @ApiProperty({ example: '+33388123456', required: false })
  @IsOptional()
  @IsPhoneNumber('FR')
  contactPhone?: string;

  @ApiProperty({ example: 'contact@ferme.fr', required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({
    enum: JobStatus,
    default: JobStatus.DRAFT,
    required: false
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus = JobStatus.DRAFT;
}
```

### **JobFilterDto**
```typescript
// apps/api/src/modules/jobs/dto/job-filter.dto.ts
import { IsOptional, IsEnum, IsString, IsNumber, IsDateString, Type } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../enums/job-type.enum';
import { JobStatus } from '../enums/job-status.enum';

export class JobFilterDto {
  @ApiProperty({ enum: JobStatus, default: JobStatus.PUBLISHED, required: false })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus = JobStatus.PUBLISHED;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ enum: JobType, required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minHourlyRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDistance?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  location?: { lat: number; lng: number };

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    enum: ['published', 'startDate', 'hourlyRate'],
    required: false
  })
  @IsOptional()
  @IsEnum(['published', 'startDate', 'hourlyRate'])
  sortBy?: string;
}
```

---

## 6️⃣ MATCHES DTOs

### **CreateMatchDto**
```typescript
// apps/api/src/modules/matches/dto/create-match.dto.ts
import { IsUUID, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiProperty({ example: 'job-uuid' })
  @IsUUID('4')
  jobId: string;

  @ApiProperty({
    example: 'profile-uuid',
    description: 'Worker profile ID (si employer initie)',
    required: false
  })
  @IsOptional()
  @IsUUID('4')
  @ValidateIf(o => !o.teamId)
  workerProfileId?: string;

  @ApiProperty({
    example: 'team-uuid',
    description: 'Team ID (alternative à workerProfileId)',
    required: false
  })
  @IsOptional()
  @IsUUID('4')
  @ValidateIf(o => !o.workerProfileId)
  teamId?: string;

  @ApiProperty({
    example: 'Disponible du 1er au 30 septembre',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
```

### **AcceptMatchDto**
```typescript
// apps/api/src/modules/matches/dto/accept-match.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptMatchDto {
  @ApiProperty({
    example: 'Parfait ! Rendez-vous le 15 septembre à 8h.',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
```

### **RejectMatchDto**
```typescript
export class RejectMatchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
```

---

## 7️⃣ REVIEWS DTOs

### **CreateReviewDto**
```typescript
// apps/api/src/modules/reviews/dto/create-review.dto.ts
import { IsUUID, IsNumber, IsOptional, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'match-uuid' })
  @IsUUID('4')
  matchId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1, { message: 'Rating minimum: 1 étoile' })
  @Max(5, { message: 'Rating maximum: 5 étoiles' })
  rating: number;

  @ApiProperty({ example: 'Excellent travailleur', required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: 'Jean a effectué un travail remarquable...',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Commentaire trop court (min 10 caractères)' })
  @MaxLength(2000)
  comment?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  punctualityRating?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationRating?: number;
}
```

---

## 8️⃣ SEARCH DTOs

### **SearchDto**
```typescript
// apps/api/src/modules/search/dto/search.dto.ts
import { IsString, IsOptional, IsEnum, IsNumber, MinLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({
    example: 'pomme vendanges strasbourg',
    description: 'Terme de recherche'
  })
  @IsString()
  @MinLength(2, { message: 'Recherche trop courte (min 2 caractères)' })
  q: string;

  @ApiProperty({
    enum: ['all', 'jobs', 'profiles', 'teams'],
    default: 'all',
    required: false
  })
  @IsOptional()
  @IsEnum(['all', 'jobs', 'profiles', 'teams'])
  type?: string = 'all';

  @ApiProperty({ required: false })
  @IsOptional()
  location?: { lat: number; lng: number };

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  maxDistance?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  filters?: {
    jobType?: string;
    profileType?: string;
    minRating?: number;
  };

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
```

---

## 9️⃣ ANALYTICS DTOs

### **TrackEventDto**
```typescript
// apps/api/src/modules/analytics/dto/track-event.dto.ts
import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty({
    example: 'whatsapp_click',
    description: 'Type d\'événement'
  })
  @IsString()
  @MaxLength(100)
  eventType: string;

  @ApiProperty({
    example: { profileId: 'uuid', jobId: 'uuid' },
    required: false
  })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;
}
```

---

## 🎨 ENUMS

### **ProfileType**
```typescript
// apps/api/src/modules/profiles/enums/profile-type.enum.ts
export enum ProfileType {
  WORKER = 'worker',
  TEAM_LEAD = 'team_lead',
  EMPLOYER = 'employer',
}
```

### **JobType**
```typescript
// apps/api/src/modules/jobs/enums/job-type.enum.ts
export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  SEASONAL = 'seasonal',
  TEMPORARY = 'temporary',
}
```

### **JobStatus**
```typescript
export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}
```

### **MatchStatus**
```typescript
export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}
```

### **AvailabilityType**
```typescript
export enum AvailabilityType {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  MAYBE = 'maybe',
}
```

---

## 🔧 CUSTOM VALIDATORS

### **IsAfterDate** (Custom Validator)
```typescript
// apps/api/src/common/validators/is-after-date.validator.ts
import {
  registerDecorator, ValidationOptions, ValidationArguments
} from 'class-validator';

export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return new Date(value) >= new Date(relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}

// Usage dans CreateJobDto:
@IsAfterDate('startDate', { message: 'endDate doit être après startDate' })
endDate?: string;
```

---

## 📝 GLOBAL VALIDATION PIPE

```typescript
// apps/api/src/main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip props non décorées
      forbidNonWhitelisted: true,   // Erreur si props inconnues
      transform: true,               // Auto transform (ex: string -> number)
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // Custom error formatting
        const messages = errors.map(error => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));

        return new BadRequestException({
          statusCode: 400,
          error: 'Validation failed',
          details: messages,
        });
      },
    }),
  );

  await app.listen(3001);
}
```

---

## ✅ EXEMPLES D'UTILISATION

### **Controller avec DTOs**
```typescript
// apps/api/src/modules/profiles/profiles.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileFilterDto } from './dto/profile-filter.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  @Post()
  @ApiOperation({ summary: 'Créer un profil' })
  @ApiResponse({ status: 201, description: 'Profil créé' })
  @ApiResponse({ status: 400, description: 'Validation échouée' })
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des profils avec filtres' })
  async findAll(@Query() filters: ProfileFilterDto) {
    return this.profilesService.findAll(filters);
  }
}
```

---

**Version**: 1.0
**Date**: 2025-12-25
