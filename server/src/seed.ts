import 'dotenv/config';
import prisma from './lib/prisma';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (respecting FK constraints)
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.flashSaleProduct.deleteMany();
    await prisma.flashSale.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.address.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.user.deleteMany();

    // ============================================
    // CATEGORIES
    // ============================================
    console.log('📁 Seeding categories...');
    const [catRacket, catShoes, catClothes, catAccessories, catBags, catShuttlecock] = await Promise.all([
      prisma.category.create({ data: { name: 'Vợt cầu lông', slug: 'vot-cau-long' } }),
      prisma.category.create({ data: { name: 'Giày cầu lông', slug: 'giay-cau-long' } }),
      prisma.category.create({ data: { name: 'Quần áo cầu lông', slug: 'quan-ao-cau-long' } }),
      prisma.category.create({ data: { name: 'Phụ kiện', slug: 'phu-kien' } }),
      prisma.category.create({ data: { name: 'Túi đựng vợt', slug: 'tui-dung-vot' } }),
      prisma.category.create({ data: { name: 'Cầu lông', slug: 'cau-long' } }),
    ]);
    console.log('✅ Created 6 categories');

    // ============================================
    // BRANDS
    // ============================================
    console.log('🏷️  Seeding brands...');
    const [brandYonex, brandVictor, brandLining] = await Promise.all([
      prisma.brand.create({ data: { name: 'Yonex', slug: 'yonex', logo_url: '/brands/yonex.png' } }),
      prisma.brand.create({ data: { name: 'Victor', slug: 'victor', logo_url: '/brands/victor.png' } }),
      prisma.brand.create({ data: { name: 'Lining', slug: 'lining', logo_url: '/brands/lining.png' } }),
    ]);
    await Promise.all([
      prisma.brand.create({ data: { name: 'Mizuno', slug: 'mizuno', logo_url: '/brands/mizuno.png' } }),
      prisma.brand.create({ data: { name: 'Kawasaki', slug: 'kawasaki', logo_url: '/brands/kawasaki.png' } }),
      prisma.brand.create({ data: { name: 'Apacs', slug: 'apacs', logo_url: '/brands/apacs.png' } }),
    ]);
    console.log('✅ Created 6 brands');

    // ============================================
    // PRODUCTS
    // ============================================
    console.log('🏸 Seeding products...');
    const products = await Promise.all([
      // Yonex Rackets
      prisma.product.create({ data: { name: 'Yonex Astrox 100 ZZ', slug: 'yonex-astrox-100-zz', sku: 'YNX-AX100ZZ', price: 4500000, original_price: 5200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 25, badge: 'bestseller', rating: 4.9 } }),
      prisma.product.create({ data: { name: 'Yonex Nanoflare 800 Pro', slug: 'yonex-nanoflare-800-pro', sku: 'YNX-NF800P', price: 4200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 30, badge: 'new', rating: 4.8 } }),
      prisma.product.create({ data: { name: 'Yonex Arcsaber 11 Pro', slug: 'yonex-arcsaber-11-pro', sku: 'YNX-AS11P', price: 3800000, original_price: 4200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 20, badge: 'sale', rating: 4.7 } }),
      prisma.product.create({ data: { name: 'Yonex Duora 10', slug: 'yonex-duora-10', sku: 'YNX-D10', price: 3500000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 15, badge: 'none', rating: 4.6 } }),
      // Victor Rackets
      prisma.product.create({ data: { name: 'Victor Thruster K Falcon', slug: 'victor-thruster-k-falcon', sku: 'VCT-TKF', price: 3200000, original_price: 3800000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 18, badge: 'sale', rating: 4.5 } }),
      prisma.product.create({ data: { name: 'Victor Auraspeed 90K', slug: 'victor-auraspeed-90k', sku: 'VCT-AS90K', price: 4000000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 22, badge: 'new', rating: 4.7 } }),
      prisma.product.create({ data: { name: 'Victor DriveX 9X', slug: 'victor-drivex-9x', sku: 'VCT-DX9X', price: 2800000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 35, badge: 'bestseller', rating: 4.6 } }),
      // Lining
      prisma.product.create({ data: { name: 'Lining Aeronaut 9000', slug: 'lining-aeronaut-9000', sku: 'LN-AN9000', price: 3600000, original_price: 4000000, category_id: catRacket.id, brand_id: brandLining.id, stock_quantity: 20, badge: 'sale', rating: 4.5 } }),
      prisma.product.create({ data: { name: 'Lining N7 II Light', slug: 'lining-n7-ii-light', sku: 'LN-N7IIL', price: 2500000, category_id: catRacket.id, brand_id: brandLining.id, stock_quantity: 40, badge: 'none', rating: 4.3 } }),
      // Shoes
      prisma.product.create({ data: { name: 'Yonex Power Cushion 65 Z3', slug: 'yonex-power-cushion-65-z3', sku: 'YNX-PC65Z3', price: 3200000, category_id: catShoes.id, brand_id: brandYonex.id, stock_quantity: 50, badge: 'bestseller', rating: 4.8 } }),
      prisma.product.create({ data: { name: 'Yonex Aerus Z', slug: 'yonex-aerus-z', sku: 'YNX-AZ', price: 3800000, original_price: 4200000, category_id: catShoes.id, brand_id: brandYonex.id, stock_quantity: 30, badge: 'sale', rating: 4.9 } }),
      prisma.product.create({ data: { name: 'Victor A922', slug: 'victor-a922', sku: 'VCT-A922', price: 2800000, category_id: catShoes.id, brand_id: brandVictor.id, stock_quantity: 45, badge: 'new', rating: 4.6 } }),
      prisma.product.create({ data: { name: 'Lining Ranger TD', slug: 'lining-ranger-td', sku: 'LN-RTD', price: 2200000, original_price: 2600000, category_id: catShoes.id, brand_id: brandLining.id, stock_quantity: 60, badge: 'sale', rating: 4.4 } }),
      // Clothes
      prisma.product.create({ data: { name: 'Yonex Men Polo Shirt 2024', slug: 'yonex-men-polo-shirt-2024', sku: 'YNX-MPS24', price: 850000, category_id: catClothes.id, brand_id: brandYonex.id, stock_quantity: 100, badge: 'new', rating: 4.5 } }),
      prisma.product.create({ data: { name: 'Victor Women Dress 2024', slug: 'victor-women-dress-2024', sku: 'VCT-WD24', price: 950000, original_price: 1100000, category_id: catClothes.id, brand_id: brandVictor.id, stock_quantity: 80, badge: 'sale', rating: 4.6 } }),
      // Accessories
      prisma.product.create({ data: { name: 'Yonex Grip Tape AC102', slug: 'yonex-grip-tape-ac102', sku: 'YNX-GT-AC102', price: 45000, category_id: catAccessories.id, brand_id: brandYonex.id, stock_quantity: 500, badge: 'bestseller', rating: 4.7 } }),
      prisma.product.create({ data: { name: 'Yonex String BG65', slug: 'yonex-string-bg65', sku: 'YNX-BG65', price: 120000, category_id: catAccessories.id, brand_id: brandYonex.id, stock_quantity: 300, badge: 'bestseller', rating: 4.8 } }),
      // Bags
      prisma.product.create({ data: { name: 'Yonex Pro Racquet Bag 9pcs', slug: 'yonex-pro-racquet-bag-9pcs', sku: 'YNX-PRB9', price: 2500000, original_price: 2800000, category_id: catBags.id, brand_id: brandYonex.id, stock_quantity: 25, badge: 'sale', rating: 4.7 } }),
      prisma.product.create({ data: { name: 'Victor Backpack BR9012', slug: 'victor-backpack-br9012', sku: 'VCT-BP9012', price: 1200000, category_id: catBags.id, brand_id: brandVictor.id, stock_quantity: 40, badge: 'none', rating: 4.5 } }),
      // Shuttlecocks
      prisma.product.create({ data: { name: 'Yonex Aerosensa 50', slug: 'yonex-aerosensa-50', sku: 'YNX-AS50', price: 480000, category_id: catShuttlecock.id, brand_id: brandYonex.id, stock_quantity: 200, badge: 'bestseller', rating: 4.9 } }),
      prisma.product.create({ data: { name: 'Victor Gold Champion', slug: 'victor-gold-champion', sku: 'VCT-GC', price: 380000, original_price: 420000, category_id: catShuttlecock.id, brand_id: brandVictor.id, stock_quantity: 150, badge: 'sale', rating: 4.6 } }),
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Product images for first 10 products
    await Promise.all(
      products.slice(0, 10).flatMap(p => [
        prisma.productImage.create({ data: { product_id: p.id, image_url: `/products/${p.slug}-1.jpg`, is_primary: true, sort_order: 0 } }),
        prisma.productImage.create({ data: { product_id: p.id, image_url: `/products/${p.slug}-2.jpg`, is_primary: false, sort_order: 1 } }),
      ])
    );
    console.log('✅ Created product images');

    // ============================================
    // USERS
    // ============================================
    console.log('👤 Seeding users...');
    const hash = '$2a$10$QWWPdNlZZ6CNhOqjKg5fZuHLZqVjXdGxRH7VfKfKpqPZk.hEqgBi.';
    const [admin, u1, u2, u3, u4] = await Promise.all([
      prisma.user.create({ data: { email: 'admin@badshop.com', password_hash: hash, name: 'Admin User', phone: '0901234567', role: 'admin' } }),
      prisma.user.create({ data: { email: 'nguyen.van.a@gmail.com', password_hash: hash, name: 'Nguyễn Văn A', phone: '0912345678' } }),
      prisma.user.create({ data: { email: 'tran.thi.b@gmail.com', password_hash: hash, name: 'Trần Thị B', phone: '0923456789' } }),
      prisma.user.create({ data: { email: 'le.van.c@gmail.com', password_hash: hash, name: 'Lê Văn C', phone: '0934567890' } }),
      prisma.user.create({ data: { email: 'pham.thi.d@gmail.com', password_hash: hash, name: 'Phạm Thị D', phone: '0945678901' } }),
    ]);
    console.log('✅ Created 5 users');

    // Addresses
    await Promise.all([
      prisma.address.create({ data: { user_id: u1.id, full_name: 'Nguyễn Văn A', phone: '0912345678', address_line: '123 Nguyễn Huệ, Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', is_default: true } }),
      prisma.address.create({ data: { user_id: u2.id, full_name: 'Trần Thị B', phone: '0923456789', address_line: '789 Trần Hưng Đạo', city: 'Hà Nội', district: 'Hoàn Kiếm', is_default: true } }),
    ]);

    // Reviews
    await Promise.all([
      prisma.review.create({ data: { user_id: u1.id, product_id: products[0].id, rating: 5, comment: 'Vợt tuyệt vời! Rất hài lòng.' } }),
      prisma.review.create({ data: { user_id: u2.id, product_id: products[0].id, rating: 5, comment: 'Sản phẩm chính hãng, giao hàng nhanh.' } }),
      prisma.review.create({ data: { user_id: u3.id, product_id: products[1].id, rating: 4, comment: 'Vợt nhẹ, đánh tấn công tốt.' } }),
    ]);
    console.log('✅ Created reviews');

    // Campaigns
    const now = new Date();
    await Promise.all([
      prisma.campaign.create({ data: { name: 'Giảm giá mùa hè', code: 'SUMMER2024', discount_type: 'percentage', discount_value: 10, starts_at: now, ends_at: new Date(now.getTime() + 30 * 86400000) } }),
      prisma.campaign.create({ data: { name: 'Khách hàng mới', code: 'NEWUSER', discount_type: 'fixed_amount', discount_value: 100000, starts_at: now, ends_at: new Date(now.getTime() + 90 * 86400000) } }),
    ]);
    console.log('✅ Created campaigns');

    // Flash sales
    const fs1 = await prisma.flashSale.create({ data: { name: 'Flash Sale Cuối Tuần', starts_at: now, ends_at: new Date(now.getTime() + 2 * 86400000) } });
    await Promise.all([
      prisma.flashSaleProduct.create({ data: { flash_sale_id: fs1.id, product_id: products[0].id, sale_price: 3900000, quantity: 10 } }),
      prisma.flashSaleProduct.create({ data: { flash_sale_id: fs1.id, product_id: products[4].id, sale_price: 2700000, quantity: 15 } }),
    ]);
    console.log('✅ Created flash sales');

    // Orders
    const o1 = await prisma.order.create({ data: { order_number: 'ORD-2024-0001', user_id: u1.id, total: 4500000, status: 'delivered', payment_status: 'paid', is_verified: true } });
    const o2 = await prisma.order.create({ data: { order_number: 'ORD-2024-0002', user_id: u2.id, total: 7000000, status: 'shipping', payment_status: 'paid', is_verified: true } });
    const o3 = await prisma.order.create({ data: { order_number: 'ORD-2024-0003', user_id: u1.id, total: 3200000, status: 'confirmed', payment_status: 'paid', is_verified: true } });

    await Promise.all([
      prisma.orderItem.create({ data: { order_id: o1.id, product_id: products[0].id, price: 4500000, quantity: 1 } }),
      prisma.orderItem.create({ data: { order_id: o2.id, product_id: products[1].id, price: 4200000, quantity: 1 } }),
      prisma.orderItem.create({ data: { order_id: o2.id, product_id: products[9].id, price: 2800000, quantity: 1 } }),
      prisma.orderItem.create({ data: { order_id: o3.id, product_id: products[9].id, price: 3200000, quantity: 1 } }),
    ]);
    console.log('✅ Created orders with items');

    console.log('\n🎉 Database seed completed successfully!');
    console.log(`📊 Products: ${products.length} | Users: 5 | Orders: 3`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seed();
