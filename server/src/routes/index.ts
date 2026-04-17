import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import cartRoutes from './cart.routes';
import addressRoutes from './address.routes';
import reviewRoutes from './review.routes';
import campaignRoutes from './campaign.routes';
import flashSaleRoutes from './flash-sale.routes';
import uploadRoutes from './upload.routes';
import seedRoutes from './seed.routes';
import statsRoutes from './stats.routes';
import postRoutes from './post.routes';
import fulfillmentRoutes from './fulfillment.routes';
import collectionRoutes from './collection.routes';
import sellerRoutes from './seller.routes';
import kybRoutes from './kyb.routes';

const router = Router();

// Auth routes (public)
router.use('/auth', authRoutes);

// API v1 routes
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/carts', cartRoutes);
router.use('/addresses', addressRoutes);
router.use('/reviews', reviewRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/flash-sales', flashSaleRoutes);
router.use('/upload', uploadRoutes);
router.use('/stats', statsRoutes);
router.use('/seed', seedRoutes);
router.use('/posts', postRoutes);
router.use('/fulfillment', fulfillmentRoutes);
router.use('/collections', collectionRoutes);
router.use('/sellers', sellerRoutes);
router.use('/kyb', kybRoutes);

export default router;

