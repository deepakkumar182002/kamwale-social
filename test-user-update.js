// Test script to manually update user
import prisma from './src/lib/client.js';

async function testUserUpdate() {
  try {
    // Get current users
    const users = await prisma.user.findMany();
    console.log('Current users:', users);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('Updating user:', user.id);
      
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { username: 'test-updated-username' }
      });
      
      console.log('Updated user:', updated);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserUpdate();
