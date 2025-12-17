# Deploying to Vercel

This repository contains both the frontend (React) and backend (Express) applications. For the best experience on Vercel, you should deploy them as two separate projects linked to the same repository.

## Prerequisites

1.  A [Vercel Account](https://vercel.com).
2.  Your project pushed to GitHub.
3.  Your Supabase Database Connection String (from `backend/.env`).

---

## Part 1: Deploying the Backend

1.  Go to your **Vercel Dashboard** and click **"Add New..."** -> **"Project"**.
2.  Import your GitHub repository `didyoudoit`.
3.  **Configure Project:**
    *   **Project Name:** `didyoudoit-backend` (suggested).
    *   **Root Directory:** Click "Edit" and select `backend`.
    *   **Environment Variables:** Add the following (copy values from your local `.env`):
        *   `DATABASE_URL`
        *   `JWT_SECRET`
4.  Click **Deploy**.
5.  Once deployed, copy the **Deployment Domain** (e.g., `https://didyoudoit-backend.vercel.app`).
    *   *Note: Your API will be accessible at `https://didyoudoit-backend.vercel.app/api`.*

---

## Part 2: Deploying the Frontend

1.  Go to your **Vercel Dashboard** and click **"Add New..."** -> **"Project"**.
2.  Import the **same** GitHub repository `didyoudoit`.
3.  **Configure Project:**
    *   **Project Name:** `didyoudoit-frontend` (suggested).
    *   **Root Directory:** Click "Edit" and select `frontend`.
    *   **Environment Variables:** Add the following:
        *   `REACT_APP_API_URL`: `https://didyoudoit-backend.vercel.app/api` (Replace with your actual backend URL from Part 1).
4.  Click **Deploy**.

---

## Part 3: Update Usage

1.  Once both are deployed, open your Frontend URL.
2.  The application should now be live and connected to your cloud database!

## Troubleshooting

*   **Database Connection:** Ensure your Supabase database allows connections from external IPs (usually enabled by default 0.0.0.0/0).
*   **CORS:** If you see CORS errors in the browser console, you may need to update the `cors` configuration in `backend/src/index.ts` to include your specific Vercel frontend domain instead of just localhost.
    *   *Current Config:* Allows `localhost` and `127.0.0.1`.
    *   *Update:* Add `'https://didyoudoit-frontend.vercel.app'` to the `origin` array.
