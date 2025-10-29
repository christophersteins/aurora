import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

async function updateLastSeen() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);

    // Get all users
    const allUsers = await usersService.findAll();

    console.log(`Found ${allUsers.length} total users`);

    let updatedCount = 0;

    // Update each user's lastSeen if it's not set
    for (const user of allUsers) {
      // Get the full user with all fields
      const fullUser = await usersService.findById(user.id);

      if (!fullUser) continue;

      // Check if lastSeen is not set
      if (!fullUser.lastSeen) {
        const lastSeenValue = fullUser.updatedAt || fullUser.createdAt;

        await usersService.updateUser(fullUser.id, {
          lastSeen: lastSeenValue,
          isOnline: false, // Ensure they're marked as offline
        });

        console.log(`Updated user ${fullUser.username || fullUser.email}: lastSeen set to ${lastSeenValue}`);
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} users`);
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await app.close();
  }
}

updateLastSeen();
