import 'reflect-metadata';
import { AppDataSource } from './src/data-source';
import { Collection } from './src/entities/Collection';

async function seedCollections() {
  console.log('🌱 Starting collections seed...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const collectionRepo = AppDataSource.getRepository(Collection);

    // Clear existing collections if needed
    // await collectionRepo.clear();

    const collections = await collectionRepo.save([
      {
        name: 'Viktor Axelsen',
        slug: 'viktor-axelsen',
        country: 'Denmark',
        sport: "Men's Singles",
        achievement: 'Olympic Gold Medalist',
        description: 'Bộ sưu tập các dòng sản phẩm Yonex Astrox được Viktor Axelsen tin dùng.',
        is_active: true
      },
      {
        name: 'An Se-young',
        slug: 'an-se-young',
        country: 'South Korea',
        sport: "Women's Singles",
        achievement: 'World Champion',
        description: 'Sự lựa chọn hoàn hảo cho sự linh hoạt và bền bỉ như An Se-young.',
        is_active: true
      },
      {
        name: 'Fajar Alfian',
        slug: 'fajar-alfian',
        country: 'Indonesia',
        sport: "Men's Doubles",
        achievement: 'World Tour Finals Winner',
        description: 'Sức mạnh và tốc độ của những cú smash thần sầu từ đôi nam số 1 thế giới.',
        is_active: true
      }
    ]);

    console.log(`✅ Created ${collections.length} collections successfully!`);
  } catch (error) {
    console.error('❌ Error during seeding collections:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

seedCollections();
