# Team Task Manager (Full-Stack)

A full-stack web app where users can sign up/login, create projects, manage team members, assign tasks, and track progress with role-based access (`Admin` / `Member`).

## Features

- Authentication (Signup/Login) with JWT
- Project creation and team member management
- Task creation, assignment, status updates, due dates
- Dashboard with:
  - total tasks
  - status distribution
  - overdue tasks
- Role-based access control:
  - System `Admin` can access all projects/tasks
  - Project `Admin` can add members
  - `Member` can access only assigned project scope

## Tech Stack

- Backend: Node.js, Express
- Database: SQL via Sequelize (`SQLite` for local, `PostgreSQL` for Railway)
- Frontend: HTML, CSS, Vanilla JavaScript
- Auth: JWT + bcrypt

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `POST /api/projects/:projectId/tasks`

### Tasks

- `PATCH /api/tasks/:taskId`

### Dashboard

- `GET /api/dashboard`

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Run app:
   ```bash
   npm run dev
   ```
4. Open:
   - [http://localhost:5000](http://localhost:5000)

## Railway Deployment (Mandatory)

1. Push this repo to GitHub.
2. Go to [Railway](https://railway.app/), create a new project from GitHub repo.
3. Add a PostgreSQL service in Railway.
4. Add environment variables in app service:
   - `JWT_SECRET` = a strong random string
   - `DATABASE_URL` = Railway PostgreSQL connection string
   - `NODE_ENV` = `production`
5. Deploy. Railway runs `npm start`.
6. Verify `/api/health` returns status ok.

## Submission Checklist

- Live URL (Railway)
- GitHub Repo URL
- README (this file)
- 2-5 minute demo video showing:
  - Signup/Login
  - Project creation
  - Adding members
  - Creating and updating tasks
  - Dashboard and overdue tracking

## Notes

- Schema sync uses `sequelize.sync({ alter: true })` for speed during assignment.
- For production-grade apps, use migration files and stricter secrets management.
