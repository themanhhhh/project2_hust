import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { CampaignService } from '../services/campaign.service';

export class CampaignController extends BaseController {
  private campaignService: CampaignService;

  constructor() {
    const campaignService = new CampaignService();
    super(campaignService);
    this.campaignService = campaignService;
  }

  async findByCode(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    const campaign = await this.campaignService.findByCode(code);
    res.json({
      success: true,
      data: campaign,
    });
  }

  async findActiveCampaigns(req: Request, res: Response): Promise<void> {
    const campaigns = await this.campaignService.findActiveCampaigns();
    res.json({
      success: true,
      data: campaigns,
    });
  }

  async findActiveForHomepage(req: Request, res: Response): Promise<void> {
    const campaigns = await this.campaignService.findActiveForHomepage();
    res.json({
      success: true,
      data: campaigns,
    });
  }

  async validateCampaign(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    const result = await this.campaignService.validateCampaign(code);
    res.json({
      success: true,
      data: result,
    });
  }

  async addProducts(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: 'Not implemented in current version' });
  }

  async removeProducts(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: 'Not implemented in current version' });
  }
}
