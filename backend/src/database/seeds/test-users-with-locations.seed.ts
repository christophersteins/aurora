import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

export async function seedTestUsersWithLocations(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // Test-User mit Standorten in deutschen Städten
  const testUsers = [
    {
      email: 'elena.koeln@test.de',
      username: 'elena_koeln',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Elena',
      lastName: 'Müller',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(6.9603 50.9375)', // Köln
      height: 168,
      bodyType: 'Schlank',
      hairColor: 'Blond',
    },
    {
      email: 'sarah.duesseldorf@test.de',
      username: 'sarah_duesseldorf',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Sarah',
      lastName: 'Schmidt',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(6.7735 51.2277)', // Düsseldorf
      height: 172,
      bodyType: 'Athletisch',
      hairColor: 'Braun',
    },
    {
      email: 'lisa.bonn@test.de',
      username: 'lisa_bonn',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Lisa',
      lastName: 'Weber',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(7.0982 50.7374)', // Bonn
      height: 165,
      bodyType: 'Kurvig',
      hairColor: 'Rot',
    },
    {
      email: 'anna.frankfurt@test.de',
      username: 'anna_frankfurt',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Anna',
      lastName: 'Hoffmann',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(8.6821 50.1109)', // Frankfurt
      height: 170,
      bodyType: 'Normal',
      hairColor: 'Schwarz',
    },
    {
      email: 'maria.berlin@test.de',
      username: 'maria_berlin',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Maria',
      lastName: 'Fischer',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(13.405 52.52)', // Berlin
      height: 175,
      bodyType: 'Schlank',
      hairColor: 'Blond',
    },
    {
      email: 'julia.nahbei@test.de',
      username: 'julia_nahbei',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Julia',
      lastName: 'Becker',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(6.1514 50.9146)', // ~3 km von deinem Standort
      height: 163,
      bodyType: 'Normal',
      hairColor: 'Braun',
    },
    {
      email: 'nina.frechen@test.de',
      username: 'nina_frechen',
      password: await bcrypt.hash('Test123!', 10),
      firstName: 'Nina',
      lastName: 'Klein',
      role: UserRole.ESCORT,
      location: 'SRID=4326;POINT(6.3474 50.9250)', // ~15 km von deinem Standort
      height: 169,
      bodyType: 'Schlank',
      hairColor: 'Blond',
    },
  ];

  console.log('🌱 Seeding test users with locations...');

  for (const userData of testUsers) {
    // Prüfe ob User bereits existiert
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          ...user,
          location: () => `ST_GeomFromText('${userData.location}')`,
        })
        .execute();

      console.log(`✅ Created user: ${userData.username} (${userData.firstName}) in location`);
    } else {
      console.log(`⏭️  User already exists: ${userData.username}`);
    }
  }

  console.log('✅ Seeding complete!');
}