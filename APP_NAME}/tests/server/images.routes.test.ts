import request from 'supertest';
import app from '../../server/server';

describe('Image Routes', () => {
  it('should return a 200 status for the health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should upload an image and return a detection result', async () => {
    const response = await request(app)
      .post('/api/detect')
      .attach('image', 'path/to/demo/image.jpg'); // Replace with a valid image path

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toEqual(expect.any(Object)); // Adjust based on expected structure
  });

  it('should return a 400 status for invalid image uploads', async () => {
    const response = await request(app)
      .post('/api/detect')
      .attach('image', 'path/to/invalid/image.txt'); // Replace with an invalid file type

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});