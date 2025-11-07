// Script to verify and setup Cloudinary configuration
const https = require('https');

const CLOUD_NAME = 'dhavbpm5k';
const API_KEY = '246446497473538';

console.log('\n🔧 Cloudinary Configuration Check\n');
console.log('Cloud Name:', CLOUD_NAME);
console.log('API Key:', API_KEY ? '✅ Set' : '❌ Missing');

// Test 1: Try uploading with ml_default (unsigned preset that usually exists)
console.log('\n📤 Testing Upload with ml_default preset...\n');

const FormData = require('form-data');
const form = new FormData();

// 1x1 transparent PNG
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

form.append('file', testImage);
form.append('upload_preset', 'ml_default');

const options = {
  hostname: 'api.cloudinary.com',
  path: `/v1_1/${CLOUD_NAME}/image/upload`,
  method: 'POST',
  headers: form.getHeaders()
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log('✅ SUCCESS! Upload works with ml_default preset');
      console.log('Uploaded URL:', result.secure_url);
      console.log('\n✨ Your Cloudinary is working! All uploads should work now.\n');
    } else {
      console.log('❌ Upload failed with status:', res.statusCode);
      console.log('Response:', data);
      console.log('\n⚠️  Solution: Create unsigned preset in Cloudinary dashboard');
      console.log('Visit: https://console.cloudinary.com/settings/upload');
      console.log('1. Click "Add upload preset"');
      console.log('2. Name it: kamwale_unsigned');
      console.log('3. Set "Signing Mode" to: Unsigned');
      console.log('4. Set folder to: kamwale-social');
      console.log('5. Save\n');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error testing upload:', error.message);
});

form.pipe(req);
