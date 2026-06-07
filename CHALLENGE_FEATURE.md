# 🎯 Challenge Feature - Complete Implementation

## Overview
Admin creates challenges/prompts that users can see on mobile and respond with ACCEPT, REJECT, or SKIP. When users accept, they earn points.

---

## ✅ COMPLETED: Backend Implementation

### Database Schema (Prisma)
**New Models Added:**

1. **Challenge Model** - Admin-created challenges
   - Fields: title, description, type, imageUrl, points, startsAt, endsAt, isActive, maxResponses
   - Tracks: acceptCount, rejectCount, skipCount, totalResponses
   - Relations: creator (User), responses (ChallengeResponse[])

2. **ChallengeResponse Model** - User responses to challenges
   - Fields: challengeId, userId, action (ACCEPT/REJECT/SKIP), content, mediaUrl
   - Unique constraint: One response per user per challenge
   - Relations: challenge (Challenge), user (User)

### API Endpoints

**Admin Endpoints** (`/api/challenges/`):
- `POST /` - Create new challenge (ADMIN only)
- `GET /admin/all` - Get all challenges with pagination (ADMIN only)
- `PUT /:id` - Update challenge (ADMIN only)
- `DELETE /:id` - Delete challenge (ADMIN only)
- `GET /:id/stats` - Get challenge statistics (ADMIN only)

**Mobile/User Endpoints** (`/api/challenges/`):
- `GET /active` - Get active challenges user hasn't responded to
- `GET /history` - Get user's challenge response history
- `POST /:challengeId/respond` - Respond to challenge (ACCEPT/REJECT/SKIP)

### Features
- ✅ Points awarded automatically when user ACCEPTS challenge
- ✅ Icon transaction recorded for audit trail
- ✅ Max response limit support
- ✅ Start/End date validation
- ✅ One response per user per challenge
- ✅ Real-time stats tracking (accept/reject/skip counts)

### Files Created
- `/backend/src/modules/challenge/challenge.service.ts`
- `/backend/src/modules/challenge/challenge.controller.ts`
- `/backend/src/modules/challenge/challenge.routes.ts`
- `/backend/prisma/migrations/20260606060147_add_challenges/`

---

## 🚧 TODO: Web Admin Implementation

### Pages to Create in `/web-admin/src/pages/`:

1. **ChallengesPage.tsx** - List all challenges
   - Table showing: title, type, dates, stats, status
   - Actions: Create, Edit, Delete, View Stats
   - Filters: active/inactive, type, date range

2. **CreateChallengePage.tsx** - Create new challenge form
   - Fields: title, description, type, image upload, points, dates, max responses
   - Preview before create
   - Image upload integration

3. **ChallengeStatsPage.tsx** - Detailed stats view
   - Charts: Accept/Reject/Skip pie chart
   - Timeline of responses
   - Top responders list
   - Export functionality

### Components Needed:
- `ChallengeCard.tsx` - Display challenge preview
- `ChallengeForm.tsx` - Reusable form for create/edit
- `ChallengeStats.tsx` - Stats visualization component

### API Service (`/web-admin/src/services/api.ts`):
```typescript
// Add these methods
export const challengeAPI = {
  getAll: (page, limit) => api.get('/challenges/admin/all', { params: { page, limit } }),
  create: (data) => api.post('/challenges', data),
  update: (id, data) => api.put(`/challenges/${id}`, data),
  delete: (id) => api.delete(`/challenges/${id}`),
  getStats: (id) => api.get(`/challenges/${id}/stats`),
};
```

---

## 🚧 TODO: Mobile Implementation

### New Screens to Create in `/mobile/lib/features/challenges/`:

1. **screens/challenges_screen.dart** - List of active challenges
   - Swipeable cards (like Tinder)
   - Show: title, description, image, points, expiry
   - Actions: Accept, Reject, Skip buttons
   - Empty state when no challenges

2. **screens/challenge_detail_screen.dart** - Full challenge details
   - Large image display
   - Full description
   - Creator info
   - Action buttons with confirmation

3. **screens/challenge_history_screen.dart** - User's past responses
   - List of all responded challenges
   - Filter by action type (accepted/rejected/skipped)
   - Show points earned from accepted challenges

### Models (`/mobile/lib/models/`):
```dart
class Challenge {
  final String id;
  final String title;
  final String description;
  final String type;
  final String? imageUrl;
  final int points;
  final DateTime startsAt;
  final DateTime endsAt;
  final bool isActive;
  final Creator creator;
  // ... toJson, fromJson
}

class ChallengeResponse {
  final String id;
  final String challengeId;
  final String action; // ACCEPT, REJECT, SKIP
  final DateTime createdAt;
  final Challenge? challenge;
  // ... toJson, fromJson
}
```

### Services (`/mobile/lib/services/challenge_service.dart`):
```dart
class ChallengeService {
  Future<List<Challenge>> getActiveChallenges();
  Future<ChallengeResponse> respondToChallenge(String id, String action);
  Future<List<ChallengeResponse>> getChallengeHistory(int page);
}
```

### Provider (`/mobile/lib/providers/challenge_provider.dart`):
```dart
final challengesProvider = FutureProvider<List<Challenge>>((ref) async {
  return ref.read(challengeServiceProvider).getActiveChallenges();
});

final challengeHistoryProvider = FutureProvider.family<List<ChallengeResponse>, int>((ref, page) async {
  return ref.read(challengeServiceProvider).getChallengeHistory(page);
});
```

### UI Components:
- **ChallengeCard** - Swipeable card with image, title, points
- **ChallengeActionButtons** - Accept/Reject/Skip with animations
- **PointsEarnedAnimation** - Celebrate when points awarded
- **EmptyChallengesView** - "No new challenges" state

### Navigation:
Add to bottom nav or side menu:
```dart
NavigationDestination(
  icon: Icon(Icons.emoji_events),
  label: 'Challenges',
)
```

---

## 📊 Challenge Types

### Supported Types:
1. **GENERAL** - Simple prompt/task
2. **PHOTO** - Requires photo upload (future enhancement)
3. **VIDEO** - Requires video upload (future enhancement)
4. **TEXT** - Requires text response (future enhancement)

Current implementation: GENERAL type (no content required)
Future: Can add content/mediaUrl validation based on type

---

## 🎨 Design Recommendations

### Mobile UI/UX:
- **Card-based swipe** interface (Tinder-style)
- **Green theme** to match employer app
- **Animations**: 
  - Slide in/out for card swipes
  - Confetti when accepting challenge
  - Points counter animation
- **Haptic feedback** on button press
- **Pull-to-refresh** for new challenges

### Web Admin UI:
- **Material Design** table with sorting
- **Color-coded** status badges (active/expired)
- **Charts** for analytics (Chart.js or Recharts)
- **Quick actions** menu on each row
- **Bulk operations** (activate/deactivate multiple)

---

## 🔐 Security & Validation

### Backend Validations:
- ✅ User can only respond once per challenge
- ✅ Challenge must be active and within date range
- ✅ Max responses limit enforced
- ✅ Admin-only access for create/edit/delete
- ✅ Points awarded only on ACCEPT action

### Future Enhancements:
- Rate limiting on responses (prevent spam)
- Content moderation for user responses
- Report inappropriate challenges
- Challenge expiry notifications
- Push notifications for new challenges

---

## 📱 Next Steps

### Priority 1: Mobile Implementation
1. Create challenge models
2. Create challenge service
3. Create challenges screen with swipe cards
4. Add to navigation
5. Test accept/reject/skip flow
6. Test points award

### Priority 2: Web Admin Implementation
1. Create challenges page (list)
2. Create challenge form (create/edit)
3. Add to admin navigation
4. Test CRUD operations
5. Add stats/analytics view

### Priority 3: Enhancements
1. Image upload for challenges
2. User response with content/media
3. Push notifications
4. Challenge categories/tags
5. Leaderboard for challenge champions

---

## 🧪 Testing Checklist

### Backend:
- [ ] Create challenge as admin
- [ ] Non-admin cannot create challenge
- [ ] User gets only unanswered challenges
- [ ] User can accept/reject/skip
- [ ] Points awarded on accept
- [ ] Cannot respond twice to same challenge
- [ ] Expired challenges not shown
- [ ] Max responses limit works

### Mobile:
- [ ] Challenges load on screen
- [ ] Swipe cards work smoothly
- [ ] Accept adds points to user
- [ ] Reject/Skip recorded correctly
- [ ] Empty state shows when no challenges
- [ ] History shows past responses
- [ ] Pull-to-refresh works

### Web Admin:
- [ ] Admin can create challenge
- [ ] Admin can edit challenge
- [ ] Admin can delete challenge
- [ ] Stats display correctly
- [ ] Pagination works
- [ ] Filters work
- [ ] Image upload works

---

## 🎉 Summary

**Backend**: ✅ **COMPLETE**
- Database schema created
- API endpoints implemented
- Points system integrated
- Migrations applied

**Web Admin**: 🚧 **TODO**
- Need to create UI pages
- Need to add navigation
- Need to integrate API

**Mobile**: 🚧 **TODO**
- Need to create screens
- Need to add models/services
- Need to add to navigation
- Need to implement swipe UX

**Estimated Time Remaining**:
- Web Admin: ~2-3 hours
- Mobile: ~3-4 hours
- Testing: ~1-2 hours
**Total: ~6-9 hours**

---

## 📞 API Examples

### Create Challenge (Admin):
```bash
POST /api/challenges
Authorization: Bearer {admin_token}
{
  "title": "Share Your Story",
  "description": "Tell us why you love our community!",
  "type": "GENERAL",
  "points": 20,
  "startsAt": "2024-01-01T00:00:00Z",
  "endsAt": "2024-12-31T23:59:59Z",
  "maxResponses": 100
}
```

### Get Active Challenges (User):
```bash
GET /api/challenges/active
Authorization: Bearer {user_token}
```

### Respond to Challenge (User):
```bash
POST /api/challenges/{challengeId}/respond
Authorization: Bearer {user_token}
{
  "action": "ACCEPT"
}
```

---

**Status**: Backend Complete ✅ | Frontend In Progress 🚧
**Last Updated**: June 6, 2026
