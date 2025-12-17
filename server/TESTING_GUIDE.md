# Testing Guide for User Contribution Feature

## Overview

This guide will help you test the new user contribution feature with screenshot uploads and admin approval system.

## Prerequisites

- Server should be running on `http://localhost:3001`
- Frontend should be running on `http://localhost:5173`
- Database should be connected and tables created

## Testing Steps

### 1. Test User Contribution Submission

**As a Regular User:**

1. Login as a regular user (not admin)
2. Navigate to Finance page
3. Click "টাকা জমা দিন" (Add Money) button
4. Fill in the form:
   - Month: Select current or any month
   - Amount: Enter amount (e.g., 500)
   - Payment Method: Select bKash, Nagad, Rocket, or Bank
   - Transaction ID: Enter transaction ID
   - Screenshot: Upload a screenshot image
5. Click "জমা দিন ✓" (Submit)
6. You should see a success message
7. The contribution should show as "বিচারাধীন" (Pending) in your contributions list

**Expected API Call:**

```
POST http://localhost:3001/api/finance/contributions/user
Content-Type: multipart/form-data

Fields:
- amount: number
- method: string
- referenceId: string
- month: string (YYYY-MM)
- screenshot: file
```

### 2. Test Admin Viewing Pending Contributions

**As an Admin:**

1. Login as admin
2. Navigate to Finance page
3. Click on "অপেক্ষমাণ অবদান" (Pending Contributions) tab
4. You should see a badge with the count of pending contributions
5. All pending contributions should be listed with member details

**Expected API Call:**

```
GET http://localhost:3001/api/finance/contributions?status=pending
```

### 3. Test Admin Review and Approval

**As an Admin:**

1. In the Pending Contributions tab, click "পর্যালোচনা করুন" (Review) on any contribution
2. A modal should open showing:
   - Member name and phone
   - Amount
   - Month
   - Payment method
   - Transaction ID
   - Screenshot (click to view full size)
3. Click "✓ অনুমোদন" (Approve) to approve
4. Success message should appear
5. The contribution should disappear from pending list
6. It should now appear in "সকল অবদান" (All Contributions) with "অনুমোদিত" (Approved) status
7. The summary cards should update with the new total

**Expected API Call:**

```
PUT http://localhost:3001/api/finance/contributions/:id/status
Content-Type: application/json

Body:
{
  "status": "approved"
}
```

### 4. Test Admin Rejection

**As an Admin:**

1. Review a pending contribution
2. Click "❌ প্রত্যাখ্যান" (Reject)
3. The contribution should be rejected
4. It should not appear in approved contributions list

**Expected API Call:**

```
PUT http://localhost:3001/api/finance/contributions/:id/status
Content-Type: application/json

Body:
{
  "status": "rejected",
  "rejectedReason": "optional reason"
}
```

### 5. Test Screenshot Upload

**Check File System:**

1. After a user submits a contribution with screenshot
2. Check `server/uploads/screenshots/` directory
3. The screenshot should be saved with format: `screenshot-{timestamp}-{random}.{ext}`
4. The file should be accessible via: `http://localhost:3001/uploads/screenshots/{filename}`

### 6. Test Responsive Design

**Mobile Testing:**

1. Open the app on mobile browser or use DevTools responsive mode
2. Click "টাকা জমা দিন" button
3. The modal should be full-width on mobile
4. All text should be readable
5. Screenshot upload should trigger camera on mobile devices
6. Buttons should stack vertically and be easy to tap

## Common Issues

### Issue: Screenshot not uploading

**Solution:** Check that multer middleware is properly configured and uploads directory exists

### Issue: 500 error on submission

**Solution:** Check server logs for database errors. Ensure all new columns exist in contributions table

### Issue: Pending count not showing

**Solution:** Ensure the API call to get pending contributions is working and returning data

### Issue: Screenshot not displaying in review modal

**Solution:** Check that the screenshot_url is correct and the uploads directory is being served as static files

## Database Queries for Manual Testing

```sql
-- View all contributions with status
SELECT c.*, u.name, u.phone
FROM contributions c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY c.date DESC;

-- View only pending contributions
SELECT * FROM contributions WHERE status = 'pending';

-- View approved contributions
SELECT * FROM contributions WHERE status = 'approved';

-- Check if new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contributions';
```

## Success Criteria

✅ Users can submit contributions with screenshots
✅ Screenshots are uploaded and stored correctly
✅ Admins see pending contributions with count badge
✅ Admins can review contributions and see screenshots
✅ Admins can approve contributions
✅ Admins can reject contributions
✅ Financial summary updates after approval
✅ Modal is responsive on mobile devices
✅ All text is in Bengali
✅ Payment numbers are displayed based on selected method
