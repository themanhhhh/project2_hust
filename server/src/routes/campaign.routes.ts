import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const campaignController = new CampaignController();

router.get('/', asyncHandler((req, res) => campaignController.findAll(req, res)));
router.get('/active', asyncHandler((req, res) => campaignController.findActiveCampaigns(req, res)));
router.get('/homepage', asyncHandler((req, res) => campaignController.findActiveForHomepage(req, res)));
router.get('/:id', asyncHandler((req, res) => campaignController.findById(req, res)));
router.get('/code/:code', asyncHandler((req, res) => campaignController.findByCode(req, res)));
router.get('/validate/:code', asyncHandler((req, res) => campaignController.validateCampaign(req, res)));
router.post('/', asyncHandler((req, res) => campaignController.create(req, res)));
router.post('/:id/products', asyncHandler((req, res) => campaignController.addProducts(req, res)));
router.put('/:id', asyncHandler((req, res) => campaignController.update(req, res)));
router.delete('/:id/products', asyncHandler((req, res) => campaignController.removeProducts(req, res)));
router.delete('/:id', asyncHandler((req, res) => campaignController.delete(req, res)));

export default router;
