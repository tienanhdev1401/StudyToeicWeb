import database from '../../config/db';
import { Blog } from '../../models/Blog';

export class BlogRepository {
  /**
   * Lấy tất cả Blogs
   */
  static async getAllBlogs(): Promise<Blog[]> {
    const blogs = await database.query(
      'SELECT * FROM blogs ORDER BY createdAt DESC'
    );

    return blogs.map((blog: any) => new Blog(
      blog.id,
      blog.title,
      blog.content, 
      blog.imageUrl,
      blog.author,
      blog.createdAt,
      blog.updatedAt
    ));
  }

  /**
   * Thêm mới Blog
   */
  static async addBlog(title: string, content: string, imageUrl: string, author: string): Promise<Blog> {
    const currentDateTime = new Date();
    
    const result = await database.query(
      'INSERT INTO blogs (title, content, imageUrl, author, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, imageUrl, author, currentDateTime, currentDateTime]
    );
    const id = result.insertId;
    return new Blog(
      id,
      title,
      content,
      imageUrl,
      author, 
      currentDateTime,
      currentDateTime
    );
  }

  /**
   * Cập nhật Blog
   */
  static async updateBlog(id: number, title: string, content: string, imageUrl: string): Promise<Blog> {
    const currentDateTime = new Date();
    
    await database.query(
      'UPDATE blogs SET title = ?, content = ?, imageUrl = ?, updatedAt = ? WHERE id = ?',
      [title, content, imageUrl, currentDateTime, id]
    );

    const updatedBlog = await this.findById(id);
    if (!updatedBlog) {
      throw new Error('Blog not found after update');
    }

    return updatedBlog;
  }

  /**
   * Xóa Blog
   */
  static async deleteBlog(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM blogs WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  /**
   * Lấy Blog theo ID
   */
  static async findById(id: number): Promise<Blog | null> {
    const results = await database.query(
      'SELECT * FROM blogs WHERE id = ?',
      [id]
    );

    if (results.length === 0) {
      return null;
    }

    const blog = results[0];
    return new Blog(
      blog.id,
      blog.title,
      blog.content,
      blog.imageUrl,
      blog.author,
      blog.createdAt,
      blog.updatedAt
    );
  }
}