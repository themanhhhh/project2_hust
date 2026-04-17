import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { AddressService } from '../services/address.service';

export class AddressController extends BaseController {
  private addressService: AddressService;

  constructor() {
    const addressService = new AddressService();
    super(addressService);
    this.addressService = addressService;
  }

  async findByUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const addresses = await this.addressService.findByUser(userId);
    res.json({
      success: true,
      data: addresses,
    });
  }

  async findDefaultAddress(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const address = await this.addressService.getDefault(userId);
    res.json({
      success: true,
      data: address,
    });
  }
}
