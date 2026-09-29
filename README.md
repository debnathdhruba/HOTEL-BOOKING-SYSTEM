# Hotel Room Booking System

A full-stack hotel booking application with a guest website, admin dashboard, and REST API.

## Features

- **Authentication:** Registration, login, email verification, password reset, and role-based access.
- **Rooms:** Search, filters, image uploads, pricing, and availability management.
- **Bookings:** Date validation, conflict checks, booking history, and cancellations.
- **Reviews:** Room ratings and review management.
- **Admin:** Manage users, rooms, bookings, and dashboard statistics.

## Tech Stack

- **Frontend:** Next.js, React, Redux Toolkit, Ant Design
- **Admin Panel:** React, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Security:** JWT, bcrypt, Helmet, and rate limiting

## Setup

Install dependencies in each directory:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin-panel
npm install
```

Configure environment variables for the database, authentication, email service, and API URLs:

- `backend/.env`
- `frontend/.env.local`
- `admin-panel/.env`

Start each application in a separate terminal from the project root:

```bash
# Backend
cd backend
npm run dev
```

```bash
# Frontend — http://localhost:3034
cd frontend
npm run dev
```

```bash
# Admin panel — http://localhost:3033
cd admin-panel
npm start
```

## Testing

```bash
cd backend
npm test
```

Before deployment, configure production environment variables, API URLs, and CORS settings.