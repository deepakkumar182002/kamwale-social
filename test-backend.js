/**
 * Backend Testing Script
 * Tests database connectivity and API endpoints
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('\n🔍 Testing Database Connection...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Count existing data
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    
    console.log(`✅ Found ${userCount} users in database`);
    console.log(`✅ Found ${postCount} posts in database`);
    
    // Check if Post model has new fields
    const samplePost = await prisma.post.findFirst();
    if (samplePost) {
      console.log('\n📝 Sample Post Structure:');
      console.log('- Has postType field:', 'postType' in samplePost);
      console.log('- Has articleTitle field:', 'articleTitle' in samplePost);
      console.log('- Has pollOptions field:', 'pollOptions' in samplePost);
      console.log('- Has eventTitle field:', 'eventTitle' in samplePost);
      console.log('- Has richContent field:', 'richContent' in samplePost);
    } else {
      console.log('\n📝 No posts in database yet');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testPostCreation() {
  console.log('\n🔍 Testing Post Creation...\n');
  
  try {
    // Get first user for testing
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('⚠️  No users found. Please sign in first through the app.');
      return false;
    }
    
    console.log(`✅ Using test user: ${user.username || user.clerkId}`);
    
    // Test creating a text post
    const textPost = await prisma.post.create({
      data: {
        desc: 'Test text post - can be deleted',
        postType: 'text',
        userId: user.id,
      }
    });
    console.log('✅ Text post created:', textPost.id);
    
    // Test creating a poll post
    const pollPost = await prisma.post.create({
      data: {
        desc: 'Test poll - can be deleted',
        postType: 'poll',
        pollOptions: JSON.stringify(['Option A', 'Option B', 'Option C']),
        pollVotes: JSON.stringify({}),
        pollMultiple: false,
        pollShowVotes: true,
        pollEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userId: user.id,
      }
    });
    console.log('✅ Poll post created:', pollPost.id);
    
    // Test creating an event post
    const eventPost = await prisma.post.create({
      data: {
        desc: 'Test event - can be deleted',
        postType: 'event',
        eventTitle: 'Test Event',
        eventStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        eventEndDate: new Date(Date.now() + 25 * 60 * 60 * 1000),
        eventLocation: 'Online',
        eventType: 'virtual',
        eventRSVPs: JSON.stringify([]),
        userId: user.id,
      }
    });
    console.log('✅ Event post created:', eventPost.id);
    
    // Clean up test posts
    await prisma.post.delete({ where: { id: textPost.id } });
    await prisma.post.delete({ where: { id: pollPost.id } });
    await prisma.post.delete({ where: { id: eventPost.id } });
    console.log('✅ Test posts cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Post creation test failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

async function testCloudinaryConfig() {
  console.log('\n🔍 Testing Cloudinary Configuration...\n');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_API_KEY',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
  ];
  
  let allPresent = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
    } else {
      console.log(`❌ ${envVar} is MISSING`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('\n✅ All Cloudinary environment variables are configured');
    console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  }
  
  return allPresent;
}

async function testClerkConfig() {
  console.log('\n🔍 Testing Clerk Configuration...\n');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];
  
  let allPresent = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
    } else {
      console.log(`❌ ${envVar} is MISSING`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 KAMWALE SOCIAL - BACKEND DIAGNOSTIC TEST');
  console.log('═══════════════════════════════════════════════════');
  
  const dbSuccess = await testDatabaseConnection();
  const cloudinarySuccess = await testCloudinaryConfig();
  const clerkSuccess = await testClerkConfig();
  
  if (dbSuccess) {
    await testPostCreation();
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log('Database Connection:', dbSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('Cloudinary Config:', cloudinarySuccess ? '✅ PASS' : '❌ FAIL');
  console.log('Clerk Config:', clerkSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('═══════════════════════════════════════════════════\n');
  
  if (dbSuccess && cloudinarySuccess && clerkSuccess) {
    console.log('✅ ALL SYSTEMS OPERATIONAL - Ready to upload posts!');
    console.log('\n📝 To test posting:');
    console.log('1. Open http://localhost:3001');
    console.log('2. Sign in with Clerk');
    console.log('3. Click "Create Post" button');
    console.log('4. Try creating different post types (Photo, Video, Article, Poll, Event)');
  } else {
    console.log('⚠️  SOME ISSUES DETECTED - Check the errors above');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
