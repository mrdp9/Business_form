# Business Form API - Complete Setup Guide

## 📋 Project Overview

This is a full-stack business idea submission platform with:
- **Frontend**: Beautiful React-like HTML form with animations
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with relational schema
- **Features**: Form submission, data storage, CRUD operations, statistics

## 🗄️ Database Schema

### Submissions Table

```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    business_idea TEXT NOT NULL,
    requirements TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    notes TEXT
);
```

**Fields:**
- `id`: Unique submission identifier (auto-incremented)
- `first_name`, `last_name`: Submitter's name
- `email`: Email address (unique constraint)
- `phone`: Contact phone number
- `address`: Street address
- `postal_code`: ZIP/postal code
- `business_idea`: Business title/concept
- `requirements`: Detailed requirements and specifications
- `status`: Submission status (pending, approved, rejected, etc.)
- `created_at`: Timestamp of submission
- `updated_at`: Last update timestamp
- `reviewed_at`: When the submission was reviewed
- `notes`: Admin notes/comments

**Indexes:**
- `idx_submissions_email`: Fast email lookups
- `idx_submissions_created_at`: Sort by creation date
- `idx_submissions_status`: Filter by status

**Triggers:**
- `update_submissions_timestamp`: Auto-updates `updated_at` on row changes

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v14+ installed
- **PostgreSQL** v12+ running locally or remote
- **npm** installed

### 2. Installation

```bash
# Clone/navigate to project directory
cd businessform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Windows:
type .env
# macOS/Linux:
cat .env
```

### 3. Database Setup

```bash
# Initialize database and create tables
npm run init-db

# (Optional) Seed with sample data
npm run seed-db
```

### 4. Start the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
```

---

## 📡 API Endpoints

### 1. Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-10T10:30:00.000Z",
  "database": "2024-12-10T10:30:00.000Z"
}
```

### 2. Submit Business Idea (Main Form)
```
POST /api/submit
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "address": "123 Main St",
  "postalCode": "12345",
  "businessIdea": "Innovative AI Platform",
  "requirements": "Full-stack web app with mobile support..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Submission received successfully!",
  "data": {
    "id": 1,
    "createdAt": "2024-12-10T10:30:00.000Z",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "address": "123 Main St",
    "postalCode": "12345",
    "businessIdea": "Innovative AI Platform",
    "requirements": "Full-stack web app with mobile support..."
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Email is required and must be valid"]
}
```

### 3. Get All Submissions
```
GET /api/submissions?limit=20&offset=0&sortBy=created_at&order=DESC
```

**Query Parameters:**
- `limit`: Number of results (default: 20)
- `offset`: Number of results to skip (default: 0)
- `sortBy`: Field to sort by: `id`, `created_at`, `first_name`, `email` (default: `created_at`)
- `order`: `ASC` or `DESC` (default: `DESC`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "address": "123 Main St",
      "postal_code": "12345",
      "business_idea": "Innovative AI Platform",
      "requirements": "Full-stack web app...",
      "status": "pending",
      "created_at": "2024-12-10T10:30:00.000Z",
      "updated_at": "2024-12-10T10:30:00.000Z",
      "reviewed_at": null,
      "notes": null
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "page": 1
  }
}
```

### 4. Get Single Submission
```
GET /api/submissions/:id
```

**Example:** `GET /api/submissions/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    ...
  }
}
```

### 5. Update Submission
```
PUT /api/submissions/:id
Content-Type: application/json
```

**Request Body:** (partial update, include only fields to update)
```json
{
  "status": "approved",
  "notes": "Great idea! Let's discuss further.",
  "reviewed_at": "2024-12-10T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission updated successfully",
  "data": {
    "id": 1,
    ...
  }
}
```

### 6. Delete Submission
```
DELETE /api/submissions/:id
```

**Example:** `DELETE /api/submissions/1`

**Response:**
```json
{
  "success": true,
  "message": "Submission deleted successfully",
  "deletedId": 1
}
```

### 7. Get Statistics
```
GET /api/statistics
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalSubmissions": 50,
    "recentSubmissions": 12,
    "firstSubmission": "2024-12-01T08:00:00.000Z",
    "lastSubmission": "2024-12-10T10:30:00.000Z"
  }
}
```

---

## 🔒 Security Features

- ✅ **Input Validation**: All fields validated server-side
- ✅ **Sanitization**: HTML entities escaped to prevent XSS
- ✅ **Email Normalization**: Consistent email format
- ✅ **Phone Validation**: Checks for valid phone format
- ✅ **CORS Protection**: Whitelist allowed origins
- ✅ **Helmet.js**: HTTP headers security
- ✅ **Unique Email**: Database constraint prevents duplicates
- ✅ **SQL Injection Protection**: Parameterized queries

---

## 🧪 Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Submit form
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "address": "123 Main St",
    "postalCode": "12345",
    "businessIdea": "My Business Idea",
    "requirements": "Detailed requirements here..."
  }'

# Get all submissions
curl http://localhost:3000/api/submissions

# Get statistics
curl http://localhost:3000/api/statistics

# Get single submission
curl http://localhost:3000/api/submissions/1

# Update submission
curl -X PUT http://localhost:3000/api/submissions/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Delete submission
curl -X DELETE http://localhost:3000/api/submissions/1
```

---

## 📊 Environment Variables

Create `.env` file in project root:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=businessform_db

# CORS Origins
CORS_ORIGIN=http://localhost,http://localhost:3000
```

---

## 🛠️ Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running
- Start PostgreSQL: `sudo service postgresql start` (Linux) or use Docker

### Error: "database does not exist"
- Run: `npm run init-db`

### Email already exists error
- Email must be unique. Use a different email or delete the previous submission.

### CORS errors in browser
- Update `CORS_ORIGIN` in `.env` to match your frontend URL

---

## 📁 File Structure

```
businessform/
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── scripts/
│   ├── init-db.js              # Database initialization
│   └── seed-db.js              # Sample data seeding
├── Public/                      # Frontend
│   ├── index.html              # Form UI
│   ├── script.js               # Frontend logic
│   └── style.css               # Styling
└── README.md                    # This file
```

---

## 🚀 Next Steps (Optional)

1. **Authentication**: Add JWT tokens for API security
2. **File Uploads**: Support document/image uploads
3. **Email Notifications**: Send confirmation emails
4. **Admin Dashboard**: Build admin UI to manage submissions
5. **Analytics**: Track submission trends and metrics
6. **Search**: Full-text search on business ideas
7. **Export**: CSV/PDF export functionality
8. **Rate Limiting**: Prevent submission spam

---

## 📝 License

MIT License - Feel free to use for your projects

