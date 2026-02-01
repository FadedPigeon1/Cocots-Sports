# Deployment Guide

## 1. Backend Deployment (Render)

We will deploy the Python FastAPI backend to Render first, as we need its URL for the frontend configuration.

1.  Push this repository to GitHub/GitLab.
2.  Log in to [Render.com](https://render.com).
3.  Click "New +" -> "Blueprint".
4.  Connect your repository.
5.  Render will automatically detect the `render.yaml` file in the root.
6.  Click "Apply".
7.  **Environment Variables**:
    - Once the service is created, go to the "Environment" tab.
    - `PYTHON_VERSION`: `3.11.4` (Already set by blueprint)
    - `ALLOWED_ORIGINS`: Add your local URL for now (e.g., `http://localhost:3000`). **You will update this later with your Vercel URL.**
    - `NBA_API_KEY`: (Optional) If you have a specific key, though `nba_api` usually works without one.

**Note the URL** provided by Render (e.g., `https://cocots-sports-api.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Now we deploy the Next.js frontend.

1.  Log in to [Vercel.com](https://vercel.com).
2.  Click "Add New..." -> "Project".
3.  Import your repository.
4.  **Project Settings**:
    - **Framework Preset**: Next.js
    - **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    - Key: `NEXT_PUBLIC_ML_API_URL`
    - Value: The Render URL you got in Step 1, with `/api/v1` appended.
      - Example: `https://cocots-sports-api.onrender.com/api/v1`
6.  Click "Deploy".

---

## 3. Final Connection

1.  Once Vercel finishes deploying, copy your new frontend URL (e.g., `https://cocots-sports.vercel.app`).
2.  Go back to **Render Dashboard** -> Your Service -> Environment.
3.  Update `ALLOWED_ORIGINS` to include your Vercel URL.
    - Example: `http://localhost:3000,https://cocots-sports.vercel.app` (comma separated, no spaces).
4.  Render will redeploy/restart automatically.

## Troubleshooting

- **CORS Error**: If you see "Network Error" or CORS issues in the console, double-check that the `ALLOWED_ORIGINS` in Render matches your Vercel domain exactly (https vs http, trailing slashes).
- **Model Error**: The backend uses a lightweight model. If you need the full trained model, you must run the training script or ensure the `.json` model files are committed to the repo.
