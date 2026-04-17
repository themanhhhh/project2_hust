require('reflect-metadata');
const { AppDataSource } = require('./src/data-source');
const { CollectionService } = require('./src/services/collection.service');

async function test() {
  await AppDataSource.initialize();
  const service = new CollectionService();
  
  const cid = '55d7428f-4a76-420e-8cbe-cf429169dca5';
  const pid = '5e88c91e-0b96-4eeb-84c8-557e2e148fff';
  
  try {
    const res = await service.update(cid, { productIds: [pid] });
    console.log('Update result products count:', res.products?.length);
    
    const { Client } = require('pg');
    const { parse } = require('pg-connection-string');
    const config = parse('postgres://postgres.udcekyfzmzqpwtxcuvla:Q4bw7gwdILylHGbQ@aws-1-ap-south-1.pooler.supabase.com:6543/postgres');
    const client = new Client(config);
    await client.connect();
    const rows = await client.query('SELECT * FROM product_collections');
    console.log('DB Rows:', rows.rows);
    await client.end();
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
