import prisma from '../lib/prisma';

export class CampaignService {
  async findAll() {
    return prisma.campaign.findMany({ orderBy: { starts_at: 'desc' } });
  }
  async findById(id: string) {
    return prisma.campaign.findUnique({ where: { id } });
  }
  async findByCode(code: string) {
    return prisma.campaign.findUnique({ where: { code } });
  }
  async findActiveCampaigns() {
    const now = new Date();
    return prisma.campaign.findMany({
      where: { is_active: true, starts_at: { lte: now }, ends_at: { gte: now } },
    });
  }
  async findActiveForHomepage() {
    return this.findActiveCampaigns();
  }
  async validateCampaign(code: string) {
    const campaign = await this.findByCode(code);
    if (!campaign) return { valid: false, message: 'Campaign not found' };
    const now = new Date();
    if (!campaign.is_active) return { valid: false, message: 'Campaign is not active' };
    if (campaign.starts_at && now < campaign.starts_at) return { valid: false, message: 'Campaign has not started yet' };
    if (campaign.ends_at && now > campaign.ends_at) return { valid: false, message: 'Campaign has expired' };
    if (campaign.usage_limit && campaign.used_count >= campaign.usage_limit) return { valid: false, message: 'Campaign usage limit reached' };
    return { valid: true, campaign, message: 'Campaign is valid' };
  }
  async create(data: any) {
    return prisma.campaign.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.campaign.update({ where: { id }, data });
  }
  async delete(id: string) {
    await prisma.campaign.delete({ where: { id } });
    return true;
  }
}
