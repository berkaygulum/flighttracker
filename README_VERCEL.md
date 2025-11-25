# Vercel Deployment Guide

Deploying to Vercel is the easiest and most reliable way to host Next.js applications.

## Prerequisites

1.  **GitHub Account**: You need a GitHub account.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.

## Step 1: Push Code to GitHub

1.  Open your terminal in the project folder (`/Users/berkaygulum/Documents/CODING/flight-tracker`).
2.  Initialize Git and push to a new repository:

```bash
git init
git add .
git commit -m "Initial commit"
# Go to GitHub.com -> New Repository -> Create "flight-tracker"
# Copy the commands to push an existing repository, usually:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flight-tracker.git
git push -u origin main
```

## Step 2: Deploy on Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Find your `flight-tracker` repository and click **"Import"**.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (Default)
    *   **Root Directory**: `./` (Default)
    *   **Environment Variables**: Expand this section and add the variables from your `.env` file:
        *   `DATABASE_URL`
        *   `AMADEUS_CLIENT_ID`
        *   `AMADEUS_CLIENT_SECRET`
        *   `EMAIL_USER`
        *   `EMAIL_PASS`
        *   `NEXTAUTH_SECRET`
        *   `NEXTAUTH_URL` (Set this to your Vercel domain, e.g., `https://flight-tracker.vercel.app`)

5.  Click **"Deploy"**.

## Step 3: Database Access

**Important:** Vercel is "Serverless", meaning it doesn't host a database.
*   If you are using **SQLite** (`dev.db`), it **WILL NOT WORK** permanently on Vercel (data will be lost on every restart).
*   **Recommendation:** Use a free PostgreSQL database from **Neon.tech** or **Supabase**.
    1.  Create a free account on [Neon.tech](https://neon.tech).
    2.  Create a project and get the `DATABASE_URL`.
    3.  Update your Vercel Environment Variable `DATABASE_URL` with this new connection string.
    4.  Go to Vercel -> Settings -> Deployments -> Redeploy.

## Step 4: Cron Jobs (Optional)

Vercel supports Cron Jobs via `vercel.json`.
Create a `vercel.json` file in your root:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 9 * * *"
    }
  ]
}
```
