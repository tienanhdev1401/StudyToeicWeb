import express from 'express';
import { BlogController } from '../../controllers/admin/admin.blogController';

const router = express.Router();

// GET /api/admin/blogs - Lấy tất cả blogs
router.get('/', BlogController.getAllBlogs);

// GET /api/admin/blogs/:id - Lấy blog theo ID  
router.get('/:id', BlogController.findBlogById);

// POST /api/admin/blogs - Thêm mới blog
router.post('/', BlogController.addBlog);

// PUT /api/admin/blogs/:id - Cập nhật blog
router.put('/:id', BlogController.updateBlog);

// DELETE /api/admin/blogs/:id - Xóa blog 
router.delete('/:id', BlogController.deleteBlog);

export default router;