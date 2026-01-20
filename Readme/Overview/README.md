"# Business Form - Business Idea Submission Platform

A full-stack web application for collecting and managing business ideas with a beautiful frontend and robust backend API.

## 🎯 Overview

**Business Form** allows users to submit their business ideas with contact information. The system stores submissions in a PostgreSQL database and provides a comprehensive REST API for managing submissions.

### Features

✨ **Frontend**
- Beautiful responsive HTML form with glassmorphism design
- Cursor-following animation effect
- Form validation with detailed error messages
- Success/error notifications
- Mobile-optimized

🚀 **Backend**
- Express.js REST API with 7 endpoints
- PostgreSQL database with optimized schema
- Server-side validation and sanitization
- CORS & security headers (Helmet)
- Comprehensive error handling

📊 **Database**
- Automatic timestamps (created_at, updated_at)
- Unique email constraint
- Status tracking (pending, approved, rejected)
- Admin notes and review tracking
- Optimized indexes for performance

---

## 📋 Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Initialize database
npm run init-db

# 4. Start server
npm run dev
```

Server runs on `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/submit` | Create submission |
| GET | `/api/submissions` | List all submissions |
| GET | `/api/submissions/:id` | Get single submission |
| PUT | `/api/submissions/:id` | Update submission |
| DELETE | `/api/submissions/:id` | Delete submission |
| GET | `/api/statistics` | Dashboard statistics |

### Example: Submit Business Idea

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
    "businessIdea": "Innovative AI Platform",
    "requirements": "Full-stack solution with mobile support"
  }'
```

---

## 🗄️ Database Schema

**submissions** table with fields:
- id (Primary Key)
- first_name, last_name
- email (Unique)
- phone, address, postal_code
- business_idea, requirements
- status (pending/approved/rejected)
- created_at, updated_at, reviewed_at
- notes

---

## 📁 Project Structure

```
businessform/
├── server.js                    # Express API
├── package.json                 # Dependencies
├── .env                         # Environment config
├── .env.example                 # Config template
├── SETUP.md                     # Quick start guide
├── API_DOCUMENTATION.md         # Full API docs
├── DATABASE_SCHEMA.md           # Database design
├── scripts/
│   ├── init-db.js              # Database setup
│   └── seed-db.js              # Sample data
└── Public/                      # Frontend
    ├── index.html              # Form UI
    ├── script.js               # Form logic
    └── style.css               # Styling
```

---

## 🔒 Security

✅ Input validation & sanitization  
✅ SQL injection prevention (parameterized queries)  
✅ XSS protection (HTML escaping)  
✅ CORS whitelist  
✅ Security headers (Helmet.js)  
✅ Unique email constraint  

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Quick start guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database design details

---

## 🚀 Scripts

```bash
npm install              # Install dependencies
npm run init-db          # Create database & tables
npm run seed-db          # Add 5 sample submissions
npm run dev              # Start with auto-reload (development)
npm start                # Start server (production)
```

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Get all submissions
curl http://localhost:3000/api/submissions

# Get statistics
curl http://localhost:3000/api/statistics
```

---

## 🛠️ Technology Stack

**Frontend**
- HTML5, CSS3, JavaScript
- Tailwind CSS (CDN)
- Font Awesome 6.0
- Glassmorphism design pattern

**Backend**
- Node.js + Express.js
- PostgreSQL
- validator.js
- helmet, cors, dotenv

---

## 📝 Form Fields

| Field | Type | Validation |
|-------|------|-----------|
| firstName | Text | Required, max 100 chars |
| lastName | Text | Required, max 100 chars |
| email | Email | Required, unique, valid format |
| phone | Tel | Required, valid phone format |
| address | Text | Required, max 255 chars |
| postalCode | Text | Required, max 20 chars |
| businessIdea | Text | Required, min 5 chars |
| requirements | TextArea | Required, min 10 chars |

---

## 🎨 UI Features

- Dark theme with gradient background
- Cursor-following light effect
- Smooth fade-in animations
- Responsive design (mobile-first)
- Glassmorphism cards
- Icon-based section headers
- Success/error notifications
- Form auto-reset on success

---

## 💡 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure database: `cp .env.example .env` and edit
3. ✅ Create tables: `npm run init-db`
4. ✅ Seed data (optional): `npm run seed-db`
5. ✅ Start server: `npm run dev`
6. ✅ Open `Public/index.html` in browser
7. ✅ Test form submission

---

## 📞 Support

For issues or questions:
1. Check **SETUP.md** for quick start
2. Review **API_DOCUMENTATION.md** for endpoint details
3. Check **DATABASE_SCHEMA.md** for data structure

---

## 📄 License

MIT License - Free to use and modify

---

**Ready to go!** 🚀 Follow SETUP.md for quick start instructions." 
