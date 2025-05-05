import express, { Request, Response } from 'express';
import { StaffController } from '../../controllers/admin/admin.StaffController';

const router = express.Router();

router.get('/', StaffController.getAllStaffs);
router.get('/:id', StaffController.findStaffById);
router.post('/', StaffController.addStaff);
router.put('/:id', StaffController.updateStaff);
router.put('/block/:id', StaffController.blockStaff);
router.put('/unblock/:id', StaffController.unblockStaff);
router.delete('/:id', StaffController.deleteStaff);
router.put('/resetpassword/:id', StaffController.resetStaffPassword);

export default router;