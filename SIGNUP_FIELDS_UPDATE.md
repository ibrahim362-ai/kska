# Signup Fields Update - Phone, Age, Gender, City, Country

## Wanti Godhamee (What Was Done)

### 1. Database Schema Update ✅
**File**: `backend/prisma/schema.prisma`
**Migration**: `20260606084411_add_user_profile_fields`

Added new fields to User model:
```prisma
age     Int?
gender  String?
city    String?
country String?
```

Note: `phone` already existed but was optional, now it's required in validation.

### 2. Backend Validation ✅
**File**: `backend/src/validations/auth.ts`

Updated signupSchema:
```typescript
export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().min(1, 'Phone number is required'),  // NOW REQUIRED
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  city: z.string().min(1, 'City is required'),           // REQUIRED
  country: z.string().min(1, 'Country is required'),     // REQUIRED
  code: z.string().optional(),
});
```

### 3. Backend Service Update ✅
**File**: `backend/src/modules/auth/auth.service.ts`

Updated signup() method to accept and save new fields:
- phone (required)
- age (optional)
- gender (optional - MALE/FEMALE/OTHER)
- city (required)
- country (required)

Returns all fields in response:
```typescript
{
  user: {
    id, email, username, fullName,
    phone, age, gender, city, country,
    role, isVerified, icons, ...
  },
  accessToken,
  refreshToken
}
```

### 4. Mobile App - Flutter Signup Screen ✅
**File**: `mobile/lib/features/auth/screens/signup_screen.dart`

Added controllers:
- `_phoneCtrl` - Phone number input
- `_ageCtrl` - Age input (optional)
- `_cityCtrl` - City input
- `_countryCtrl` - Country input
- `_selectedGender` - Dropdown (MALE/FEMALE/OTHER)

Updated Step 3 (Profile Step) with new fields:
```dart
✅ Full Name * (text)
✅ Username (optional)
✅ Phone Number * (phone keyboard)
✅ Age (optional, number keyboard)
✅ Gender (optional, dropdown: Male/Female/Other)
✅ City * (text)
✅ Country * (text)
✅ Password * (secure)
✅ Confirm Password * (secure)
```

### 5. Mobile Auth Provider ✅
**File**: `mobile/lib/providers/auth_provider.dart`

Updated signupWithOtp() method to accept optional parameters:
```dart
Future<String?> signupWithOtp(
  String email,
  String username,
  String password,
  String fullName,
  String code, {
  String? phone,
  int? age,
  String? gender,
  String? city,
  String? country,
}) async { ... }
```

## Field Requirements

### Required Fields (*)
- ✅ Email
- ✅ Username (or auto-generated)
- ✅ Password
- ✅ Full Name
- ✅ Phone Number
- ✅ City
- ✅ Country

### Optional Fields
- Age (13-120)
- Gender (MALE/FEMALE/OTHER)

## UI/UX Changes

### Flutter Signup Form:
1. **Step 1**: Email → Send OTP
2. **Step 2**: Verify 6-digit OTP code
3. **Step 3**: Complete Profile (9 fields total)
   - Full Name *
   - Username (optional)
   - Phone Number * 📱
   - Age & Gender (side by side, optional)
   - City * 🏙️
   - Country * 🌍
   - Password *
   - Confirm Password *

### Field Icons:
- 📱 Phone: `Icons.phone_rounded`
- 🎂 Age: `Icons.cake_rounded`
- 👤 Gender: `Icons.wc_rounded`
- 🏙️ City: `Icons.location_city_rounded`
- 🌍 Country: `Icons.flag_rounded`

### Validation:
- Phone: Required, must not be empty
- Age: Optional, must be 13-120 if provided
- Gender: Optional dropdown (Male/Female/Other)
- City: Required, must not be empty
- Country: Required, must not be empty

### Error Messages:
- "Phone, City, and Country are required" - if missing
- "Password must be at least 6 characters"
- "Passwords do not match"

## Database Migration

Migration created: `20260606084411_add_user_profile_fields`

SQL Changes:
```sql
ALTER TABLE "User" ADD COLUMN "age" INTEGER;
ALTER TABLE "User" ADD COLUMN "gender" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "country" TEXT;
```

All fields nullable (optional in database) but validated as required in application layer for new signups.

## Testing

### Test Signup Flow:
1. Mobile app → Signup screen
2. Enter email → Send OTP
3. Enter 6-digit OTP code → Verify
4. Fill profile form:
   - Full Name: "Kamil Ibrahim"
   - Username: "kamil_2024" (optional)
   - Phone: "+251912345678"
   - Age: 25 (optional)
   - Gender: Male (optional)
   - City: "Addis Ababa"
   - Country: "Ethiopia"
   - Password: "password123"
   - Confirm Password: "password123"
5. Click "Create Account"
6. ✅ User created with all fields saved

### API Test:
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123",
  "fullName": "Test User",
  "phone": "+251911223344",
  "age": 25,
  "gender": "MALE",
  "city": "Addis Ababa",
  "country": "Ethiopia",
  "code": "123456"
}
```

## Files Modified

### Backend:
1. ✅ `backend/prisma/schema.prisma` - Added age, gender, city, country
2. ✅ `backend/src/validations/auth.ts` - Updated signupSchema validation
3. ✅ `backend/src/modules/auth/auth.service.ts` - Updated signup method

### Mobile:
1. ✅ `mobile/lib/features/auth/screens/signup_screen.dart` - Added 5 new fields
2. ✅ `mobile/lib/providers/auth_provider.dart` - Updated signupWithOtp method

### Migration:
1. ✅ `backend/prisma/migrations/20260606084411_add_user_profile_fields/migration.sql`

## Status: ✅ COMPLETE & READY TO TEST

- Backend: http://localhost:5000 ✅ Running (auto-restarted)
- Mobile: Flutter Chrome ✅ Running
- Database: PostgreSQL ✅ Migrated
- Validation: Zod schema ✅ Updated

## Next Steps

1. Test signup in mobile app
2. Verify all fields are saved in database
3. Check user profile displays new fields
4. Optional: Add these fields to user profile edit screen
5. Optional: Add these fields to web admin user management

---

**Yeroo**: June 6, 2026 - Saturday  
**Session**: Context Transfer Continuation #3  
**Migration Time**: 08:44:11 UTC
