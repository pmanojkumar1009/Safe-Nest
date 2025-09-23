# SafeNest — Smart Complaint & Feedback Portal

A full‑stack web application for managing student complaints and feedback with role‑based access (Student, Sub-Admin, Main Admin). Frontend: React + Vite + TypeScript + Tailwind CSS. Backend: Express + MongoDB + JWT.

See the full report: [docs/Project_Report.md](./docs/Project_Report.md)


## Features
- **Authentication & Roles**: JWT-based auth with roles `student`, `subadmin`, `mainadmin`.
- **Complaint Management**: Create, list, assign, and update status with remarks.
- **Role Dashboards**: Dedicated dashboards for Students, Sub-Admins, and Main Admin.
- **Notifications**: Assignment and status change notifications.
- **Analytics & Settings**: Summary cards, charts scaffolding, and settings panels.
- **Light/Dark Theme**: Persisted in localStorage.


## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, `lucide-react`
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, `bcryptjs`, `cors`, `dotenv`
- **Tooling**: ESLint, PostCSS, Tailwind


## Project Layout
```
Full Stack Project/
├─ package.json
├─ server/
│  └─ index.js                 # Express API, Mongoose models, routes
├─ src/
│  ├─ App.tsx                  # Role-aware shell (Student/SubAdmin/MainAdmin)
│  ├─ context/                 # Auth + Theme contexts
│  ├─ components/              # Dashboards, forms, cards
│  ├─ services/api.ts          # Axios instance + API helpers
│  └─ types/                   # Shared TS types
├─ docs/Project_Report.md
├─ tailwind.config.js
├─ vite.config.ts
└─ .env                        # Your environment variables (create this)
```


## Prerequisites
- Node.js 18+ and npm
- MongoDB (local `mongod` or hosted cluster)


## Environment Variables
Create a `.env` in the repo root:

```
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/safenest
JWT_SECRET=your_strong_secret_here
```

Notes
- If omitted, `MONGODB_URI` defaults to `mongodb://localhost:27017/safenest`.
- If omitted, `JWT_SECRET` falls back to a development string.
- Frontend base URL is `http://localhost:5000/api` in `src/services/api.ts`.


## Install
```
npm install
```


## Run (Development)
Open two terminals in the project root:

1) API Server (Express)
```
npm run server
```
- Health check: `GET http://localhost:5000/api/health`
- On first DB connection, default users are seeded.

2) Frontend (Vite)
```
npm run dev
```
- Usually at `http://localhost:5173`
- Frontend talks to `http://localhost:5000/api`

Windows PowerShell tips
- Set env var temporarily: `$env:PORT=5000; npm run server`


## Quick Demo (End-to-End)
Follow these steps to see all roles in action.

1) Login as Main Admin
- Email: `admin@safenest.com`
- Password: `password123`
- Explore: `Overview`, `All Complaints`, `Sub Admins`, `Users`, `Analytics`.
- In `Sub Admins`, you can copy a sub-admin email and use “Test Login” from UI.

2) Submit a Student Complaint
- Logout, then either Register a new Student or use seeded:
  - Email: `student@safenest.com`
  - Password: `password123`
- Open “Submit New Complaint” and create one (choose department/category/priority).

3) Assign as Main Admin
- Login as Main Admin again.
- Go to `All Complaints`, filter/search as needed.
- For a `pending` complaint, choose a department sub-admin in “Assign to”.

4) Resolve as Sub-Admin
- Login as the relevant Sub Admin (e.g. IT: `it-admin@safenest.com`, password `password123`).
- Open `Department Complaints`, pick the assigned issue.
- Update status to `in-progress` or `resolved` (remarks are required by the API for these).

5) Notifications
- Students and sub-admins receive notifications on assignment and status changes (`/api/notifications`).


## Seeded Accounts
- Main Admin: `admin@safenest.com` / `password123`
- Sub Admins (examples):
  - IT: `it-admin@safenest.com` / `password123`
  - CS: `cs-admin@safenest.com` / `password123`
  - Others follow: `<department>.admin@safenest.com`
- Students: `student@safenest.com`, `sarah@safenest.com`, `mike@safenest.com` (all `password123`)


## API Reference (Selected)
Auth uses a Bearer token. The frontend stores the token in `localStorage` and attaches it automatically via an axios interceptor.

- POST `/api/auth/login` → `{ user, token }`
- POST `/api/auth/register` → `{ user, token }` (roles: `student` | `subadmin`)
- GET `/api/complaints` → List by role
- POST `/api/complaints` → Create (student)
- PUT `/api/complaints/:id/status` → Update (subadmin/mainadmin). Main admin cannot directly set `resolved`.
- PUT `/api/complaints/:id/assign` → Assign (main admin)
- GET `/api/admin/users` → All users (main admin)
- GET `/api/admin/subadmins` → Sub-admins (main admin)
- GET `/api/notifications` → Current user’s notifications (query: `onlyUnread=true|false`)
- PUT `/api/notifications/:id/read` → Mark read
- PUT `/api/notifications/read-all` → Mark all read
- GET `/api/health` → Health check


## cURL Recipes
Replace `<TOKEN>` with a valid JWT from login.

Login
```
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safenest.com","password":"password123"}'
```

Submit Complaint (Student)
```
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{
    "title":"WiFi down",
    "description":"No connectivity in lab.",
    "department":"Information Technology",
    "category":"Infrastructure",
    "priority":"high"
  }'
```

Assign Complaint (Main Admin)
```
curl -X PUT http://localhost:5000/api/complaints/<COMPLAINT_ID>/assign \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"subAdminId":"<SUBADMIN_ID>", "remarks":"Routing to IT admin"}'
```

Update Status (Sub Admin)
```
curl -X PUT http://localhost:5000/api/complaints/<COMPLAINT_ID>/status \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"status":"in-progress", "remarks":"Investigating router"}'
```

Notifications
```
curl -X GET "http://localhost:5000/api/notifications?onlyUnread=true" \
  -H "Authorization: Bearer <TOKEN>"
```


## Frontend Highlights
- Role-aware shell: `src/App.tsx`
- Auth: `src/context/AuthContext.tsx`
- Theme: `src/context/ThemeContext.tsx`
- Dashboards: `src/components/dashboard/`
- Complaints UI: `src/components/complaints/`
- Admin tools: `src/components/admin/CreateSubAdminForm.tsx`


## Build & Preview
```
npm run build
npm run preview
```
Output goes to `dist/`. The Express server here does not serve the frontend by default; either deploy separately or add static serving to `server/index.js`.


## Linting
```
npm run lint
```


## Troubleshooting
- Mongo connection retries with backoff are built-in. Validate `MONGODB_URI` and network.
- 401/403 clears token and redirects home (axios interceptor).
- CORS enabled via `cors` middleware.
- Port conflicts: server `5000`, Vite `5173`.


## Notes & Utilities
- `clear-credentials.html` exists to help clear stored credentials in the browser if needed.


## License
This project is provided as-is for educational and internal use. Add your preferred license here.
