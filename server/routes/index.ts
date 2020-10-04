import { Router } from 'express';
import HomeRoutes from './home.route';

const router = Router();

router.use('/', HomeRoutes);

export default router;
