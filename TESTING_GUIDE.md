# Challenge Feature - End-to-End Testing Guide

**Duration**: ~20 minutes | **Difficulty**: Easy | **Prerequisites**: All systems running

---

## Pre-Testing Checklist

Before starting, verify all systems are running:

```powershell
# Check processes
Get-Process node, flutter | Select-Object Name, Id | Format-Table

# Verify ports
curl http://localhost:5000/api/health
curl http://localhost:5173
```

**Expected**: Both return HTTP 200 OK, flutter process exists

---

## TEST 1: Web Admin Login & Navigation

### Steps:
1. Open browser to `http://localhost:5173`
2. See login page
3. Enter credentials:
   - Username: `admin1`
   - Password: `admin123`
4. Click Login
5. Should redirect to Dashboard
6. Look for "Challenges" in left sidebar menu
7. Click "Challenges"

### Expected Results:
- ✅ Login succeeds without error
- ✅ Dashboard loads
- ✅ Challenges menu item exists
- ✅ Challenges page loads showing list (empty or with existing)
- ✅ No API errors in browser console

### If Issues:
```
- 401 error? → Check credentials in database
- 500 error? → Check backend logs
- Page won't load? → Check CORS in backend logs
```

---

## TEST 2: Create Challenge from Web Admin

### Steps:
1. On Challenges page, click "Create Challenge" button
2. Fill form fields:
   - **Title**: "Test Challenge XYZ"
   - **Description**: "This is a test challenge for verification"
   - **Points**: 50
   - **Start Date**: Today at 00:00
   - **End Date**: 7 days from today at 23:59
   - **Image** (optional): Skip for now
3. Click "Create"
4. Should show success notification
5. New challenge should appear in list

### Expected Results:
- ✅ Modal opens without errors
- ✅ Form fields accept input
- ✅ Create button is clickable
- ✅ Success message appears
- ✅ Challenge appears in list
- ✅ List refreshes automatically
- ✅ Stats show: 0 ACCEPT, 0 REJECT, 0 SKIP

### If Issues:
```
- Form won't submit? → Check browser console for validation errors
- 400 error? → Check required fields are filled
- 500 error? → Check backend logs for Prisma error
```

---

## TEST 3: Mobile App Login

### Steps:
1. In terminal where flutter is running, look for URL (e.g., `http://localhost:54321`)
2. Open that URL in browser (or find it in Flutter output)
3. See mobile app login screen
4. Login with any test user:
   - Email: `sara202261fg@gmail.com`
   - Password: `password123`
   - OR Create new account
5. Should navigate to home/profile screen

### Expected Results:
- ✅ App loads in Chrome
- ✅ Login screen visible
- ✅ Login succeeds
- ✅ No compilation errors in terminal
- ✅ Profile screen shows points (should show existing points)

### If Issues:
```
- Blank screen? → Check Flutter DevTools console
- Compilation error? → Check mobile terminal
- API error? → Check backend logs and verify API URL is http://localhost:5000/api
```

---

## TEST 4: View Challenges on Mobile

### Steps:
1. On Profile screen, look for "Challenges" button
2. Should have green gradient with trophy icon
3. Click "Challenges" button
4. Should navigate to Challenges screen
5. Should see your test challenge in a swipeable card
6. Card should show:
   - Title
   - Description
   - Points
   - Time remaining
   - Creator info
   - Accept/Reject/Skip buttons

### Expected Results:
- ✅ Challenges button visible on profile
- ✅ Navigation works
- ✅ Test challenge appears in list
- ✅ Card displays all information correctly
- ✅ Buttons are clickable
- ✅ No loading spinner stuck

### If Issues:
```
- Challenges not showing? → Check backend GET /api/challenges/active
- Card rendering wrong? → Check Flutter console for UI errors
- Loading spinner stuck? → Backend error - check logs
```

---

## TEST 5: Accept Challenge on Mobile

### Steps:
1. On Challenges screen, see test challenge card
2. Click "Accept" button
3. Should show loading spinner briefly
4. Should show success message/dialog
5. Should show celebration animation
6. Points should increase on dialog
7. Click OK/Close to dismiss
8. Challenges list should refresh
9. Challenge should no longer appear (user already responded)

### Expected Results:
- ✅ Accept button is clickable
- ✅ Loading spinner appears briefly
- ✅ Success dialog shows
- ✅ Points increase animation visible (was +0, now +50)
- ✅ Celebration effect plays
- ✅ Challenge disappears from active list
- ✅ Points reflected in Profile screen

### If Issues:
```
- Accept button does nothing? → Check Network tab in DevTools
- 400 error "already responded"? → You already responded, try different account
- 500 error? → Check backend respondToChallenge logs
- Points not increasing? → Check profile screen refresh
```

---

## TEST 6: Verify Challenge History on Mobile

### Steps:
1. Back on Challenges screen
2. Click "History" tab or button
3. Should show list of challenges you've responded to
4. Test challenge should appear with:
   - Title
   - Status badge: "ACCEPTED" (green)
   - Points awarded: +50
   - Response date
5. Click challenge to see details

### Expected Results:
- ✅ History screen loads
- ✅ Test challenge appears in history
- ✅ ACCEPTED badge visible
- ✅ Points shown correctly
- ✅ Date/time shown
- ✅ No errors in console

### If Issues:
```
- History empty? → Check backend GET /api/challenges/history
- Wrong status? → Check database for correct action
- Points wrong? → Check challenge creation points vs transaction records
```

---

## TEST 7: Verify Points on Profile Screen

### Steps:
1. Navigate back to Profile screen
2. Look for "My Points" section
3. Previous points: Check earlier value
4. New points: Should be increased by exactly 50
5. Check animated counter
6. Tap "My Points" to view history
7. Should see transaction for "Accepted challenge: Test Challenge XYZ"

### Expected Results:
- ✅ Points displayed correctly
- ✅ Animation shows new total
- ✅ History includes challenge transaction
- ✅ Transaction shows +50 from challenge
- ✅ No duplicate transactions

### If Issues:
```
- Points didn't increase? → Check icon transaction in database
- History not showing? → Check backend GET /api/icons or /api/users/me
- Animation stuck? → Check Flutter console
```

---

## TEST 8: Verify Web Admin Statistics

### Steps:
1. Back in web admin (http://localhost:5173)
2. On Challenges page
3. Find test challenge in list
4. Click on it or look at stats column
5. Should show:
   - **Total Responses**: 1
   - **Accept**: 1
   - **Reject**: 0
   - **Skip**: 0
6. Click "View Stats" button if available
7. Should show detail view with all statistics

### Expected Results:
- ✅ Challenge stats update automatically
- ✅ Accept count = 1
- ✅ Total responses = 1
- ✅ Response reflects immediately (no delay)
- ✅ No console errors

### If Issues:
```
- Stats not updating? → Try refresh (F5) or go back/forward
- Wrong count? → Check backend GET /api/challenges/admin/:id/stats
- 500 error? → Check Prisma groupBy query in logs
```

---

## TEST 9: Test Reject Action

### Steps:
1. On mobile, create new account if needed
2. Go to Challenges
3. See same test challenge (or create another)
4. Click "Reject" button
5. Confirm action if prompted
6. Should show similar success flow (but no points)
7. Check History
8. Should show "REJECTED" status

### Expected Results:
- ✅ Reject works without errors
- ✅ Points NOT awarded
- ✅ History shows REJECTED status
- ✅ Web admin stats: Reject count increased to 1
- ✅ Challenge no longer in active list

### If Issues:
```
Same troubleshooting as Accept test
```

---

## TEST 10: Test Skip Action

### Steps:
1. On mobile, create another test user
2. Go to Challenges
3. Click "Skip" button
4. Should work like Reject (no points)
5. Check History
6. Should show "SKIPPED" status

### Expected Results:
- ✅ Skip works without errors
- ✅ Points NOT awarded
- ✅ History shows SKIPPED status
- ✅ Web admin stats: Skip count increased
- ✅ Challenge no longer in active list

---

## TEST 11: Edit Challenge (Admin)

### Steps:
1. In web admin Challenges page
2. Find a challenge
3. Click Edit button
4. Modify something (e.g., description, points)
5. Click Save
6. Should show success message
7. Mobile app: Do refresh on Challenges page
8. Changes should be reflected if points changed

### Expected Results:
- ✅ Edit modal opens
- ✅ Form fills with current data
- ✅ Changes save successfully
- ✅ List updates
- ✅ Mobile reflects changes on refresh

---

## TEST 12: Delete Challenge (Admin)

### Steps:
1. In web admin Challenges page
2. Find a test challenge (not one users responded to)
3. Click Delete button
4. Confirm in dialog
5. Should remove from list
6. Mobile: Challenge no longer appears in active list

### Expected Results:
- ✅ Delete button is clickable
- ✅ Confirmation dialog appears
- ✅ Deletion succeeds
- ✅ Challenge removed from list
- ✅ Mobile reflects removal (try refresh)

---

## TEST 13: Pagination

### Steps:
1. In web admin, create 25+ challenges (to test pagination)
2. OR Look at pagination controls
3. Should show "Page 1 of X"
4. Click next page
5. Different challenges appear
6. Click previous
7. Back to first page

### Expected Results:
- ✅ Pagination controls appear if >20 items
- ✅ Navigation works
- ✅ Correct items shown per page
- ✅ Total count correct

---

## TEST 14: Error Scenarios

### Test 401 Unauthorized:
1. Close browser (logs out)
2. Go to /api/challenges/admin/all directly
3. Should get 401 error
4. Login again

### Test 403 Forbidden:
1. Login as regular user (not admin)
2. Try to access web admin
3. Should be denied
4. OR Test that user can't access POST /api/challenges/admin

### Test 400 Bad Request:
1. Try creating challenge with missing title
2. Should show validation error
3. Fix and submit

### Test 404 Not Found:
1. Try to get non-existent challenge ID
2. Should show proper error

### Expected Results:
- ✅ All error codes return appropriate messages
- ✅ UI shows user-friendly error messages
- ✅ No blank screens on errors
- ✅ Logs show context for debugging

---

## Final Verification Summary

After completing all tests, verify:

### Backend
- [x] No error logs when running tests
- [x] All API calls complete successfully
- [x] Response times under 1 second
- [x] Database updates correctly

### Mobile
- [x] No compilation errors
- [x] Smooth UI interactions
- [x] Points update immediately
- [x] History tracking accurate

### Web Admin
- [x] Real-time updates
- [x] Form validation working
- [x] Statistics accurate
- [x] No console errors

### Database
- [x] Challenges created
- [x] Responses recorded
- [x] Points updated
- [x] Statistics accurate

---

## Success Criteria ✅

All tests PASS if:
1. ✅ Web admin can create/read/update/delete challenges
2. ✅ Mobile can view active challenges
3. ✅ Mobile can accept challenge and receive points
4. ✅ Points are awarded correctly (only on ACCEPT)
5. ✅ History tracks all responses
6. ✅ Web admin statistics update in real-time
7. ✅ No errors in any logs
8. ✅ Database records are accurate
9. ✅ All UI elements work smoothly
10. ✅ Feature is ready for production

---

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| Can't login | Check username/password in env or database |
| 500 error on create | Check backend logs for Prisma error |
| Points not awarded | Check if action was ACCEPT (not REJECT/SKIP) |
| Challenge not showing on mobile | Verify challenge dates are current |
| Stats not updating | Try refresh page (F5) |
| Mobile app won't start | Check Flutter terminal for errors |
| Web admin won't connect | Check API URL is http://localhost:5000/api |

---

## Quick Commands for Troubleshooting

```powershell
# View backend logs
Get-Content c:\Users\kamil\Desktop\k\backend\dev-output.log -Tail 50

# Check if ports are in use
netstat -ano | findstr "5000\|5173"

# Restart backend
# Ctrl+C in backend terminal, then: npm run dev

# Clear mobile cache
# In Flutter terminal, press: R (hot restart)

# Check database
# Use: psql or any PostgreSQL client if needed
```

---

**Expected Testing Time**: 15-30 minutes  
**Expected Result**: All systems operational, feature ready for deployment  

Good luck with testing! 🚀
