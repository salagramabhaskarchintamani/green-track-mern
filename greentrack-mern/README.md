# GreenTrack — Tree Plantation Tracker (MERN)

A hackathon-ready MERN app to register trees, track their status, monitor planting activity, and export reports. Includes React + Vite UI, Express REST API, MongoDB/Mongoose models, JWT authentication, volunteer/admin roles, search, filters, dashboard metrics, plantation-site grouping, inspections, and CSV export.

## Features

- **Dashboard:** trees registered, healthy trees, trees needing care, calculated survival rate, status breakdown, and six-month planting activity.
- **Tree CRUD:** create, view, update and (admin only) delete tree records.
- **Plantation locations:** grouped location cards with species and healthy-tree counts.
- **Search and filters:** search by tree ID, species, plantation location, or planter; filter by status.
- **Inspection update:** update a tree's status and timestamp from the registry.
- **Auth & roles:** JWT login; new registrations are volunteers; administrators can delete records.
- **Export:** downloads the current registry/search result as CSV.
- **Responsive UI:** desktop dashboard plus mobile navigation.

## Tech

- Frontend: React 18, Vite, Lucide icons, hand-crafted responsive CSS.
- Backend: Node.js, Express, Mongoose, MongoDB, JWT, bcrypt, Helmet, CORS and request rate limiting on auth routes.

## Quick start

Requirements: Node.js 20+ recommended and MongoDB (local or MongoDB Atlas).

### 1. Configure MongoDB and the API

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set `MONGODB_URI` to your local MongoDB URL or Atlas connection string. Set `JWT_SECRET` to a long random secret. `CLIENT_ORIGIN` should include your frontend origin (default `http://localhost:5173`).

Then install dependencies and seed demo records:

```bash
npm install
npm run seed:demo
npm run dev
```

API starts at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

The demo seed creates an admin, a volunteer, and 12 example trees if no tree records currently exist. It does not delete or replace existing data. Demo accounts are configured in `backend/.env`:

- Admin: `admin@greentrack.demo` / `GreenTrack123!`
- Volunteer: `volunteer@greentrack.demo` / `Volunteer123!`

**Demo credentials are for local development only. Change them before any public deployment.** The seed script only creates a user when that email doesn't exist; changing the `.env` password won't reset an existing account password.

### 2. Run the React frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). Sign in with the demo admin, or use the volunteer shortcut on the login screen.

### 3. Build check

```bash
cd frontend
npm run build
```

## Project structure

```text
greentrack-mern/
  backend/
    src/
      middleware/auth.js
      models/User.js
      models/Tree.js
      routes/auth.js
      routes/trees.js
      scripts/seedDemo.js
      server.js
    .env.example
    package.json
  frontend/
    src/main.jsx
    src/App.jsx
    src/styles.css
    index.html
    .env.example
    package.json
  README.md
```

## REST API

All tree endpoints require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/register` | Create volunteer account |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/trees` | List/search/filter records |
| `POST` | `/api/trees` | Register a tree |
| `GET` | `/api/trees/stats/summary` | Dashboard metrics |
| `GET` | `/api/trees/:id` | Read one tree |
| `PUT` | `/api/trees/:id` | Update a tree |
| `DELETE` | `/api/trees/:id` | Delete a tree (admin only) |
| `POST` | `/api/trees/:id/inspections` | Record status/inspection date |

List query parameters include `search`, `status`, `location`, `page`, and `limit`.

## Data fields

Each tree record stores a generated tree ID, species, plantation location, optional latitude/longitude, planting date, planter name, status, notes, last inspection date, creator, and timestamps. Valid statuses are `alive`, `needs_attention`, `dead`, `replaced`, and `unverified`.

The displayed survival rate is calculated as `alive / (alive + dead) × 100`. Replaced and unverified trees are excluded from this denominator so unverified records do not falsely inflate the result. If there are no confirmed outcomes, the dashboard shows `—`.

## Suggested six-hour team plan

1. **0:00–0:30 — Setup:** one person configures MongoDB/backend; another inspects the UI structure and tests Node/npm versions.
2. **0:30–1:45 — API and data:** test login, authorization, create/list/update/delete, then seed the examples.
3. **1:00–2:30 — Frontend integration (in parallel):** connect login and the dashboard to the API; validate form errors/loading states.
4. **2:30–3:45 — Feature testing:** test all five statuses, search, filters, location grouping, CSV export, and the admin/volunteer permission difference.
5. **3:45–4:45 — Polish:** verify mobile layout, field validation, error states, and the demo story.
6. **4:45–6:00 — Rehearse:** restart from a clean terminal, show the seeded impact dashboard, add a tree, update an inspection, export CSV, and show the volunteer's restricted delete access.

## Demo flow for judges

1. Sign in as admin and explain the summary metrics.
2. Register a Neem tree with a location, planter and planting date.
3. Update its status to **Needs care** from the tree registry to record an inspection.
4. Search by the location and show the location card and status filter.
5. Export CSV to show the data can be used for reporting.
6. Sign out and sign in as a volunteer to demonstrate role-based deletion restrictions.

## Notes before public deployment

This is a hackathon starter, not a production-hardened service. Use strong unique secrets, enforce HTTPS, configure exact production CORS origins, review retention/privacy requirements, add automated tests, and use an image-upload provider if photo evidence is needed. Map coordinates are optional; the current UI groups sites by location text and does not render an interactive map.
