import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const uploadController = new UploadController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload single image (general purpose)
router.post(
  '/image',
  authenticate,
  upload.single('image'),
  asyncHandler((req, res) => uploadController.uploadImage(req, res))
);

// Upload image for a product
router.post(
  '/product/:productId/image',
  authenticate,
  upload.single('image'),
  asyncHandler((req, res) => uploadController.uploadProductImage(req, res))
);

// Get all images for a product (public)
router.get(
  '/product/:productId/images',
  asyncHandler((req, res) => uploadController.getProductImages(req, res))
);

// Delete product image
router.delete(
  '/product-image/:imageId',
  authenticate,
  asyncHandler((req, res) => uploadController.deleteProductImage(req, res))
);

export default router;
