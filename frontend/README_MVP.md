# DidYouDoIt? - MVP Prototype

This is a working frontend prototype for the DidYouDoIt assignment tracking platform.

## Features Implemented
- **Home Page**: Landing page with animations and simulated login.
- **Assignments Page**: Filterable list of assignments, progress tracking, completion toggling.
- **Admin Dashboard**: Stats overview, CRUD for Assignments and Groups.
- **Mock Data**: In-memory data persistence (resets on reload).

## Tech Stack
- React + TypeScript
- Tailwind CSS + Shadcn UI
- Framer Motion (Animations)
- React Query (Data Fetching State)
- React Router (Navigation)

## Getting Started

1. **Install Dependencies** (if not done):
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm start
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000`.

## Test Credentials (Mock Auth)
Click the buttons on the Home page to sign in:
- **User**: `alice@example.com` (Member of 'Engineering Team')
- **Admin**: `admin@example.com` (Full access)

## Admin Features
- Go to `/admin` after logging in as Admin.
- Create new assignments (try adding a YouTube URL to see auto-thumbnail).
- Create new groups and add members by email.
