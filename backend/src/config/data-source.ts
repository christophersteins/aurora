import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { GalleryPhoto } from '../users/entities/gallery-photo.entity';
import { Message } from '../chat/entities/message.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Waitlist } from '../waitlist/entities/waitlist.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'aurora_user',
  password: process.env.DB_PASSWORD || 'aurora_password',
  database: process.env.DB_DATABASE || 'aurora_db',
  entities: [User, GalleryPhoto, Message, Conversation, Waitlist],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true, // Hilfreich für Debugging
});