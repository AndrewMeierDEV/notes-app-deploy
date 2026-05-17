## Requirements

- Node.js `v25.9.0`
- npm `11.12.1`
- PostgreSQL `16.x` or compatible
- Bash or Zsh on Linux/macOS

## Stack

- Frontend: React `19.2.6`, Vite `8.0.12`
- Backend: NestJS `11.0.1`, TypeScript `5.7.3`
- ORM: Prisma `5.22.0`
- Database: PostgreSQL

## Configuration

The backend reads the database connection from `backend/.env`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notes_app?schema=public"
```

Before running the app, make sure the `notes_app` database exists in PostgreSQL. You can also change `DATABASE_URL` if your local credentials are different.

## Run The App

From the project root:

```bash
./run.sh
```

The script installs dependencies, generates the Prisma Client, runs database migrations and starts both apps.

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Manual Run

Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API

- `GET /notes`: get active notes
- `GET /notes/archived`: get archived notes
- `GET /notes/categories`: get all categories
- `POST /notes`: create a note
- `PATCH /notes/:id`: update a note
- `PATCH /notes/:id/archive`: archive a note
- `PATCH /notes/:id/unarchive`: restore an archived note
- `DELETE /notes/:id`: delete a note

## Useful Scripts

Backend:

```bash
npm run build
npm run test
npm run start:dev
```

Frontend:

```bash
npm run build
npm run lint
npm run dev
```

## Live Demo

Frontend:
https://notes-app-deploy-roan.vercel.app

Backend API:
https://notes-app-deploy-w8rg.onrender.com
