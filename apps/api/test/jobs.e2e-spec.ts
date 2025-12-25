import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { Profile, ProfileType } from '../src/modules/profiles/entities/profile.entity';
import {
  Job,
  JobStatus,
  JobDateType,
  JobTimeSlot,
} from '../src/modules/jobs/entities/job.entity';

describe('JobsController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let employerUser: User;
  let workerUser: User;
  let employerProfile: Profile;
  let workerProfile: Profile;
  let employerToken: string;
  let workerToken: string;
  let testJob: Job;

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
    await dataSource.query('TRUNCATE TABLE jobs CASCADE');
    await dataSource.query('TRUNCATE TABLE profiles CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await app.close();
  });

  async function seedTestData() {
    const userRepo = dataSource.getRepository(User);
    const profileRepo = dataSource.getRepository(Profile);
    const jobRepo = dataSource.getRepository(Job);

    // Create employer user
    employerUser = await userRepo.save({
      email: 'employer@example.com',
      phone: '+33612345100',
      phoneVerified: true,
      firstName: 'Sophie',
      lastName: 'Bernard',
    });

    // Create worker user
    workerUser = await userRepo.save({
      email: 'worker@example.com',
      phone: '+33612345101',
      phoneVerified: true,
      firstName: 'Jean',
      lastName: 'Dupont',
    });

    // Create employer profile
    employerProfile = await profileRepo.save({
      userId: employerUser.id,
      type: ProfileType.EMPLOYER,
      companyName: 'Vignobles du Rhin',
      siret: '12345678901234',
      city: 'Strasbourg',
      postalCode: '67000',
      isActive: true,
      isComplete: true,
      latitude: 48.5734,
      longitude: 7.7521,
    });

    // Create worker profile
    workerProfile = await profileRepo.save({
      userId: workerUser.id,
      type: ProfileType.WORKER,
      city: 'Obernai',
      postalCode: '67210',
      skills: ['viticulture', 'vendanges'],
      experienceYears: 5,
      isActive: true,
      isComplete: true,
    });

    // Create a test job
    testJob = await jobRepo.save({
      employerId: employerProfile.id,
      title: 'Vendanges Riesling 2024',
      description: 'Recherche 5 personnes pour vendanges',
      culture: 'Riesling',
      tags: ['vendanges', 'urgent'],
      requiredSkills: ['viticulture'],
      dateType: JobDateType.THIS_WEEK,
      timeSlot: JobTimeSlot.DAY,
      nbPeople: 5,
      latitude: 48.5734,
      longitude: 7.7521,
      address: '15 Route des Vins',
      city: 'Barr',
      postalCode: '67140',
      status: JobStatus.DRAFT,
      hourlyRate: 12.5,
      estimatedHours: 8,
      isUrgent: true,
      isActive: true,
    });

    // Generate JWT tokens (mock for testing)
    // In real scenario, use auth endpoints to get tokens
    employerToken = 'mock-employer-token';
    workerToken = 'mock-worker-token';
  }

  describe('POST /jobs/profiles/:profileId', () => {
    const createJobDto = {
      title: 'Cueillette de pommes',
      description: 'Recherche 3 personnes',
      culture: 'Pomme',
      tags: ['cueillette'],
      requiredSkills: ['arboriculture'],
      dateType: JobDateType.NEXT_WEEK,
      timeSlot: JobTimeSlot.MORNING,
      nbPeople: 3,
      latitude: 48.4623,
      longitude: 7.4817,
      city: 'Obernai',
      postalCode: '67210',
    };

    it('should create a job for an employer', async () => {
      // Note: In real E2E, use actual JWT token from auth endpoint
      const response = await request(app.getHttpServer())
        .post(`/jobs/profiles/${employerProfile.id}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send(createJobDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createJobDto.title);
      expect(response.body.status).toBe(JobStatus.DRAFT);
      expect(response.body.employerId).toBe(employerProfile.id);
    });

    it('should return 403 if user is not an employer', async () => {
      await request(app.getHttpServer())
        .post(`/jobs/profiles/${workerProfile.id}`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send(createJobDto)
        .expect(403);
    });

    it('should return 400 if validation fails', async () => {
      const invalidDto = {
        ...createJobDto,
        nbPeople: -1, // Invalid
      };

      await request(app.getHttpServer())
        .post(`/jobs/profiles/${employerProfile.id}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 if specific_date missing when required', async () => {
      const dtoWithoutDate = {
        ...createJobDto,
        dateType: JobDateType.SPECIFIC_DATE,
        // missing specificDate
      };

      await request(app.getHttpServer())
        .post(`/jobs/profiles/${employerProfile.id}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send(dtoWithoutDate)
        .expect(400);
    });
  });

  describe('GET /jobs', () => {
    it('should return all active jobs', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/jobs?status=${JobStatus.DRAFT}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((job: Job) => {
        expect(job.status).toBe(JobStatus.DRAFT);
      });
    });

    it('should filter by employerId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/jobs?employerId=${employerProfile.id}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((job: Job) => {
        expect(job.employerId).toBe(employerProfile.id);
      });
    });

    it('should filter by culture', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs?culture=Riesling')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should filter urgent jobs', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs?isUrgent=true')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((job: Job) => {
        expect(job.isUrgent).toBe(true);
      });
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return a job by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/jobs/${testJob.id}`)
        .expect(200);

      expect(response.body.id).toBe(testJob.id);
      expect(response.body.title).toBe(testJob.title);
      expect(response.body.employer).toBeDefined();
    });

    it('should return 404 if job not found', async () => {
      await request(app.getHttpServer())
        .get('/jobs/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('GET /jobs/profiles/:profileId/jobs', () => {
    it('should return jobs for an employer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/jobs/profiles/${employerProfile.id}/jobs`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((job: Job) => {
        expect(job.employerId).toBe(employerProfile.id);
      });
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get(`/jobs/profiles/${employerProfile.id}/jobs`)
        .expect(401);
    });
  });

  describe('PUT /jobs/:id', () => {
    it('should update a job', async () => {
      const updateDto = {
        title: 'Updated Title',
        nbPeople: 10,
      };

      const response = await request(app.getHttpServer())
        .put(`/jobs/${testJob.id}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
      expect(response.body.nbPeople).toBe(updateDto.nbPeople);
    });

    it('should return 403 if user is not the owner', async () => {
      await request(app.getHttpServer())
        .put(`/jobs/${testJob.id}`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ title: 'Hack' })
        .expect(403);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .put(`/jobs/${testJob.id}`)
        .send({ title: 'No Auth' })
        .expect(401);
    });
  });

  describe('PATCH /jobs/:id/status', () => {
    it('should transition from draft to published', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.PUBLISHED })
        .expect(200);

      expect(response.body.status).toBe(JobStatus.PUBLISHED);
      expect(response.body.publishedAt).toBeDefined();
    });

    it('should transition from published to in_contact', async () => {
      // First publish the job
      await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.PUBLISHED });

      // Then transition to in_contact
      const response = await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.IN_CONTACT })
        .expect(200);

      expect(response.body.status).toBe(JobStatus.IN_CONTACT);
    });

    it('should require reason for cancellation', async () => {
      await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.CANCELLED })
        .expect(400);
    });

    it('should cancel with reason', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          status: JobStatus.CANCELLED,
          reason: 'Mission annulée',
        })
        .expect(200);

      expect(response.body.status).toBe(JobStatus.CANCELLED);
      expect(response.body.cancellationReason).toBe('Mission annulée');
    });

    it('should return 400 for invalid transition', async () => {
      // Try to go directly from draft to completed (not allowed)
      await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.COMPLETED })
        .expect(400);
    });

    it('should return 403 if user is not the owner', async () => {
      await request(app.getHttpServer())
        .patch(`/jobs/${testJob.id}/status`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ status: JobStatus.PUBLISHED })
        .expect(403);
    });
  });

  describe('DELETE /jobs/:id', () => {
    it('should soft delete a draft job', async () => {
      // Create a new job to delete
      const newJob = await dataSource.getRepository(Job).save({
        employerId: employerProfile.id,
        title: 'Job to delete',
        culture: 'Test',
        dateType: JobDateType.TODAY,
        timeSlot: JobTimeSlot.DAY,
        nbPeople: 1,
        latitude: 48.5,
        longitude: 7.5,
        status: JobStatus.DRAFT,
        isActive: true,
      });

      await request(app.getHttpServer())
        .delete(`/jobs/${newJob.id}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      // Verify soft delete
      const deletedJob = await dataSource
        .getRepository(Job)
        .findOne({ where: { id: newJob.id } });
      expect(deletedJob.isActive).toBe(false);
    });

    it('should return 403 if user is not the owner', async () => {
      await request(app.getHttpServer())
        .delete(`/jobs/${testJob.id}`)
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(403);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete(`/jobs/${testJob.id}`)
        .expect(401);
    });
  });

  describe('Status transition workflow', () => {
    it('should follow complete workflow: draft -> published -> in_contact -> confirmed -> completed', async () => {
      // Create job (starts as draft)
      const createResponse = await request(app.getHttpServer())
        .post(`/jobs/profiles/${employerProfile.id}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Workflow Test Job',
          culture: 'Test',
          dateType: JobDateType.NEXT_WEEK,
          timeSlot: JobTimeSlot.DAY,
          nbPeople: 2,
          latitude: 48.5,
          longitude: 7.5,
        })
        .expect(201);

      const jobId = createResponse.body.id;
      expect(createResponse.body.status).toBe(JobStatus.DRAFT);

      // Publish
      const publishResponse = await request(app.getHttpServer())
        .patch(`/jobs/${jobId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.PUBLISHED })
        .expect(200);
      expect(publishResponse.body.status).toBe(JobStatus.PUBLISHED);

      // In contact
      const contactResponse = await request(app.getHttpServer())
        .patch(`/jobs/${jobId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.IN_CONTACT })
        .expect(200);
      expect(contactResponse.body.status).toBe(JobStatus.IN_CONTACT);

      // Confirmed
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/jobs/${jobId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.CONFIRMED })
        .expect(200);
      expect(confirmResponse.body.status).toBe(JobStatus.CONFIRMED);
      expect(confirmResponse.body.confirmedAt).toBeDefined();

      // Completed
      const completeResponse = await request(app.getHttpServer())
        .patch(`/jobs/${jobId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: JobStatus.COMPLETED })
        .expect(200);
      expect(completeResponse.body.status).toBe(JobStatus.COMPLETED);
      expect(completeResponse.body.completedAt).toBeDefined();
    });
  });
});
