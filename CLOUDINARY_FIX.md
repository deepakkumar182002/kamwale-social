# Cloudinary Upload Error - 400 Bad Request Fix

## Problem
```
api.cloudinary.com/v1_1/dhavbpm5k/image/upload:1  
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

## Root Cause
Upload preset `social_app` is **NOT** configured as **unsigned** in Cloudinary dashboard, isliye browser se direct upload fail ho raha hai.

## Solution Steps

### Option 1: Configure Unsigned Upload Preset (Recommended)

1. **Login to Cloudinary Dashboard**
   - Visit: https://console.cloudinary.com/
   - Login with your account

2. **Go to Upload Settings**
   - Navigate to: Settings → Upload
   - URL: https://console.cloudinary.com/settings/upload

3. **Create or Edit Upload Preset**
   - Scroll to "Upload presets" section
   - Click "Add upload preset" (or edit "social_app" if exists)
   - Set the following:
     - **Preset name**: `social_app`
     - **Signing mode**: **Unsigned** ⚠️ (This is critical!)
     - **Folder**: `kamwale-social` (optional, for organization)
     - **Access mode**: Public
     - **Unique filename**: true (recommended)
     - **Overwrite**: false (recommended)
   - Click **Save**

4. **Verify in Code**
   - Current upload preset in code: `social_app`
   - All components are already configured correctly

### Option 2: Use Default Preset (Quick Test)

If you want to test immediately, temporarily change upload preset to Cloudinary's default unsigned preset:

1. Go to: https://console.cloudinary.com/settings/upload
2. Look for any preset with "Unsigned" mode
3. Use that preset name (usually `ml_default` or similar)

### Option 3: Use Signed Uploads (Server-Side)

If you prefer server-side uploads with authentication:

1. Create API route `/api/cloudinary/signature`
2. Generate signature on server using `CLOUDINARY_API_SECRET`
3. Update `CldUploadWidget` to use signed mode

## Current Configuration

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhavbpm5k
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=social_app
NEXT_PUBLIC_CLOUDINARY_API_KEY=246446497473538
CLOUDINARY_API_SECRET=z3m5_AhbD4hbwMV4kY5yra67lSY
```

## Files Already Fixed

All components now use correct upload preset:
- ✅ `src/components/create-post/post-types/PhotoPost.tsx`
- ✅ `src/components/create-post/post-types/VideoPost.tsx`
- ✅ `src/components/create-post/post-types/ArticlePost.tsx`
- ✅ `src/components/create-post/post-types/EventPost.tsx`
- ✅ `src/components/StoryList.tsx`
- ✅ `src/components/rightMenu/UpdateUser.tsx`
- ✅ `src/components/CreatePostDropUp.tsx`

## How to Verify Fix

1. Complete Option 1 above (make preset unsigned)
2. Restart dev server: `npm run dev`
3. Try uploading an image
4. Check browser console - should see no 400 errors
5. Image should upload successfully to Cloudinary

## Common Mistakes to Avoid

❌ **Don't**: Use signed mode preset for browser uploads
❌ **Don't**: Forget to save preset after editing
❌ **Don't**: Use wrong cloud name in code
✅ **Do**: Set preset to UNSIGNED mode
✅ **Do**: Match preset name exactly in code
✅ **Do**: Test with small image first

## Testing Commands

```bash
# Check if uploads working
curl -X POST \
  https://api.cloudinary.com/v1_1/dhavbpm5k/image/upload \
  -F upload_preset=social_app \
  -F file=@test-image.jpg
```

## Need Help?

If still facing issues:
1. Check Cloudinary upload logs: https://console.cloudinary.com/console/lui/upload_history
2. Verify API key is correct
3. Ensure cloud name matches: `dhavbpm5k`
4. Check browser network tab for exact error message
