# Advanced Multi-Type Posting Feature - KAMWALE Social

## 🎉 Overview

This implementation adds a comprehensive, LinkedIn-style posting system with **5 different post types**, each with rich editing capabilities and user-friendly features.

## 📝 Post Types

### 1. **Text Post** 
Simple text-based posts with rich formatting

### 2. **Photo Post** 📸
- Multiple image upload (up to 10 images)
- Drag and drop support
- Image preview grid
- Individual image captions
- Remove/reorder images

### 3. **Video Post** 🎥
- Video upload (up to 100MB)
- Video preview player
- Duration and size display
- Supports MP4, MOV, AVI formats

### 4. **Article Post** 📰
- Cover image upload
- Article title (up to 150 characters)
- Rich text content editor
- Reading time calculation
- Preview mode before publishing
- Professional article layout

### 5. **Poll Post** 📊
- 2-10 poll options
- Duration selector (1 day to 1 month)
- Multiple choice option
- Show/hide results setting
- Visual progress bars
- Voting functionality
- Poll expiration handling

### 6. **Event Post** 📅
- Event cover image
- Event title
- Start and end date/time
- Location or virtual meeting link
- Event type (Physical/Virtual/Hybrid)
- RSVP functionality
- Attendee count
- Event description with rich text

## ✨ Rich Text Editor Features

All post types include a powerful rich text editor with:

### Formatting Options
- **Bold**, *Italic*, <u>Underline</u>
- Bullet lists and numbered lists
- Multiple text formatting options

### Interactive Elements
- **@ Mentions** - Tag other users (with autocomplete search)
- **# Hashtags** - Add trending hashtags (with suggestions)
- **🎨 Emoji Picker** - 100+ emojis organized in a picker
- **🔗 Link Insertion** - Add clickable links with custom text
- Link preview with domain name

### Smart Features
- Real-time character count (3000 character limit)
- Auto-save drafts (coming soon)
- Responsive design for all screen sizes

## 🏗️ Architecture

### Components Structure

```
src/components/
├── create-post/
│   ├── CreatePostModal.tsx          # Main modal with tabs
│   └── post-types/
│       ├── PhotoPost.tsx
│       ├── VideoPost.tsx
│       ├── ArticlePost.tsx
│       ├── PollPost.tsx
│       └── EventPost.tsx
├── editor/
│   ├── RichTextEditor.tsx           # Main editor component
│   ├── EmojiPicker.tsx
│   ├── MentionDropdown.tsx
│   └── HashtagDropdown.tsx
├── post-display/
│   ├── ArticlePostDisplay.tsx       # Article view component
│   ├── PollPostDisplay.tsx          # Poll with voting
│   └── EventPostDisplay.tsx         # Event with RSVP
├── AddPost.tsx                       # Quick post button
└── feed/
    └── Post.tsx                      # Updated to display all types
```

### Database Schema

The Post model has been extended with:

```prisma
model Post {
  // ... existing fields ...
  postType    String   @default("text")
  richContent Json?
  updatedAt   DateTime @updatedAt
  
  // Article fields
  articleTitle       String?
  articleCoverImage  String?
  articleReadingTime Int?
  
  // Poll fields
  pollOptions    Json?
  pollEndsAt     DateTime?
  pollVotes      Json?
  pollMultiple   Boolean   @default(false)
  pollShowVotes  Boolean   @default(true)
  
  // Event fields
  eventTitle       String?
  eventStartDate   DateTime?
  eventEndDate     DateTime?
  eventLocation    String?
  eventType        String?
  eventCoverImage  String?
  eventRSVPs       Json?
}
```

### API Routes

#### POST `/api/posts`
Creates a new post of any type with validation

**Request Body:**
```json
{
  "desc": "Post content",
  "postType": "text|photo|video|article|poll|event",
  "img": "image_url",
  "video": "video_url",
  // Article fields
  "articleTitle": "Article Title",
  "articleCoverImage": "image_url",
  "articleReadingTime": 5,
  // Poll fields
  "pollOptions": ["Option 1", "Option 2"],
  "pollEndsAt": "2025-12-31T00:00:00Z",
  "pollMultiple": false,
  "pollShowVotes": true,
  // Event fields
  "eventTitle": "Event Name",
  "eventStartDate": "2025-12-01T10:00:00Z",
  "eventEndDate": "2025-12-01T18:00:00Z",
  "eventLocation": "Location or URL",
  "eventType": "physical|virtual|hybrid",
  "eventCoverImage": "image_url"
}
```

#### POST `/api/posts/[postId]/vote`
Submit a vote on a poll

#### POST `/api/posts/[postId]/rsvp`
RSVP to an event

## 🎨 User Interface

### Create Post Flow

1. Click on "What's on your mind?" or any post type button
2. Modal opens with tabs for each post type
3. Switch between tabs to change post type
4. Fill in content with rich text editor
5. Add media/options specific to post type
6. Preview (for articles)
7. Publish

### Display Features

- **Responsive Design** - Works on mobile, tablet, desktop
- **Modern UI** - Clean, LinkedIn-inspired interface
- **Smooth Animations** - Transitions and loading states
- **Accessibility** - Keyboard navigation, ARIA labels
- **Dark Mode Ready** - All components support dark theme

## 🚀 Usage

### Creating a Post

```tsx
import CreatePostModal from '@/components/create-post/CreatePostModal';

// In your component
<CreatePostModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onPostCreated={handleRefresh}
  initialType="photo" // Optional: text, photo, video, article, poll, event
/>
```

### Displaying Posts

The `Post` component automatically detects and renders the appropriate layout:

```tsx
import Post from '@/components/feed/Post';

<Post post={postData} />
```

## 🔧 Configuration

### Environment Variables

Make sure you have Cloudinary configured for media uploads:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Cloudinary Upload Preset

The app uses the `kamwale` upload preset. Make sure it's configured in your Cloudinary dashboard.

## 📱 Features by Post Type

| Feature | Text | Photo | Video | Article | Poll | Event |
|---------|------|-------|-------|---------|------|-------|
| Rich Text Editor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mentions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hashtags | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Emojis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Links | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Media Upload | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Multiple Images | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cover Image | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Preview Mode | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Options/Choices | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Date/Time Picker | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Location | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| RSVP/Voting | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

## 🐛 Known Issues & TODO

### To Complete:
1. ⚠️ **Database Migration** - Run `npx prisma db push` after closing the dev server
2. ⚠️ **Generate Prisma Client** - Run `npx prisma generate` after closing dev server
3. 📝 **Edit Post Functionality** - Add ability to edit existing posts
4. 🔄 **Post Analytics** - View counts, engagement metrics
5. 🔔 **Notifications** - Notify mentioned users, event attendees
6. 💾 **Draft Saving** - Auto-save drafts locally
7. 📤 **Share Options** - Share to other platforms
8. 🖼️ **Image Editing** - Crop, filter, adjust images before upload

### Known Limitations:
- Prisma client needs regeneration for new schema fields to work
- Poll voting and Event RSVP APIs need database update to function
- Multiple image upload saves only first image currently

## 🎯 Testing Checklist

Before using, ensure:
- [ ] Database schema is updated (`prisma db push`)
- [ ] Prisma client is generated (`prisma generate`)
- [ ] Cloudinary is configured
- [ ] All post type icons exist in `/public`
- [ ] API routes are accessible
- [ ] User authentication is working

## 💡 Tips

1. **Stop the dev server** before running Prisma commands
2. **Test each post type** individually after database update
3. **Check console** for any upload or API errors
4. **Use preview mode** in article posts before publishing
5. **Set reasonable poll durations** for better engagement

## 📚 Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Cloudinary Upload](https://cloudinary.com/documentation)
- [Clerk Authentication](https://clerk.com/docs)

---

Created with ❤️ for KAMWALE Social Platform
