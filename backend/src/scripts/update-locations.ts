import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { GalleryPhoto } from '../users/entities/gallery-photo.entity';

dotenv.config();

const locations: { [key: string]: { latitude: number; longitude: number } } = {
  // Old escorts
  'anna_berlin': { latitude: 52.5200, longitude: 13.4050 },
  'maria_munich': { latitude: 48.1351, longitude: 11.5820 },
  'sophie_hamburg': { latitude: 53.5511, longitude: 9.9937 },
  'elena_cologne': { latitude: 50.9375, longitude: 6.9603 },
  'jasmin_frankfurt': { latitude: 50.1109, longitude: 8.6821 },
  'lisa_stuttgart': { latitude: 48.7758, longitude: 9.1829 },
  'nina_duesseldorf': { latitude: 51.2277, longitude: 6.7735 },
  'carmen_barcelona': { latitude: 41.3851, longitude: 2.1734 },
  'yuki_tokyo': { latitude: 35.6762, longitude: 139.6503 },
  'sarah_dortmund': { latitude: 51.5136, longitude: 7.4653 },
  'natasha_leipzig': { latitude: 51.3397, longitude: 12.3731 },
  'lena_hannover': { latitude: 52.3759, longitude: 9.7320 },
  'isabella_dresden': { latitude: 51.0504, longitude: 13.7373 },
  'mia_bremen': { latitude: 53.0793, longitude: 8.8017 },
  'alina_nuernberg': { latitude: 49.4521, longitude: 11.0767 },
  'julia_essen': { latitude: 51.4556, longitude: 7.0116 },
  'viktoria_freiburg': { latitude: 47.9990, longitude: 7.8421 },
  'laura_wiesbaden': { latitude: 50.0782, longitude: 8.2398 },
  'diana_bonn': { latitude: 50.7374, longitude: 7.0982 },
  'amira_duisburg': { latitude: 51.4344, longitude: 6.7623 },

  // New escorts
  'sofia_berlin': { latitude: 52.5200, longitude: 13.4050 },
  'emma_munich': { latitude: 48.1351, longitude: 11.5820 },
  'anna_frankfurt': { latitude: 50.1109, longitude: 8.6821 },
  'elena_koeln': { latitude: 50.9375, longitude: 6.9603 },
  'escort_lisa': { latitude: 48.7758, longitude: 9.1829 },
  'julia_hamburg': { latitude: 53.5511, longitude: 9.9937 },
  'kim_duesseldorf': { latitude: 51.2277, longitude: 6.7735 },
  'lara_dortmund': { latitude: 51.5136, longitude: 7.4653 },
  'lena_leipzig': { latitude: 51.3397, longitude: 12.3731 },
  'lisa_hannover': { latitude: 52.3759, longitude: 9.7320 },
  'maria_muenchen': { latitude: 48.1351, longitude: 11.5820 },
  'mia_dresden': { latitude: 51.0504, longitude: 13.7373 },
  'nina_bremen': { latitude: 53.0793, longitude: 8.8017 },
  'sarah_nuernberg': { latitude: 49.4521, longitude: 11.0767 },
  'sophie_essen': { latitude: 51.4556, longitude: 7.0116 },
  'valentina_freiburg': { latitude: 47.9990, longitude: 7.8421 },

  // Additional escorts found
  'escort1': { latitude: 52.5200, longitude: 13.4050 }, // Berlin
  'sarah_duesseldorf': { latitude: 51.2277, longitude: 6.7735 }, // Düsseldorf
  'lisa_bonn': { latitude: 50.7374, longitude: 7.0982 }, // Bonn
  'maria_berlin': { latitude: 52.5200, longitude: 13.4050 }, // Berlin
  'nina_frechen': { latitude: 50.9138, longitude: 6.8091 }, // Frechen (near Cologne)
};

async function updateLocations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'aurora_user',
    password: process.env.DB_PASSWORD || 'aurora_pw',
    database: process.env.DB_DATABASE || 'aurora_db',
    entities: [User, GalleryPhoto],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Verbindung zur Datenbank hergestellt');

    let updated = 0;

    for (const [username, coords] of Object.entries(locations)) {
      await dataSource.query(
        `UPDATE users SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE username = $3`,
        [coords.longitude, coords.latitude, username]
      );
      console.log(`✅ Standort aktualisiert für: ${username}`);
      updated++;
    }

    console.log(`\n🎉 Fertig! ${updated} Standorte aktualisiert.`);
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren:', error);
  } finally {
    await dataSource.destroy();
  }
}

updateLocations();
