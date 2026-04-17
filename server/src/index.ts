import 'dotenv/config';
import dns from 'dns';
import express, { Express, Request, Response } from 'express';
import prisma from './lib/prisma';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

// Force DNS to prefer IPv4 over IPv6
dns.setDefaultResultOrder('ipv4first');

const app: Express = express();
const port = process.env.PORT || 3001;

// CORS configuration
const envOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS?.split(',').map((o) => o.trim()) || []),
].filter(Boolean);

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000', ...envOrigins];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'E-commerce API is running!', status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/v1', routes);
app.use(errorMiddleware);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to database!');
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

bootstrap();
export default app;
