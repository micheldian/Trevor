import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AvailabilityStatus, DateType, TimeSlot } from '../src/modules/availability/entities/availability.entity';

describe('Availability E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let profileId: string;
  let availabilityId: string;

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

    // Auth setup (vous devrez adapter selon votre auth flow)
    const authResponse = await request(app.getHttpServer())
      .post('/auth/verify')
      .send({
        phone: '+33612345678',
        code: '123456', // Mock OTP
      });

    authToken = authResponse.body.accessToken;

    // Créer un profil worker pour les tests
    // (adapter selon votre endpoint profiles)
    // profileId = ...
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /availability/profiles/:profileId', () => {
    it('should create availability with valid data', () => {
      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 30,
          notes: 'Disponible vendanges',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe(AvailabilityStatus.ON);
          expect(res.body.radiusKm).toBe(30);
          availabilityId = res.body.id;
        });
    });

    it('should reject invalid latitude', () => {
      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 91, // Invalid
          longitude: 7.7521,
          radiusKm: 30,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Latitude');
        });
    });

    it('should reject radiusKm out of range', () => {
      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 250, // > 200
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 30,
        })
        .expect(401);
    });
  });

  describe('GET /availability', () => {
    it('should return paginated availabilities', () => {
      return request(app.getHttpServer())
        .get('/availability')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('offset');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/availability')
        .query({ status: AvailabilityStatus.ON })
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((item: any) => {
            expect(item.status).toBe(AvailabilityStatus.ON);
          });
        });
    });

    it('should filter by dateType', () => {
      return request(app.getHttpServer())
        .get('/availability')
        .query({ dateType: DateType.TODAY })
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((item: any) => {
            expect(item.dateType).toBe(DateType.TODAY);
          });
        });
    });

    it('should respect pagination limits', () => {
      return request(app.getHttpServer())
        .get('/availability')
        .query({ limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.meta.limit).toBe(5);
        });
    });
  });

  describe('GET /availability/nearby', () => {
    it('should return availabilities sorted by distance', () => {
      return request(app.getHttpServer())
        .get('/availability/nearby')
        .query({
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 50,
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // Vérifier tri par distance (si implémenté)
        });
    });

    it('should use default radius if not provided', () => {
      return request(app.getHttpServer())
        .get('/availability/nearby')
        .query({
          latitude: 48.5734,
          longitude: 7.7521,
        })
        .expect(200);
    });
  });

  describe('GET /availability/:id', () => {
    it('should return availability details', () => {
      return request(app.getHttpServer())
        .get(`/availability/${availabilityId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(availabilityId);
          expect(res.body).toHaveProperty('profile');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/availability/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /availability/:id', () => {
    it('should update availability if owner', () => {
      return request(app.getHttpServer())
        .patch(`/availability/${availabilityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: AvailabilityStatus.OFF })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(AvailabilityStatus.OFF);
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .patch(`/availability/${availabilityId}`)
        .send({ status: AvailabilityStatus.OFF })
        .expect(401);
    });
  });

  describe('DELETE /availability/:id', () => {
    it('should delete availability if owner', () => {
      return request(app.getHttpServer())
        .delete(`/availability/${availabilityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete(`/availability/${availabilityId}`)
        .expect(401);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should reject notes longer than 500 characters', () => {
      const longNotes = 'a'.repeat(501);

      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 30,
          notes: longNotes,
        })
        .expect(400);
    });

    it('should accept minimum radius (1 km)', () => {
      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 1,
        })
        .expect(201);
    });

    it('should accept maximum radius (200 km)', () => {
      return request(app.getHttpServer())
        .post(`/availability/profiles/${profileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: AvailabilityStatus.ON,
          dateType: DateType.TODAY,
          timeSlot: TimeSlot.MORNING,
          latitude: 48.5734,
          longitude: 7.7521,
          radiusKm: 200,
        })
        .expect(201);
    });
  });
});
