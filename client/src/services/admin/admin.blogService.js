import config from '../config';
import axios from 'axios';

const API_URL = `${config.API_BASE_URL}/admin/blog`;

class BlogService {
  // Get all blogs with pagination and search
  async getAllBlogs() {
    try {
      const response = await axios.get(`${API_URL}`, {
        withCredentials: config.withCredentials,
      });
      // If the response has a data.data structure, return data.data, otherwise return data
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error in getAllBlogs:', error);
      throw error;
    }
  }

  // Get blog by ID
  async getBlogById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        withCredentials: config.withCredentials,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Add new blog
  async addBlog(blogData) {
    try {
      const formData = new FormData();
      
      // Add blog data
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      formData.append('author', blogData.author);
      
      // Add image URL if exists
      if (blogData.imageUrl) {
        formData.append('imageUrl', blogData.imageUrl);
      }

      const response = await axios.post(`${API_URL}`, {
        title: blogData.title,
        content: blogData.content,
        author: blogData.author,
        imageUrl: blogData.imageUrl
      }, {
        withCredentials: config.withCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in addBlog:', error);
      throw error;
    }
  }

  // Update blog
  async updateBlog(id, blogData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        title: blogData.title,
        content: blogData.content,
        author: blogData.author,
        imageUrl: blogData.imageUrl
      }, {
        withCredentials: config.withCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete blog
  async deleteBlog(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        withCredentials: config.withCredentials,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete multiple blogs
  async deleteMultipleBlogs(ids) {
    try {
      const response = await axios.post(`${API_URL}/delete-multiple`, { ids }, {
        withCredentials: config.withCredentials,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Upload Word document
  async uploadWordDocument(file) {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await axios.post(`${API_URL}/upload-document`, formData, {
        withCredentials: config.withCredentials,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const blogService = new BlogService();
export default blogService;