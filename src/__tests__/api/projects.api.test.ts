import request from 'supertest';
import { createTestApp } from '@/__tests__/api/api-test-app.js';
import { Project } from '@/backend/db/models/project.model.js';

const app = createTestApp();

describe('Projects Routes', () => {
  describe('POST /api/projects', () => {
    it('should create a project successfully', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Project');
      expect(response.body.type).toBe('custom'); // default
      expect(response.body._id).toBeDefined();
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate name', async () => {
      await Project.create({ name: 'Duplicate Project' });

      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Duplicate Project' });

      expect(response.status).toBe(409);
    });

    it('should enforce unique project name at the model level', async () => {
      await Project.create({ name: 'Unique Project' });
      await expect(Project.create({ name: 'Unique Project' })).rejects.toThrow();
    });
  });

  describe('GET /api/projects', () => {
    it('should return empty array when no projects', async () => {
      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return projects sorted by createdAt desc', async () => {
      const project1 = await Project.create({ name: 'Project 1' });
      const project2 = await Project.create({ name: 'Project 2' });

      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Project 2'); // newer first
      expect(response.body[1].name).toBe('Project 1');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return project by id', async () => {
      const project = await Project.create({ name: 'Test Project' });

      const response = await request(app).get(`/api/projects/${project._id}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Project');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/api/projects/invalid');
      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/projects/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });
});