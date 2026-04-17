import 'reflect-metadata';
import { AppDataSource } from './src/data-source';
import { Collection } from './src/entities/Collection';

async function test() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Collection);
  
  const target = await repo.find({ relations: ['products', 'products.product_images'] });
  console.log('Result length:', target.length);
  target.forEach(t => {
     console.log(`Collection ${t.name}: ${t.products?.length} products`);
     if (t.products?.length > 0) console.log(t.products[0]);
  });
  
  process.exit(0);
}
test();
