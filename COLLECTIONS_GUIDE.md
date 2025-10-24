# 📚 Collections/Favorites System Guide

## Overview
The Collections system allows users to save, organize, and manage their favorite repositories into custom collections.

## Features

### ✨ Core Features
- **Create Collections** - Organize repos into custom collections
- **Add/Remove Repos** - Easily manage repos in collections
- **Edit Collections** - Update names and descriptions
- **Delete Collections** - Remove collections you no longer need
- **Export Collections** - Download all collections as JSON
- **Quick Access** - Heart icon on every repo card

### 🎯 User Benefits
- Never lose track of interesting repos
- Organize repos by project, technology, or purpose
- Quick access to frequently used repos
- Share collections with team members (via export)

## How to Use

### Creating a Collection

1. **From Collections Page:**
   - Click "Collections" in navbar
   - Click "New Collection" button
   - Enter name (e.g., "React Dashboards")
   - Add optional description
   - Click "Create Collection"

2. **While Adding a Repo:**
   - Click heart icon on any repo card
   - Click "Create New Collection"
   - Enter collection name
   - Repo is automatically added

### Adding Repos to Collections

1. Find a repo you want to save
2. Click the **heart icon** (❤️) on the repo card
3. Select one or more collections
4. Repo is instantly added (checkmark appears)

### Managing Collections

**View Collections:**
- Navigate to `/collections` page
- See all your collections in the left sidebar
- Click a collection to view its repos

**Edit Collection:**
- Click the edit icon (✏️) on a collection
- Update name or description
- Click "Save Changes"

**Delete Collection:**
- Click the trash icon (🗑️) on a collection
- Confirm deletion
- Collection and its contents are removed

**Remove Repo from Collection:**
- Open the collection
- Click heart icon on repo card
- Uncheck the collection
- Repo is removed

### Exporting Collections

1. Go to Collections page
2. Click "Export All" button
3. JSON file downloads with all collections
4. Share with team or backup

**Export Format:**
```json
{
  "exportedAt": "2024-10-23T...",
  "user": "user@example.com",
  "collections": [
    {
      "name": "React Dashboards",
      "description": "Best React admin dashboards",
      "repos": [...],
      "createdAt": "2024-10-20T..."
    }
  ]
}
```

## API Endpoints

### Get All Collections
```
GET /api/collections
```
Returns all collections for authenticated user.

### Create Collection
```
POST /api/collections
Body: { name: string, description?: string }
```

### Get Single Collection
```
GET /api/collections/[id]
```

### Update Collection
```
PUT /api/collections/[id]
Body: { name?: string, description?: string, isPublic?: boolean }
```

### Delete Collection
```
DELETE /api/collections/[id]
```

### Add Repo to Collection
```
POST /api/collections/[id]/repos
Body: { repo: RepoObject }
```

### Remove Repo from Collection
```
DELETE /api/collections/[id]/repos
Body: { repoFullName: string }
```

### Export Collections
```
GET /api/collections/export
```
Downloads JSON file with all collections.

## Database Schema

### Collections Collection
```typescript
{
  _id: ObjectId,
  email: string,           // User email
  name: string,            // Collection name
  description: string,     // Optional description
  repos: Array<RepoObject>, // Array of repo objects
  isPublic: boolean,       // Future: public sharing
  createdAt: Date,
  updatedAt: Date
}
```

### Repo Object Structure
```typescript
{
  full_name: string,       // "owner/repo"
  name: string,
  description: string,
  html_url: string,
  stargazers_count: number,
  forks_count: number,
  language: string,
  topics: string[],
  // ... other GitHub repo fields
}
```

## Components

### AddToCollectionModal
**Location:** `components/AddToCollectionModal.tsx`

Modal that appears when clicking heart icon on repo card.

**Features:**
- Shows all user collections
- Create new collection inline
- Add/remove repo from multiple collections
- Visual feedback (checkmarks)

**Props:**
```typescript
{
  repo: RepoObject,
  onClose: () => void
}
```

### Collections Page
**Location:** `pages/collections.tsx`

Main page for managing collections.

**Features:**
- List all collections
- Create/edit/delete collections
- View collection contents
- Export all collections

## Integration Points

### RepoCard Component
- Added heart icon button (only visible when logged in)
- Opens AddToCollectionModal on click
- Shows pink color on hover

### Navbar
- Added "Collections" link in navigation
- Added "Collections" in user dropdown menu
- Cyan color theme matching Repoza design system

### MongoDB Backend
- Added collection CRUD functions
- Efficient queries with indexes
- Proper error handling

## Future Enhancements

### Planned Features
1. **Public Collections** - Share collections with others
2. **Collection Templates** - Pre-made collections for common use cases
3. **Collaborative Collections** - Team members can contribute
4. **Collection Analytics** - Track most popular repos
5. **Smart Collections** - Auto-add repos based on criteria
6. **Collection Tags** - Additional organization layer
7. **Import Collections** - Import from JSON file
8. **Collection Search** - Search within collections
9. **Bulk Operations** - Add multiple repos at once
10. **Collection Sharing Links** - Direct links to public collections

### Technical Improvements
- Add pagination for large collections
- Implement collection search
- Add sorting options (by stars, date added, etc.)
- Cache collection data for performance
- Add collection cover images
- Implement drag-and-drop reordering

## Troubleshooting

### Heart Icon Not Showing
- **Issue:** Heart icon doesn't appear on repo cards
- **Solution:** Make sure you're logged in. Icon only shows for authenticated users.

### Can't Add Repo to Collection
- **Issue:** Error when adding repo
- **Solution:** Check MongoDB connection. Ensure user is authenticated.

### Collections Not Loading
- **Issue:** Collections page shows loading forever
- **Solution:** Check MongoDB connection and API endpoint `/api/collections`

### Export Not Working
- **Issue:** Export button doesn't download file
- **Solution:** Check browser permissions for downloads. Try different browser.

## Best Practices

### Naming Collections
- Use descriptive names: "React Admin Dashboards" not "Stuff"
- Be specific: "Next.js E-commerce Templates" not "Templates"
- Use categories: "Learning - Python", "Work - APIs"

### Organizing Repos
- Create collections by technology, purpose, or project
- Don't create too many collections (5-15 is ideal)
- Use descriptions to clarify collection purpose
- Regularly review and clean up collections

### Performance Tips
- Keep collections under 50 repos for best performance
- Export collections regularly as backup
- Delete unused collections

## Security

### Authentication
- All endpoints require authentication
- Users can only access their own collections
- Session-based authentication via NextAuth

### Data Privacy
- Collections are private by default
- No public access without explicit sharing (future feature)
- User email is used as identifier

## Testing

### Manual Testing Checklist
- [ ] Create new collection
- [ ] Add repo to collection
- [ ] Remove repo from collection
- [ ] Edit collection name/description
- [ ] Delete collection
- [ ] Export collections
- [ ] View collection contents
- [ ] Add repo to multiple collections
- [ ] Create collection while adding repo

### API Testing
```bash
# Get collections
curl -X GET http://localhost:3000/api/collections \
  -H "Cookie: next-auth.session-token=..."

# Create collection
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"name":"Test Collection","description":"Testing"}'

# Add repo to collection
curl -X POST http://localhost:3000/api/collections/[id]/repos \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"repo":{...}}'
```

## Summary

The Collections/Favorites system is a powerful feature that helps users:
- ✅ Save interesting repos for later
- ✅ Organize repos by category or purpose
- ✅ Never lose track of important projects
- ✅ Share collections with team members
- ✅ Build a personal library of resources

It's fully integrated with the existing Repoza features and provides a seamless user experience!
