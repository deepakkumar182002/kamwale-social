# Quick Setup Guide - Post Types Feature

## 🚨 IMPORTANT: Database Update Required

The new post types feature requires database schema updates. Follow these steps:

### Step 1: Stop the Development Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Update Database Schema
```bash
npx prisma db push
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Restart Development Server
```bash
npm run dev
```

## ✅ What Works Now

### Rich Text Editor
- **Bold**: Select text → Click **B** button (adds `**text**`)
- **Italic**: Select text → Click *I* button (adds `*text*`)
- **Underline**: Select text → Click <u>U</u> button (adds `<u>text</u>`)
- **Bullet List**: Click • List button (adds `• ` at cursor)
- **Numbered List**: Click 1. List button (adds `1. ` at cursor)
- **Emoji**: Click 😀 button → Select emoji
- **Mention**: Type `@` → Search users → Select
- **Hashtag**: Type `#` → Add tag
- **Links**: Click 🔗 button → Enter URL

### Post Creation
All components are ready:
- ✅ Text Post
- ✅ Photo Post (with image upload)
- ✅ Video Post (with video upload)
- ✅ Article Post (with cover, title, reading time)
- ✅ Poll Post (with options, voting, duration)
- ✅ Event Post (with RSVP, location, date/time)

## 🐛 Current Status

**Before Database Update:**
- Post creation will fail with Prisma errors
- New fields (postType, article*, poll*, event*) don't exist yet

**After Database Update:**
- All post types will work ✅
- Rich text formatting will display ✅
- Poll voting and Event RSVP will function ✅

## 📝 How to Use Rich Text Editor

### Format Selected Text
1. Type some text: `Hello World`
2. Select the text with mouse
3. Click **B** for bold → Result: `**Hello World**`

### Add Lists
1. Click • List button
2. Type your list item
3. Press Enter and click • List again for next item

### Add Mentions
1. Type `@` anywhere in text
2. Start typing a username
3. Dropdown appears with suggestions
4. Click a user to mention them

### Add Hashtags
1. Type `#` anywhere in text
2. Start typing (e.g., `trending`)
3. Select from suggestions or create new

## 🎯 Testing After Database Update

1. **Text Post**: Click "What's on your mind?" → Type → Post
2. **Photo Post**: Click Photo icon → Upload images → Add description → Post
3. **Video Post**: Click Video icon → Upload video → Add description → Post
4. **Article Post**: Click Article tab → Add cover → Title → Content → Preview → Publish
5. **Poll Post**: Click Poll tab → Question → Add options → Settings → Create
6. **Event Post**: Click Event tab → Details → Date/Time → Location → Create

## 💡 Tips

- **Formatting**: Always SELECT text first, then click format button
- **Lists**: Click list button to add new list item
- **Mentions**: Type @ to trigger user search
- **Hashtags**: Type # to see suggestions
- **Images**: Drag & drop supported in photo posts
- **Videos**: Max 100MB, MP4/MOV/AVI formats
- **Articles**: Use preview mode before publishing
- **Polls**: 2-10 options, duration 1 day to 1 month
- **Events**: Can be Physical, Virtual, or Hybrid

## 🔧 Troubleshooting

### "Property does not exist on type" errors
→ Run `npx prisma generate` again

### "Failed to create post" with 500 error
→ Check if database is updated with `npx prisma db push`

### Formatting buttons don't seem to work
→ Make sure to SELECT text first, then click button
→ Check textarea for markdown syntax (**, *, <u>)

### API 404 errors
→ Restart dev server after database update

## 📚 File Structure

```
src/
├── components/
│   ├── create-post/
│   │   ├── CreatePostModal.tsx        ← Main modal
│   │   └── post-types/
│   │       ├── PhotoPost.tsx
│   │       ├── VideoPost.tsx
│   │       ├── ArticlePost.tsx
│   │       ├── PollPost.tsx
│   │       └── EventPost.tsx
│   ├── editor/
│   │   ├── RichTextEditor.tsx         ← Main editor
│   │   ├── EmojiPicker.tsx
│   │   ├── MentionDropdown.tsx
│   │   └── HashtagDropdown.tsx
│   ├── post-display/
│   │   ├── ArticlePostDisplay.tsx
│   │   ├── PollPostDisplay.tsx
│   │   └── EventPostDisplay.tsx
│   └── AddPost.tsx                     ← Updated
└── app/api/posts/
    ├── route.ts                        ← POST endpoint
    ├── [postId]/vote/route.ts          ← Poll voting
    └── [postId]/rsvp/route.ts          ← Event RSVP
```

## ✨ Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Rich Text Editor | ✅ Working | Markdown-based formatting |
| 5 Post Types | ⚠️ Needs DB | All components ready |
| Image Upload | ✅ Working | Via Cloudinary |
| Video Upload | ✅ Working | Via Cloudinary |
| Mentions | ✅ Working | With user search |
| Hashtags | ✅ Working | With suggestions |
| Emojis | ✅ Working | 100+ emojis |
| Links | ✅ Working | Markdown format |
| Poll Voting | ⚠️ Needs DB | API ready |
| Event RSVP | ⚠️ Needs DB | API ready |

---

**Next Steps:** 
1. Stop dev server
2. Run database commands
3. Restart server
4. Test all features! 🚀
