import request from 'supertest';
import { createTestApp } from '@/__tests__/api/api-test-app.js';
import { Project } from '@/backend/db/models/project.model.js';
import { Page } from '@/backend/db/models/page.model.js';
import { randomInt } from 'crypto';

const app = createTestApp();

describe('Pages Routes', () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await Project.create({ name: 'Test Project' + randomInt(1000) });
    projectId = project._id.toString();
  });

  describe('POST /api/projects/:projectId/pages', () => {
    it('should create a page successfully', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/pages`)
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(201);
      expect(response.body.url).toBe('https://example.com');
      expect(response.body.projectId).toBe(projectId);
    });

    it('should return 400 for missing url', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/pages`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid projectId', async () => {
      const response = await request(app)
        .post('/api/projects/invalid/pages')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/projects/${fakeId}/pages`)
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(404);
    });

    it('should return 409 for duplicate url in project', async () => {
      await Page.create({ projectId, url: 'https://example.com' });

      const response = await request(app)
        .post(`/api/projects/${projectId}/pages`)
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/projects/:projectId/pages', () => {
    it('should return empty array when no pages', async () => {
      const response = await request(app).get(`/api/projects/${projectId}/pages`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return pages for project', async () => {
      const page1 = await Page.create({ projectId, url: 'https://page1.com' });
      const page2 = await Page.create({ projectId, url: 'https://page2.com' });

      const response = await request(app).get(`/api/projects/${projectId}/pages`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].url).toBe('https://page2.com'); // newer first
    });

    it('should return 400 for invalid projectId', async () => {
      const response = await request(app).get('/api/projects/invalid/pages');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/projects/:projectId/pages/:pageId', () => {
    it('should return page by id', async () => {
      const page = await Page.create({ projectId, url: 'https://example.com' });

      const response = await request(app).get(`/api/projects/${projectId}/pages/${page._id}`);
      expect(response.status).toBe(200);
      expect(response.body.url).toBe('https://example.com');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get(`/api/projects/${projectId}/pages/invalid`);
      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent page', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/projects/${projectId}/pages/${fakeId}`);
      expect(response.status).toBe(404);
    });

    it('should return 404 if page exists but wrong project', async () => {
      const otherProject = await Project.create({ name: 'Other Project' });
      const page = await Page.create({ projectId: otherProject._id, url: 'https://example.com' });

      const response = await request(app).get(`/api/projects/${projectId}/pages/${page._id}`);
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:projectId/pages/:pageId', () => {
    it("should delete page", async () => {
      const page = await Page.create({ projectId, url: "https://test.com" });

      const res = await request(app).delete(
        `/api/projects/${projectId}/pages/${page._id}`
      );

      expect(res.status).toBe(204);

      const exists = await Page.findById(page._id);
      expect(exists).toBeNull();
    });

    it("should return 400 for invalid pageId", async () => {
      const res = await request(app).delete(
        `/api/projects/${projectId}/pages/invalid`
      );

      expect(res.status).toBe(400);
    });

    it("should return 404 if page not found", async () => {
      const fakeId = '507f1f77bcf86cd788439011';

      const res = await request(app).delete(
        `/api/projects/${projectId}/pages/${fakeId}`
      );

      expect(res.status).toBe(404);
    });
  });

});