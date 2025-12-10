# Business Form - Setup Instructions

## 📋 What's Been Created

Your project now includes:

### 1. **Backend Server** (`server.js`)
   - Express.js API with 7 endpoints
   - PostgreSQL database integration
   - Input validation & sanitization
   - Error handling & logging

### 2. **Database Setup Scripts** (`scripts/`)
   - `init-db.js` - Creates database, tables, indexes, triggers
   - `seed-db.js` - Populates with 5 sample submissions

### 3. **Configuration**
   - `package.json` - Dependencies and scripts
   - `.env.example` - Environment template

### 4. **Documentation**
   - `API_DOCUMENTATION.md` - Full API reference
   - `DATABASE_SCHEMA.md` - Database design details

---

## 🚀 Getting Started

### Step 1: Install Node Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- pg (PostgreSQL client)
- validator (input validation)
- cors (cross-origin requests)
- helmet (security headers)
- dotenv (environment variables)

### Step 2: Set Up Environment Variables
```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# Example:
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=businessform_db
```

### Step 3: Initialize PostgreSQL Database
```bash
npm run init-db
```

This will:
- Create `businessform_db` database
- Create `submissions` table with proper schema
- Add 3 indexes for performance
- Create trigger for auto-timestamps

### Step 4: (Optional) Seed Sample Data
```bash
npm run seed-db
```

This inserts 5 example business submissions for testing.

### Step 5: Start the Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

You'll see:
```
🚀 Server running on http://localhost:3000
```

---

## 📡 API Endpoints (7 Total)

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Submit Business Idea (Form Endpoint)
```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "address": "123 Main St",
    "postalCode": "12345",
    "businessIdea": "My Idea",
    "requirements": "Detailed requirements..."
  }'
```

### 3. List All Submissions
```bash
curl http://localhost:3000/api/submissions
```

### 4. Get Single Submission
```bash
curl http://localhost:3000/api/submissions/1
```

### 5. Update Submission
```bash
curl -X PUT http://localhost:3000/api/submissions/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### 6. Delete Submission
```bash
curl -X DELETE http://localhost:3000/api/submissions/1
```

### 7. Get Statistics
```bash
curl http://localhost:3000/api/statistics
```

---

## 🗄️ Database Schema

**Table: submissions**

| Column | Type | Details |
|--------|------|---------|
| id | SERIAL | Primary key, auto-increment |
| first_name | VARCHAR(100) | Required |
| last_name | VARCHAR(100) | Required |
| email | VARCHAR(255) | Required, unique |
| phone | VARCHAR(20) | Required |
| address | VARCHAR(255) | Required |
| postal_code | VARCHAR(20) | Required |
| business_idea | TEXT | Required, min 5 chars |
| requirements | TEXT | Required, min 10 chars |
| status | VARCHAR(20) | Default: 'pending' |
| created_at | TIMESTAMP | Auto-set on insert |
| updated_at | TIMESTAMP | Auto-updated |
| reviewed_at | TIMESTAMP | NULL by default |
| notes | TEXT | NULL by default |

---

## ✅ Validation Rules

- **Email**: Must be valid format, unique in database
- **Phone**: Must be valid phone number
- **First/Last Name**: Non-empty, max 100 chars
- **Address**: Non-empty, max 255 chars
- **Postal Code**: Non-empty, max 20 chars
- **Business Idea**: Min 5 characters
- **Requirements**: Min 10 characters

---

## 🔒 Security Features

✅ Input validation on all fields  
✅ HTML entity escaping (prevents XSS)  
✅ Email normalization  
✅ Parameterized SQL queries (prevents SQL injection)  
✅ CORS protection  
✅ Helmet.js security headers  
✅ Unique email constraint  

---

## 📂 File Structure

```
businessform/
├── server.js                    ← Main API server
├── package.json                 ← Dependencies
├── .env                         ← Your config (create from .env.example)
├── .env.example                 ← Template
├── API_DOCUMENTATION.md         ← Full API reference
├── DATABASE_SCHEMA.md           ← Database design
├── SETUP.md                     ← This file
├── scripts/
│   ├── init-db.js              ← Initialize database
│   └── seed-db.js              ← Add sample data
└── Public/                      ← Frontend (pre-existing)
    ├── index.html
    ├── script.js
    └── style.css
```

---

## 🧪 Testing the Complete Flow

```bash
# 1. Start server
npm run dev

# 2. In another terminal, submit the form
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1-555-987-6543",
    "address": "456 Oak Ave",
    "postalCode": "54321",
    "businessIdea": "E-learning Platform",
    "requirements": "Create an interactive online learning platform with video courses, quizzes, and certifications"
  }'

# 3. Get the submission back
curl http://localhost:3000/api/submissions/1

# 4. Check statistics
curl http://localhost:3000/api/statistics
```

---

## 🛠️ Troubleshooting

### PostgreSQL not running?
- Windows: Use pgAdmin or `psql` to verify
- macOS: `brew services start postgresql`
- Linux: `sudo service postgresql start`

### Database already exists error?
- Just means database was created previously (normal)
- It will skip table creation if already exists

### Port 3000 already in use?
- Change in `.env`: `PORT=3001`
- Or kill existing process: `lsof -i :3000` then `kill -9 <PID>`

### "Cannot find module 'pg'"?
- Run: `npm install`

### Email already exists?
- Each email must be unique
- Use different email or delete previous record

---

## 📊 Next Steps

Once server is running:

1. **Test with Frontend**: Open `Public/index.html` in browser
   - Form now submits to `http://localhost:3000/api/submit`
   - Success message displays returned data

2. **View Database Directly**:
   ```bash
   psql -U postgres -d businessform_db
   SELECT * FROM submissions;
   ```

3. **Build Admin Dashboard**: 
   - Use `/api/submissions` endpoint to list all
   - Build UI to manage submissions

4. **Add More Features**:
   - Authentication/authorization
   - File uploads
   - Email notifications
   - Export to CSV/PDF
   - Full-text search

---

## 📖 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with cURL examples
- **DATABASE_SCHEMA.md** - Database design and data flow
- **SETUP.md** - This file (quick start)

---

## 💾 Commands Reference

```bash
npm install              # Install dependencies
npm run init-db          # Create database & tables
npm run seed-db          # Add sample data
npm run dev              # Start with auto-reload
npm start                # Start server
```

---

**All set! Your backend is ready to receive form submissions.** 🎉
