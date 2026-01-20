# Business Form Database Schema & Project Documentation

## 📋 Project Context

**Business_form** is a web application for collecting and managing business ideas. Users submit their:
- Contact information (name, email, phone, address)
- Business idea details (title and requirements)

The system stores submissions in a PostgreSQL database and provides a REST API for CRUD operations.

---

## 🗄️ Database Architecture

### Technology Stack
- **Database**: PostgreSQL
- **Server**: Node.js + Express.js
- **ORM**: Native pg library with parameterized queries
- **Validation**: validator.js library

### Database: `businessform_db`

#### Table: `submissions`

```
┌─────────────────────────────────────────────────────────────────┐
│                      submissions                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                    │ SERIAL PRIMARY KEY                  │
│ first_name                 │ VARCHAR(100) NOT NULL               │
│ last_name                  │ VARCHAR(100) NOT NULL               │
│ email (UNIQUE)             │ VARCHAR(255) NOT NULL               │
│ phone                      │ VARCHAR(20) NOT NULL                │
│ address                    │ VARCHAR(255) NOT NULL               │
│ postal_code                │ VARCHAR(20) NOT NULL                │
│ business_idea              │ TEXT NOT NULL                       │
│ requirements               │ TEXT NOT NULL                       │
│ status                     │ VARCHAR(20) DEFAULT 'pending'       │
│ created_at                 │ TIMESTAMP DEFAULT NOW()             │
│ updated_at                 │ TIMESTAMP DEFAULT NOW()             │
│ reviewed_at (NULL)         │ TIMESTAMP                           │
│ notes (NULL)               │ TEXT                                │
└─────────────────────────────────────────────────────────────────┘
```

### Indexes

```sql
-- Fast email lookup (for duplicates, authentication)
CREATE INDEX idx_submissions_email ON submissions(email);

-- Sort by creation date efficiently
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Filter by status quickly
CREATE INDEX idx_submissions_status ON submissions(status);
```

### Triggers

```sql
-- Auto-update timestamp on row modification
CREATE TRIGGER update_submissions_timestamp
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

---

## 🔄 Data Flow

```
┌─────────────────────────┐
│   Frontend (HTML Form)  │
│  - Contact Info         │
│  - Business Details     │
└────────────┬────────────┘
             │ POST /api/submit (JSON)
             ▼
┌─────────────────────────┐
│  Express Server         │
│  - Validate Input       │
│  - Sanitize Data        │
│  - Check Constraints    │
└────────────┬────────────┘
             │ INSERT Query
             ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  - Store Submission     │
│  - Update Timestamp     │
│  - Return Confirmation  │
└─────────────────────────┘
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/submit` | Create new submission | 201 |
| GET | `/api/submissions` | List all submissions | 200 |
| GET | `/api/submissions/:id` | Get single submission | 200 |
| PUT | `/api/submissions/:id` | Update submission | 200 |
| DELETE | `/api/submissions/:id` | Delete submission | 200 |
| GET | `/api/statistics` | Dashboard stats | 200 |
| GET | `/api/health` | Health check | 200 |

---

## 🔐 Data Validation Rules

| Field | Type | Constraints |
|-------|------|-------------|
| firstName | String | Required, non-empty, max 100 chars |
| lastName | String | Required, non-empty, max 100 chars |
| email | Email | Required, valid email, unique in DB |
| phone | String | Required, valid phone format |
| address | String | Required, non-empty, max 255 chars |
| postalCode | String | Required, non-empty, max 20 chars |
| businessIdea | String | Required, min 5 characters |
| requirements | String | Required, min 10 characters |

---

## 📊 Sample Submissions

The database can be seeded with 5 example submissions:

```
ID 1: John Anderson - AI Project Management Tool
ID 2: Sarah Chen - Sustainable Fashion E-Commerce
ID 3: Michael Rodriguez - Healthcare IoT System
ID 4: Emily Johnson - Real Estate Virtual Tours
ID 5: David Kim - FinTech Personal Finance App
```

Run: `npm run seed-db`

---

## 🚀 Installation & Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start Server
```bash
npm run dev        # Development (with auto-reload)
npm start          # Production
```

### 5. Seed Sample Data (Optional)
```bash
npm run seed-db
```

---

## 🧪 Quick Test

```bash
# Start server
npm run dev

# In another terminal, test submission
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1-555-123-4567",
    "address": "123 Test St",
    "postalCode": "12345",
    "businessIdea": "Test Idea",
    "requirements": "This is a test submission"
  }'
```

---

## 📝 Response Examples

### ✅ Success Response (POST /api/submit)
```json
{
  "success": true,
  "message": "Submission received successfully!",
  "data": {
    "id": 6,
    "createdAt": "2024-12-10T10:35:00.000Z",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1-555-123-4567",
    "address": "123 Test St",
    "postalCode": "12345",
    "businessIdea": "Test Idea",
    "requirements": "This is a test submission"
  }
}
```

### ❌ Error Response (Validation)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Valid email address is required",
    "Detailed requirements must be at least 10 characters long"
  ]
}
```

---

## 🛠️ Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Validation**: validator.js
- **Security**: helmet, cors
- **Env**: dotenv

---

## 📦 Project Structure

```
businessform/
├── server.js                          # Main API server
├── package.json                       # Dependencies
├── .env.example                       # Environment template
├── API_DOCUMENTATION.md               # Full API docs
├── DATABASE_SCHEMA.md                 # This file
├── scripts/
│   ├── init-db.js                    # Create tables & indexes
│   └── seed-db.js                    # Sample data
├── Public/                            # Frontend
│   ├── index.html                    # Form UI
│   ├── script.js                     # Form logic
│   └── style.css                     # Styling
└── README.md                          # Project overview
```

---

## ✨ Key Features

✅ **Robust Validation** - Server-side input validation with detailed error messages  
✅ **Security** - Input sanitization, SQL injection protection, CORS  
✅ **Auto Timestamps** - Automatic created_at and updated_at tracking  
✅ **Unique Emails** - Prevent duplicate submissions  
✅ **Pagination** - Efficient data retrieval with limit/offset  
✅ **Sorting** - Flexible sorting by multiple fields  
✅ **Statistics** - Dashboard metrics endpoint  
✅ **Error Handling** - Comprehensive error responses  

---

## 🔄 Complete Request/Response Cycle

```
Frontend Form Fill
    ↓
Form Validation (Client-side HTML5)
    ↓
POST /api/submit with JSON
    ↓
Server Receives Request
    ↓
Extract Fields from Body
    ↓
Validate Each Field
    ↓
Sanitize Input (escape HTML, normalize email)
    ↓
Query: INSERT INTO submissions (...)
    ↓
Database Inserts & Returns ID + Timestamp
    ↓
Return 201 with Success Message + Data
    ↓
Frontend Shows Success Message
    ↓
Clear Form
    ↓
Scroll to Success Section
```

---

**Created**: December 10, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
