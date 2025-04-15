import { Router } from 'express';
import { BenefitsController } from '@/controllers/benefits-controller';
import { RequestHandler } from '@/types/express';

const benefitsController = new BenefitsController();
const router = Router();

router.get('/', benefitsController.getAll as RequestHandler);

router.get('/:id', benefitsController.getById as RequestHandler);

router.get('/comercio/:value', benefitsController.getByCommerce as RequestHandler);

export default router; 