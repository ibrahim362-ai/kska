# 🚀 QUICK REFERENCE - Membership System

## Current Status
✅ Backend: Running on port 5000  
✅ All migrations applied  
✅ All code changes complete  
⚠️ Mobile: Needs manual start

---

## Start Mobile App
```bash
cd mobile
flutter run -d chrome --web-port=63500
```

---

## Test Accounts

| Email | Password | Role | Membership |
|-------|----------|------|------------|
| ibrahimkamil362@gmail.com | admin123 | SUPER_ADMIN | N/A |
| admin@kska.com | admin123 | ADMIN | N/A |
| employer@kska.com | employer123 | EMPLOYER | N/A |
| user@kska.com | user123 | USER | FREE |

---

## Membership Levels Quick Reference

| Level | Name | Price | Features Count | Boost |
|-------|------|-------|----------------|-------|
| 0 | FREE | 0 ETB | 0 | N/A (Hidden) |
| 1 | SILVER | 99 ETB | 2 | 1.0x |
| 2 | GOLD | 199 ETB | 3 | 1.0x |
| 3 | VIP | 499 ETB | 4 | 1.5x |
| 4 | VVIP | 999 ETB | 5 | 2.0x |

---

## Access Control Matrix

| Feature | FREE | SILVER | GOLD | VIP | VVIP |
|---------|------|--------|------|-----|------|
| View Challenges | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accept Challenges | ❌ | ✅ | ✅ | ✅ | ✅ |
| Community Access | ❌ | ✅ | ✅ | ✅ | ✅ |
| Priority Tickets | ❌ | ❌ | ✅ | ✅ | ✅ |
| Leaderboard Display | ❌ | ✅ | ✅ | ✅ | ✅ |
| Leaderboard Boost | - | 1.0x | 1.0x | 1.5x | 2.0x |
| VIP Seat | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## API Endpoints

### Challenge Endpoints
```
GET    /api/challenges/active          # View challenges (all users)
POST   /api/challenges/:id/respond     # Accept challenge (SILVER+ only)
```

### Leaderboard Endpoints
```
GET    /api/leaderboard                # View leaderboard
                                       # (FREE users filtered out)
```

### Membership Endpoints
```
GET    /api/memberships                # Get all plans
GET    /api/memberships/my-memberships # Get user's memberships
POST   /api/memberships/purchase       # Purchase membership
```

---

## Error Messages

### Challenge Access Denied (FREE User)
```json
{
  "error": "Upgrade to SILVER or higher to accept challenges",
  "requiresUpgrade": true,
  "minimumLevel": "SILVER"
}
```

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] Mobile app starts successfully
- [ ] FREE user can view challenges
- [ ] FREE user cannot accept challenges
- [ ] SILVER+ user can accept challenges
- [ ] FREE user not shown on leaderboard
- [ ] VIP user has 1.5x boosted score
- [ ] VVIP user has 2.0x boosted score
- [ ] Membership screen shows feature lists
- [ ] FREE plan shows "Basic access only"
- [ ] All paid plans show numbered features

---

## Important Files

### Backend
- `backend/src/modules/challenge/challenge.controller.ts` - Challenge access control
- `backend/src/modules/leaderboard/leaderboard.service.ts` - Leaderboard boost & filtering
- `backend/prisma/schema.prisma` - Database schema

### Mobile
- `mobile/lib/features/membership/screens/membership_screen.dart` - UI with feature lists
- `mobile/lib/models/models.dart` - Data models

### Documentation
- `MEMBERSHIP_FEATURES_COMPLETE.md` - Full implementation details
- `MEMBERSHIP_UI_CHANGES.md` - Visual guide
- `GABAASA_XUMURAA.md` - Summary in Afaan Oromoo

---

## Quick Commands

```bash
# Backend
cd backend
npm run dev                    # Start backend

# Mobile
cd mobile
flutter run -d chrome --web-port=63500    # Start mobile

# Database
cd backend
npx prisma studio             # Open database GUI
npx prisma migrate dev        # Apply migrations
npx prisma generate           # Generate client
```

---

## Color Codes (for reference)

- FREE: Gray (#E0E0E0 → #9E9E9E)
- SILVER: Blue-gray (#90CAF9 → #78909C)
- GOLD: Amber (#FFCA28 → #FB8C00)
- VIP: Purple-pink (#AB47BC → #EC407A)
- VVIP: Gold-orange (#FFD700 → #FF6B00)

---

**Status**: ✅ COMPLETE & READY FOR TESTING  
**Date**: June 7, 2026
