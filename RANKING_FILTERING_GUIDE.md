# 🎯 Advanced Ranking & Filtering System - Complete Guide

## Overview
Repoza now features an intelligent ranking and filtering system powered by AI that helps users find the most relevant repositories based on their search intent, not just popularity metrics.

## 🧠 How It Works

### 1. Backend Ranking Logic

When a user searches for something like "Next.js authentication boilerplate":

#### Step 1: Query Parsing
- Gemini AI extracts:
  - Technologies: `["Next.js", "authentication"]`
  - Purpose: `"authentication boilerplate"`
  - Keywords: `["nextjs", "authentication", "boilerplate"]`
  - Language: `"JavaScript"` or `"TypeScript"`

#### Step 2: GitHub API Search
- Fetches repositories matching keywords
- Gets 20 results per page for better AI analysis

#### Step 3: AI Relevance Calculation
For each repository, Gemini AI calculates a **semantic relevance score (0-1)**:
- Analyzes repo name, description, and topics
- Compares against search query intent
- Returns score:
  - `1.0` = Perfect match
  - `0.7-0.9` = Very relevant
  - `0.4-0.6` = Somewhat relevant
  - `0.1-0.3` = Barely relevant
  - `0.0` = Not relevant

#### Step 4: Custom Scoring Formula
Each repo gets a composite score based on multiple factors:

```typescript
score = 
  (stars_weight * log10(stars + 1) * 10) +
  (forks_weight * log10(forks + 1) * 5) +
  (recency_weight * recency_score) +
  (language_match_weight * language_bonus) +
  (topic_matches * 8) +
  (description_matches * 5) +
  (name_matches * 10) +
  (ai_relevance_weight * ai_score * 100) -
  (issues_penalty)
```

**Default Weights:**
- Stars: `0.7`
- Forks: `0.4`
- Last Updated: `0.5`
- Language Match: `0.3`
- AI Relevance: `0.8`
- Issues: `0.2`

#### Step 5: Sorting & Filtering
- Repos are sorted by custom score
- Language filter applied if selected
- Results returned to frontend

---

## 💻 Frontend Features

### Filter & Sort UI

Located below the search bar, users can:

#### 1. **Language Filter**
- Dropdown showing all languages from search results
- Options: All Languages, JavaScript, TypeScript, Python, etc.
- Dynamically populated based on results

#### 2. **Sort Options**
- 🎯 **Custom Score** (default) - Uses AI + popularity + relevance
- 🤖 **AI Relevance** - Sorts by semantic match only
- ⭐ **Stars (High to Low)** - Most popular first
- ⭐ **Stars (Low to High)** - Hidden gems first
- 🍴 **Forks (High to Low)** - Most forked first
- 🕒 **Recently Updated** - Latest activity first

#### 3. **AI Toggle**
- Enable/disable AI relevance scoring
- When OFF: Uses traditional metrics only
- When ON: Includes semantic analysis (slower but smarter)

#### 4. **Active Filters Display**
- Shows currently applied filters
- "Clear all" button to reset
- Visual badges for each active filter

---

## 🎨 Visual Indicators

### Repository Cards Show:

1. **Language Badge** - Programming language
2. **AI Match Badge** - Green badge showing relevance percentage
   - Example: "🌟 85% match"
3. **Custom Score** - Top-right corner shows composite score
4. **Topics** - GitHub topics as tags
5. **Stars & Forks** - Popularity metrics

---

## 🔄 User Flow Example

### Scenario: User searches for "React authentication"

1. **Initial Search**
   - User types "React authentication"
   - Clicks Search
   - Backend fetches 20 repos from GitHub

2. **AI Processing**
   - Gemini calculates relevance for each repo
   - Repo A: "react-auth-kit" → 95% match
   - Repo B: "awesome-react" → 40% match
   - Repo C: "react-login-system" → 90% match

3. **Custom Scoring**
   - Repo A: 5000 stars, 95% AI → Score: 1250
   - Repo B: 30000 stars, 40% AI → Score: 980
   - Repo C: 800 stars, 90% AI → Score: 1100

4. **Results Displayed**
   - Order: A, C, B (by custom score)
   - Each shows AI match percentage
   - Filter UI shows: JavaScript, TypeScript, Python

5. **User Filters**
   - Selects "TypeScript" language
   - Changes sort to "AI Relevance"
   - Results re-fetch and re-rank

6. **New Results**
   - Only TypeScript repos shown
   - Sorted purely by AI relevance
   - Repo C (90%) appears first

---

## ⚙️ Admin Configuration

Admins can tune ranking weights in `/admin`:

### Ranking Weights Tab

Adjust sliders (0-1) for:
- **Stars** - How much popularity matters
- **Last Updated** - Importance of recent activity
- **Language Match** - Exact language match bonus
- **Forks** - Fork count weight
- **Issues** - Penalty for many open issues
- **AI Relevance** - Semantic match importance

**Example Configurations:**

**For Beginners (Popular Projects):**
```
Stars: 0.9
AI Relevance: 0.3
Language Match: 0.5
```

**For Experts (Best Match):**
```
Stars: 0.3
AI Relevance: 0.9
Language Match: 0.7
```

**Balanced (Default):**
```
Stars: 0.7
AI Relevance: 0.8
Language Match: 0.3
```

---

## 🚀 API Endpoints

### POST `/api/search`

**Request Body:**
```json
{
  "query": "Next.js authentication",
  "page": 1,
  "sortOption": "custom",
  "languageFilter": "TypeScript",
  "useAI": true
}
```

**Response:**
```json
{
  "repositories": [
    {
      "id": 123,
      "full_name": "owner/repo",
      "name": "repo",
      "description": "...",
      "stargazers_count": 5000,
      "forks_count": 800,
      "language": "TypeScript",
      "topics": ["nextjs", "auth"],
      "score": 1250,
      "aiRelevance": 0.95
    }
  ],
  "parsedQuery": {
    "technologies": ["Next.js", "authentication"],
    "purpose": "authentication system",
    "keywords": ["nextjs", "authentication"],
    "language": "TypeScript"
  },
  "total": 1500,
  "page": 1,
  "perPage": 12,
  "hasMore": true,
  "availableLanguages": ["JavaScript", "TypeScript", "Python"],
  "appliedFilters": {
    "language": "TypeScript",
    "sort": "custom"
  }
}
```

---

## 🧪 Testing the System

### Test Case 1: AI Relevance

1. Search: "MERN stack blog"
2. Enable AI toggle
3. Observe AI match percentages
4. Sort by "AI Relevance"
5. Verify most relevant repos appear first

### Test Case 2: Language Filtering

1. Search: "authentication"
2. Note available languages
3. Select "TypeScript"
4. Verify only TypeScript repos shown
5. Change to "Python"
6. Verify results update

### Test Case 3: Sort Options

1. Search: "react components"
2. Try each sort option:
   - Custom Score
   - AI Relevance
   - Stars (High to Low)
   - Stars (Low to High)
   - Forks
   - Recently Updated
3. Verify order changes correctly

### Test Case 4: AI Toggle

1. Search: "machine learning"
2. Note results with AI ON
3. Toggle AI OFF
4. Observe different ranking
5. Compare scores

---

## 📊 Performance Considerations

### AI Relevance Calculation

**Batch Processing:**
- Processes 5 repos at a time
- 500ms delay between batches
- Prevents API rate limits

**Fallback Logic:**
- If Gemini fails, uses keyword matching
- Calculates simple relevance score
- Ensures system always works

**Caching (Future Enhancement):**
- Cache AI scores for 24 hours
- Reduce API calls
- Faster subsequent searches

---

## 🎯 Benefits

### For Users

1. **Better Results** - Find exactly what they need
2. **Flexible Sorting** - Multiple ways to view results
3. **Language Filtering** - Focus on preferred tech stack
4. **AI Insights** - See why repos are relevant
5. **Transparency** - Scores visible on cards

### For Platform

1. **Differentiation** - Unique AI-powered search
2. **User Satisfaction** - More relevant results
3. **Engagement** - Users explore more repos
4. **Data** - Track which filters are popular
5. **Monetization** - Premium AI features possible

---

## 🔮 Future Enhancements

### Phase 1 - Advanced Filters
- [ ] Star range filter (e.g., 1k-10k stars)
- [ ] Date range filter (updated in last X days)
- [ ] License filter (MIT, Apache, etc.)
- [ ] Size filter (small, medium, large projects)

### Phase 2 - Saved Filters
- [ ] Save filter presets
- [ ] Quick filter buttons
- [ ] Per-user default filters
- [ ] Share filter configurations

### Phase 3 - AI Enhancements
- [ ] Explain why repo is relevant
- [ ] Suggest similar repos
- [ ] Compare repos side-by-side
- [ ] AI-generated summaries

### Phase 4 - Analytics
- [ ] Track popular filters
- [ ] A/B test ranking algorithms
- [ ] User feedback on relevance
- [ ] Improve AI model over time

---

## 🐛 Troubleshooting

### AI scores not showing?
- Check if `useAI` is enabled
- Verify Gemini API key is set
- Check browser console for errors
- Try disabling and re-enabling AI toggle

### Filters not working?
- Ensure language is in available list
- Try clearing filters and reapplying
- Check network tab for API errors
- Verify backend is receiving filter params

### Slow search results?
- AI relevance adds 2-5 seconds
- Disable AI for faster results
- Check Gemini API rate limits
- Consider caching implementation

### Scores seem wrong?
- Adjust weights in `/admin`
- Check if AI relevance is enabled
- Verify repo data is complete
- Review ranking formula

---

## 📝 Technical Details

### Files Modified/Created

**Backend:**
- `backend/gemini.ts` - AI relevance calculation
- `backend/ranker.ts` - Enhanced scoring & sorting
- `pages/api/search.ts` - Filter & sort integration

**Frontend:**
- `components/FilterSort.tsx` - Filter/sort UI
- `components/RepoCard.tsx` - AI badge display
- `pages/index.tsx` - Filter state management

**Documentation:**
- `RANKING_FILTERING_GUIDE.md` - This file

### Dependencies

No new dependencies required! Uses existing:
- `@google/generative-ai` - For AI relevance
- `axios` - For API calls
- `lucide-react` - For icons

---

## ✨ Key Takeaways

1. **AI-Powered** - Semantic relevance, not just keywords
2. **Flexible** - Multiple sort and filter options
3. **Transparent** - Scores and relevance visible
4. **Configurable** - Admins can tune weights
5. **Fast** - Batch processing and fallbacks
6. **User-Friendly** - Intuitive UI with clear indicators

---

**Status:** ✅ Fully Implemented  
**Ready for:** Production Testing  
**Next Step:** Test all filter/sort combinations!
