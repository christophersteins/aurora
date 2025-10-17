import { DataSource } from 'typeorm';
import { seedTestUsersWithLocations } from './test-users-with-locations.seed';
import * as dotenv from 'dotenv';

// Lade .env Datei
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'aurora_user',
  password: process.env.DB_PASSWORD || 'aurora_pw',
  database: process.env.DB_DATABASE || 'aurora_db',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  logging: false,
});

async function runSeed() {
  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_DATABASE}`);
    console.log(`   Username: ${process.env.DB_USERNAME}`);
    
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    await seedTestUsersWithLocations(AppDataSource);

    await AppDataSource.destroy();
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();