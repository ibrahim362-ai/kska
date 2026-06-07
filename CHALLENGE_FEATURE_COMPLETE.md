# Challenge Feature - Complete Implementation Guide

## Overview
The Challenge feature allows admins to create challenges that users can accept to earn points. This document covers the complete implementation across backend, mobile, and web-admin platforms.

## Features Implemented

### ✅ Backend (Complete)
- Challenge CRUD operations for admins
- User challenge interaction (accept/reject/skip)
- Points allocation on challenge acceptance
- Challenge history and statistics
- Real-time response tracking
- Icon transaction logging for audit trail

### ✅ Mobile App (Complete)
- Active challenges display with beautiful card UI
- Accept/Reject/Skip actions
- Challenge history view
- Points celebration dialog on acceptance
- Time remaining indicator
- Creator information display
- Integration with profile screen

### ✅ Web Admin (Complete)
- Challenges management dashboard
- Create new challenges with date/time and points
- View challenge statistics (accept/reject/skip counts)
- Edit and delete challenges
- Pagination support
- Real-time response tracking
- Status indicator (ACTIVE/INACTIVE/EXPIRED)

---

## Database Schema

### Challenge Model
```prisma
model Challenge {
  id                String   @id @default(cuid())
  creatorId         String
  creator           User     @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  title             String
  description       String?
  type              String   @default("GENERAL") // GENERAL, WEEKLY, MONTHLY, SPECIAL
  imageUrl          String?
  points            Int      @default(10)
  startsAt          DateTime
  endsAt            DateTime
  isActive          Boolean  @default(true)
  maxResponses      Int?
  totalResponses    Int      @default(0)
  acceptCount       Int      @default(0)
  rejectCount       Int      @default(0)
  skipCount         Int      @default(0)
  responses         ChallengeResponse[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ChallengeResponse {
  id          String   @id @default(cuid())
  challengeId String
  challenge   Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action      String   // ACCEPT, REJECT, SKIP
  content     String?
  mediaUrl    String?
  createdAt   DateTime @default(now())

  @@unique([challengeId, userId])
}
```

---

## API Endpoints

### Admin Endpoints (Require ADMIN role)

#### Create Challenge
```
POST /api/challenges
Headers: Content-Type: multipart/form-data
Body:
{
  "title": "string",
  "description": "string",
  "type": "GENERAL|WEEKLY|MONTHLY|SPECIAL",
  "points": number,
  "startsAt": ISO8601 DateTime,
  "endsAt": ISO8601 DateTime,
  "maxResponses": number (optional),
  "imageUrl": File (optional)
}
Response: { success: true, data: Challenge }
```

#### Get All Challenges
```
GET /api/challenges/admin/all?page=1&limit=20
Response: {
  success: true,
  data: {
    challenges: Challenge[],
    pagination: { page, limit, total, totalPages }
  }
}
```

#### Update Challenge
```
PUT /api/challenges/:id
Body: Partial Challenge object
Response: { success: true, data: Challenge }
```

#### Delete Challenge
```
DELETE /api/challenges/:id
Response: { success: true, message: "Challenge deleted" }
```

#### Get Challenge Stats
```
GET /api/challenges/:id/stats
Response: {
  success: true,
  data: {
    challenge: Challenge,
    stats: { accept, reject, skip },
    totalResponses: number
  }
}
```

### User Endpoints (Require Authentication)

#### Get Active Challenges
```
GET /api/challenges/active
Response: {
  success: true,
  data: Challenge[] (challenges user hasn't responded to)
}
```

#### Get Challenge History
```
GET /api/challenges/history?page=1&limit=20
Response: {
  success: true,
  data: {
    responses: ChallengeResponse[],
    pagination: { page, limit, total, totalPages }
  }
}
```

#### Respond to Challenge
```
POST /api/challenges/:challengeId/respond
Body: {
  "action": "ACCEPT|REJECT|SKIP",
  "content": "string (optional)",
  "mediaUrl": "string (optional)"
}
Response: {
  success: true,
  data: ChallengeResponse
}
```

**Important**: When user ACCEPTS a challenge:
- Points are automatically awarded to the user (challenge.points amount)
- Icon transaction is created for audit logging
- User's `icons` field is incremented
- Response is stored with action = "ACCEPT"

---

## Points System Integration

### Challenge Points Flow
1. **Admin creates challenge** with specific points value (e.g., 10 points)
2. **User sees active challenge** in mobile app
3. **User clicks ACCEPT** on the challenge
4. **Backend awards points**: 
   - User.icons += challenge.points
   - IconTransaction created with type="CHALLENGE"
   - ChallengeResponse created with action="ACCEPT"
5. **User sees points celebration dialog** in mobile app
6. **Admin can view stats** in web-admin dashboard

### Points Earning Rules
- ✅ Signup: +10 points (automatic)
- ✅ Daily checkin: +10 points (automatic)
- ✅ Challenge accepted: +N points (N varies by challenge)
- ❌ Ticket purchase: 0 points (payment only)
- ❌ Other actions: 0 points

---

## Frontend Implementation

### Mobile App Flow

#### Challenges Screen (`challenges_screen.dart`)
- Displays list of active challenges as swipeable cards
- Shows title, description, points, creator, time remaining
- Action buttons: Accept, Reject, Skip
- Empty state when no challenges

#### Accept Challenge Flow
1. User taps "Accept" button
2. API call: `POST /api/challenges/:challengeId/respond` with action="ACCEPT"
3. On success:
   - Show points celebration dialog (+N points)
   - Navigate to challenge history or refresh list
   - User's profile icons count updates

#### Challenge History (`challenge_history_screen.dart`)
- Shows all user's challenge responses (past and present)
- Color-coded badges: green (ACCEPT), red (REJECT), orange (SKIP)
- Pagination support
- Challenge details on tap

#### Profile Screen Integration
- New "Challenges" button added to action buttons
- Green gradient background (emerald-500 to green-600)
- Subtitle: "Accept challenges to earn points"
- Navigates to `/challenges` route

### Web Admin Dashboard

#### Challenges Management (`ChallengesPage.tsx`)
- Table view with challenges sorted by newest first
- Search/filter capabilities
- Create button opens form modal
- Edit button opens edit modal
- Delete button with confirmation
- Real-time stats: accept/reject/skip counts
- Status display: ACTIVE/INACTIVE/EXPIRED
- Pagination (20 per page default)

#### Create Challenge Form
- Title (required)
- Description
- Points award (default 10)
- Challenge type dropdown
- Start date/time (required)
- End date/time (required)
- Max responses (optional, unlimited if empty)

#### Challenge Details Modal
- Title and status badge
- Description
- Points award with icon
- Start/end times
- Total responses breakdown (pie chart data)
- Accept/reject/skip statistics
- Creator information
- Edit and Delete buttons

---

## Implementation Status

### Backend ✅
- [x] Database schema created with migration
- [x] Challenge service with all business logic
- [x] Challenge controller with API handlers
- [x] Routes registered and working
- [x] Points allocation on ACCEPT
- [x] Icon transaction logging
- [x] Middleware authorization working

### Mobile ✅
- [x] Challenge model and JSON serialization
- [x] ChallengeService with API integration
- [x] Riverpod providers for state management
- [x] Challenges screen with card UI
- [x] Challenge history screen
- [x] Actions: Accept/Reject/Skip
- [x] Points celebration dialog
- [x] Profile screen integration
- [x] Navigation routes added

### Web Admin ✅
- [x] ChallengesPage component
- [x] CRUD operations
- [x] Statistics display
- [x] Navigation menu item
- [x] Routes configured
- [x] Pagination and filters
- [x] Status indicators
- [x] Real-time response tracking

---

## Testing Guide

### Backend Testing
```bash
# Start backend
npm run dev

# Test endpoints using curl or Postman
# 1. Create admin account first
# 2. Login to get token
# 3. Create challenge with ADMIN token
# 4. Get active challenges with USER token
# 5. Accept challenge and verify points awarded
```

### Mobile App Testing
1. Run `flutter run` to launch on emulator/device
2. Login with test user account
3. Navigate to Profile → Challenges button
4. View active challenges
5. Tap Accept on any challenge
6. Verify points celebration dialog shows
7. Check Profile to see updated points count
8. View Challenge History to see your response

### Web Admin Testing
1. Start web-admin: `npm run dev`
2. Login with admin credentials
3. Navigate to Challenges menu item
4. Create new challenge with form
5. Verify challenge appears in table
6. Click detail view to see statistics
7. Edit challenge details
8. Delete challenge (with confirmation)

---

## Troubleshooting

### Common Issues

#### Challenge not appearing for user
- Verify `isActive = true` in database
- Check `startsAt <= now <= endsAt`
- Ensure user hasn't already responded to this challenge

#### Points not awarded after accept
- Check IconTransaction table for creation
- Verify User.icons field incremented
- Check backend logs for transaction errors
- Verify challenge.points value > 0

#### API 401 Unauthorized
- Verify token is included in Authorization header
- Check token hasn't expired (> 24 hours)
- Re-login if needed

#### Web Admin not showing challenges
- Check browser console for API errors
- Verify admin user has ADMIN role
- Check API base URL is correct
- Refresh page and retry

---

## Files Modified/Created

### Backend
- `backend/prisma/schema.prisma` - Added Challenge and ChallengeResponse models
- `backend/prisma/migrations/20260606060147_add_challenges/migration.sql` - Database migration
- `backend/src/modules/challenge/challenge.service.ts` - Business logic
- `backend/src/modules/challenge/challenge.controller.ts` - API handlers
- `backend/src/modules/challenge/challenge.routes.ts` - Routes configuration
- `backend/src/app.ts` - Routes registration (updated)

### Mobile
- `mobile/lib/models/challenge.dart` - Challenge data models
- `mobile/lib/services/challenge_service.dart` - API integration
- `mobile/lib/providers/challenge_provider.dart` - State management
- `mobile/lib/features/challenges/screens/challenges_screen.dart` - Main challenges UI
- `mobile/lib/features/challenges/screens/challenge_history_screen.dart` - History view
- `mobile/lib/features/challenges/widgets/challenge_card.dart` - Card widget
- `mobile/lib/features/challenges/widgets/empty_challenges_view.dart` - Empty state
- `mobile/lib/main.dart` - Routes (updated)
- `mobile/lib/features/profile/screens/profile_screen.dart` - Challenges button (updated)

### Web Admin
- `web-admin/src/pages/challenges/ChallengesPage.tsx` - Challenges management page
- `web-admin/src/App.tsx` - Route registration (updated)
- `web-admin/src/layouts/AdminLayout.tsx` - Navigation menu (updated)

---

## Next Steps

1. **Testing**: Comprehensive integration testing across all platforms
2. **Performance**: Optimize challenge loading for large datasets
3. **Notifications**: Send push notifications when new challenges are created
4. **Analytics**: Track challenge completion rates and popular challenges
5. **Gamification**: Add achievements/badges related to challenges
6. **Social**: Allow users to share challenge completions

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review implementation files for recent changes
3. Check backend logs: `tail -f backend/dev-output.log`
4. Check mobile console: `flutter logs`
5. Check web admin browser console: F12 → Console tab

---

**Feature Status**: ✅ COMPLETE - Ready for production testing
**Last Updated**: June 6, 2026
**Version**: 1.0.0
