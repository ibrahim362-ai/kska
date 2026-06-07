# User Transactions History Endpoint

## Overview
Added endpoint to fetch user's icon transaction history for admin review.

## Implementation Date
June 6, 2026

## Backend Changes

### 1. New Route
**File**: `backend/src/modules/user/user.routes.ts`

```typescript
router.get('/:id/transactions', authorize('ADMIN'), userController.getUserTransactions);
```

### 2. New Service Method
**File**: `backend/src/modules/user/user.service.ts`

```typescript
export async function getUserTransactions(userId: string, limit: number = 100)
```

**Features**:
- Fetches user's IconTransaction records
- Default limit: 100 transactions
- Ordered by createdAt DESC (newest first)
- Returns: id, userId, amount, type, description, metadata, createdAt

### 3. New Controller
**File**: `backend/src/modules/user/user.controller.ts`

```typescript
export async function getUserTransactions(req, res, next)
```

**Features**:
- Accepts optional `limit` query parameter
- Admin-only endpoint (requires ADMIN role)
- Returns transactions array in response data

## API Endpoint

### GET /api/users/:id/transactions

**Authentication**: Required (JWT)  
**Authorization**: ADMIN role only  

**Query Parameters**:
- `limit` (optional, default: 100): Maximum number of transactions to return

**Request Example**:
```http
GET /api/users/cmq2b4z7a00019oljgc98ttf3/transactions?limit=100
Authorization: Bearer <admin-jwt-token>
```

**Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "tx_123",
      "userId": "cmq2b4z7a00019oljgc98ttf3",
      "amount": 50,
      "type": "ADMIN_BONUS",
      "description": "Challenge completion reward",
      "metadata": {
        "adminId": "admin_123",
        "timestamp": "2026-06-06T10:30:00.000Z"
      },
      "createdAt": "2026-06-06T10:30:00.000Z"
    },
    {
      "id": "tx_122",
      "userId": "cmq2b4z7a00019oljgc98ttf3",
      "amount": 10,
      "type": "SIGNUP",
      "description": "Welcome bonus",
      "metadata": null,
      "createdAt": "2026-06-05T08:00:00.000Z"
    }
  ]
}
```

## Transaction Types
- `SIGNUP` - Welcome bonus on registration
- `TICKET_PURCHASE` - Points earned from ticket purchases
- `CHECKIN` - Points earned from event check-ins
- `REFERRAL` - Referral rewards
- `ADMIN_BONUS` - Manual points added by admin
- `MANUAL` - Manual adjustment

## Web Admin Integration

The endpoint is called from `ChallengesPage.tsx` when viewing points history:

```typescript
const { data: transactions } = useQuery({
  queryKey: ['user-transactions', userId],
  queryFn: async () => {
    const res = await api.get(`/users/${userId}/transactions?limit=100`);
    return res.data.data;
  },
  enabled: !!userId,
});
```

## Testing

1. Login as admin in web admin panel
2. Navigate to Challenges page
3. Click "View Responses" on any challenge
4. Click "View Points History" for any user
5. Modal should display transaction history

## Error Handling

- **404 Not Found**: User does not exist
- **403 Forbidden**: User is not admin
- **401 Unauthorized**: No valid JWT token

## Notes

- Endpoint requires admin authentication
- Transactions are sorted newest first
- Limit parameter prevents excessive data transfer
- Backend auto-reloads with tsx watch (no restart needed)
