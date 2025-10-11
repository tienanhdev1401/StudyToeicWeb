import { api } from './config';

const BlogService = {
  async getBlogs(params = {}) {
    const response = await api.get('/blog', {
      params: {
        limit: 6,
        ...params,
      },
    });

    const payload = response.data ?? {};
    return {
      data: payload.data ?? [],
      meta: payload.meta ?? null,
      message: payload.message ?? null,
    };
  },

  async getBlogById(id) {
    if (!id) {
      throw new Error('Blog id is required');
    }

    const response = await api.get(`/blog/${id}`);
    const payload = response.data ?? {};
    return payload.data ?? payload;
  },
};

export default BlogService;
