import { api } from './config';

const LessonService = {
  async getLessons(params = {}) {
    const response = await api.get('/lessons', {
      params: {
        limit: 60,
        includeCaptions: false,
        ...params,
      },
    });

    // API trả về { success, data, meta, message }
    return response.data?.data ?? [];
  },

  async getLessonById(id) {
    if (!id) {
      throw new Error('Lesson id is required');
    }

    const response = await api.get(`/lessons/${id}`);
    return response.data?.data ?? response.data;
  },

  async getRelatedLessons({ topic, excludeId, limit = 6 }) {
    const lessons = await this.getLessons({ topic, limit });
    return lessons.filter((lesson) => lesson.id === Number(excludeId));
  },
};

export default LessonService;
