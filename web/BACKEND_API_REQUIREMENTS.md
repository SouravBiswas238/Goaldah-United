# Backend API Requirements for User Contribution Feature

## New API Endpoints Needed

### 1. User Contribution Submission (POST)

**Endpoint:** `POST /api/finance/contributions/user`

**Purpose:** Allow users to submit their own contributions with screenshot

**Request Body (multipart/form-data):**

```javascript
{
  amount: Number (required),
  method: String (required) - 'bkash', 'nagad', 'rocket', 'bank',
  referenceId: String (required) - Transaction ID,
  month: String (required) - Format: 'YYYY-MM',
  screenshot: File (required) - Image file
}
```

**Response:**

```javascript
{
  success: true,
  message: 'Contribution submitted for approval',
  data: {
    id: Number,
    user_id: Number,
    amount: Number,
    method: String,
    reference_id: String,
    month: String,
    screenshot_url: String,
    status: 'pending',
    created_at: Timestamp
  }
}
```

**Notes:**

- Set status to 'pending' by default
- Store user_id from authenticated user
- Upload screenshot to storage and save URL

### 2. Get Pending Contributions (GET)

**Endpoint:** `GET /api/finance/contributions?status=pending`

**Purpose:** Admin can view all pending contributions

**Response:**

```javascript
{
  success: true,
  data: [
    {
      id: Number,
      user_id: Number,
      member_name: String,
      member_phone: String,
      amount: Number,
      method: String,
      reference_id: String,
      month: String,
      screenshot_url: String,
      status: 'pending',
      created_at: Timestamp,
      date: Timestamp
    }
  ]
}
```

### 3. Update Contribution Status (PUT)

**Endpoint:** `PUT /api/finance/contributions/:id/status`

**Purpose:** Admin approves or rejects contributions

**Request Body:**

```javascript
{
  status: String (required) - 'approved' or 'rejected'
}
```

**Response:**

```javascript
{
  success: true,
  message: 'Contribution status updated',
  data: {
    id: Number,
    status: String,
    approved_by: Number, // Admin user ID
    approved_at: Timestamp
  }
}
```

**Business Logic:**

- Only admin can update status
- When approved, add to totalFund in summary
- Send notification to user (optional)
- Store approved_by user ID and timestamp

## Database Schema Updates

### Update `contributions` table:

```sql
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS screenshot_url VARCHAR(255);
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS month VARCHAR(7);  -- Format: YYYY-MM
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS approved_by INT;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
```

## File Upload Configuration

### Storage Setup:

1. Create `uploads/screenshots/` directory
2. Configure multer or similar middleware for file uploads
3. Return public URL for uploaded files
4. Optional: Use cloud storage (AWS S3, Cloudinary, etc.)

### Example Multer Configuration:

```javascript
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/screenshots/",
  filename: (req, file, cb) => {
    cb(null, `screenshot-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
}).single("screenshot");
```

## Payment Numbers Configuration

Update the frontend payment numbers in `Finance.jsx`:

```javascript
const paymentNumbers = {
  bkash: "01700-000000", // Replace with actual bKash number
  nagad: "01700-000000", // Replace with actual Nagad number
  rocket: "01700-000000", // Replace with actual Rocket number
};
```

## Security Considerations

1. **Authentication:** Ensure user is logged in for contribution submission
2. **Authorization:** Only admins can approve/reject contributions
3. **File Validation:** Validate file type and size on server
4. **Rate Limiting:** Prevent spam submissions
5. **SQL Injection:** Use parameterized queries
6. **XSS Protection:** Sanitize user inputs

## Implementation Checklist

- [ ] Create database migration for new columns
- [ ] Set up file upload middleware
- [ ] Implement POST `/api/finance/contributions/user` endpoint
- [ ] Implement GET `/api/finance/contributions?status=pending` endpoint
- [ ] Implement PUT `/api/finance/contributions/:id/status` endpoint
- [ ] Add admin authorization middleware
- [ ] Configure static file serving for screenshots
- [ ] Update actual payment numbers in frontend
- [ ] Test file upload functionality
- [ ] Test approval/rejection workflow
