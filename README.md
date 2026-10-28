# Quick.ai — AI Content Creation Platform

Quick.ai (also referred to as **CreateAIO** in the repository) is a web-based AI content creation platform that brings writing, blog-title ideation, image generation, image editing, resume feedback, and a community gallery into one application.

**Live demo:** https://create-aio-psgu.vercel.app/  
**Repository:** https://github.com/Rameshwar1302/CreateAIO

> **Deployment note:** The frontend is deployed on Vercel. Before presenting the live demo, verify that the deployed backend API is healthy and that all required environment variables are configured in Vercel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Routes](#api-routes)
- [Authentication and Access Control](#authentication-and-access-control)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

---

## Features

### AI writing tools
- **Article generator:** Generate structured articles from a user-provided topic and selected length.
- **Blog-title generator:** Generate blog title ideas from a keyword or prompt. The UI provides category choices such as Technology, Health, Finance, Travel, Food, Education, Science, and Entertainment.
- **Markdown rendering:** Display generated text with formatted headings, lists, emphasis, and other Markdown elements.
- **Copy to clipboard:** Copy generated content from the result panel.

### AI image tools
- **Text-to-image generation:** Send a text prompt and selected visual style to the Clipdrop API.
- **Cloud storage:** Upload generated images to Cloudinary and store their URLs in PostgreSQL.
- **Background removal:** Use Cloudinary's background-removal transformation for uploaded images.
- **Object removal:** Request Cloudinary's generative object-removal transformation using a user-provided object description. Availability depends on the Cloudinary account, region, and feature access.
- **Public image sharing:** Mark generated images as public so they can appear in the Community gallery.

### Resume review
- Upload a PDF resume for text extraction and AI-generated feedback.
- Receive feedback on strengths, weaknesses, wording, projects, and actionable improvements.
- Restrict resume review to users with the required premium access.

### Dashboard and community
- **Personal dashboard:** Retrieve the signed-in user's saved creations from PostgreSQL.
- **Creation history:** Group and filter articles, blog titles, images, and resume reviews.
- **Community gallery:** Display public images shared by users.
- **Likes:** Like or unlike community images and persist likes in PostgreSQL.

### Authentication and usage limits
- Clerk-based authentication for the frontend and Express backend.
- Premium-plan checks for selected tools.
- Free usage tracking for supported text-generation features.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Lucide React |
| Authentication | Clerk (`@clerk/react`, `@clerk/express`) |
| Backend | Node.js, Express.js, REST API |
| Database | PostgreSQL hosted by Neon; `@neondatabase/serverless` is used for tagged SQL queries |
| Text generation and resume feedback | Google Gemini API, accessed through the OpenAI-compatible SDK in the current implementation |
| Image generation | Clipdrop Text-to-Image API |
| Image storage and transformations | Cloudinary |
| PDF text extraction | `pdf-parse` |
| HTTP requests and UI feedback | Axios, `react-hot-toast` |
| Deployment | Vercel |

---

## Architecture

```text
Browser (React + Vite)
        |
        | HTTPS requests with Clerk session token
        v
Express API (Vercel)
        |
        +--> Clerk authentication and plan checks
        |
        +--> Gemini API ---------> Article / title generation
        |                         Resume feedback
        |
        +--> Clipdrop API -------> Image generation
        |                  |
        |                  v
        |              Cloudinary
        |
        +--> Cloudinary ---------> Background / object transformations
        |
        +--> Neon PostgreSQL ----> Creations, history, publication and likes
```

The frontend calls the backend through `VITE_BASE_URL`. The backend verifies requests using Clerk middleware, invokes the required external service, stores creation records where applicable, and returns JSON responses to the frontend.

---

## Project Structure

The repository contains separate frontend and backend applications:

```text
CreateAIO/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WriteArticle.jsx
│   │   │   ├── BlogTitle.jsx
│   │   │   ├── GenerateImages.jsx
│   │   │   ├── RemoveBackground.jsx
│   │   │   ├── RemoveObject.jsx
│   │   │   ├── ReviewResume.jsx
│   │   │   └── Community.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                 # Local only; do not commit
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── multer.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   ├── .env                 # Local only; do not commit
│   └── package.json
│
└── README.md
```

File names can vary slightly as the project evolves; use the actual names in your checkout if they differ.

---

## Getting Started

### Prerequisites

Install or create accounts for the following:

- Node.js (use a current LTS release compatible with your installed dependencies)
- npm
- A Clerk application
- A Neon PostgreSQL database
- A Google Gemini API key
- A Cloudinary account
- A Clipdrop API key with access to the text-to-image endpoint

Some transformations and API features require account access, credits, or a supported region. Check the provider's current terms and capabilities before relying on them in production.

### 1. Clone the repository

```bash
git clone https://github.com/Rameshwar1302/CreateAIO.git
cd CreateAIO
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

Create `client/.env` using the [frontend environment variables](#frontend-environment-variables) section below.

Start the Vite development server:

```bash
npm run dev
```

Vite usually serves the application at `http://localhost:5173`.

### 3. Install backend dependencies

Open a second terminal:

```bash
cd CreateAIO/server
npm install
```

Create `server/.env` using the [backend environment variables](#backend-environment-variables) section below.

Start the backend using the script defined in `server/package.json`. For example, if a `dev` script exists:

```bash
npm run dev
```

Or, for a simple local start from the `server` directory:

```bash
node server.js
```

The backend's local address depends on `PORT`; the examples in this README use `http://localhost:3000`.

### 4. Verify the services

- Open the frontend URL shown by Vite.
- Confirm the Express root endpoint responds at `http://localhost:3000/` (or your configured port).
- Sign in through Clerk.
- Test a text-generation endpoint before testing external image APIs.
- Verify that records are saved to PostgreSQL and that Cloudinary returns accessible image URLs.

---

## Environment Variables

Create local `.env` files in `client/` and `server/`. **Never commit real API keys, secrets, database URLs, or tokens.** The names below reflect the current application configuration; remove variables that are not used by your actual code.

### Frontend environment variables

`client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

For the deployed frontend, set `VITE_BASE_URL` to the deployed backend origin, for example:

```env
VITE_BASE_URL=https://create-aio.vercel.app
```

Variables prefixed with `VITE_` are bundled into browser-accessible frontend code. Only put public configuration values there; never put secret API keys in the client environment.

### Backend environment variables

`server/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your_neon_postgresql_connection_string

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

GEMINI_API_KEY=your_gemini_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For production, set `FRONTEND_URL` to the deployed frontend origin, such as `https://create-aio-psgu.vercel.app`. If you allow both production and local development, configure the backend CORS allowlist to include both exact origins.

Configure these values separately in the appropriate Vercel project's **Settings → Environment Variables**. The frontend project's `VITE_BASE_URL` should point to the backend; the backend's `FRONTEND_URL` should point to the frontend.

---

## Database

The application stores user creations in a PostgreSQL table called `creations`. The backend uses records for generated articles, blog titles, images, and resume reviews. Public image records use `publish`, and community likes are stored in `likes`.

The following is a **reference schema** based on the fields used in the current controllers. If your Neon table already exists, compare its columns and types before running this SQL; do not recreate or overwrite a production table blindly.

```sql
CREATE TABLE IF NOT EXISTS creations (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    publish BOOLEAN NOT NULL DEFAULT FALSE,
    likes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creations_user_created
    ON creations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_creations_published_created
    ON creations (created_at DESC)
    WHERE publish = TRUE;
```

The `type` values used by the application include:

- `article`
- `blog-title`
- `image`
- `file` (used for resume reviews)

---

## API Routes

All routes are mounted under the corresponding prefix in the Express application. Protected endpoints expect a Clerk session token in the `Authorization` header:

```http
Authorization: Bearer <clerk-session-token>
```

### AI routes — `/api/ai`

| Method | Endpoint | Purpose | Request data |
|---|---|---|---|
| `POST` | `/write-article` | Generate an article | JSON: `prompt`, `length` |
| `POST` | `/blog-title` | Generate blog-title ideas | JSON: `prompt` |
| `POST` | `/generate-images` | Generate an image and save its URL | JSON: `prompt`, `publish` |
| `POST` | `/remove-background` | Remove an uploaded image's background | Multipart form: `image` |
| `POST` | `/remove-object` | Remove a described object from an image | Multipart form: `image`, `object` |
| `POST` | `/review-resume` | Extract and review a PDF resume | Multipart form: `resume` |

### User and community routes — `/api/user`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/get-user-creations` | Retrieve the authenticated user's creations |
| `GET` | `/get-published-creations` | Retrieve published community images |
| `POST` | `/toggle-liked-creations` | Toggle the authenticated user's like on a public image; JSON: `id` |

The exact response payload and access requirements are defined in the route/controller implementations. Check the current backend code if these contracts change.

---

## Authentication and Access Control

- Clerk provides sign-in/session functionality in the React frontend.
- The Express `auth` middleware obtains the authenticated Clerk user ID and checks the user's plan.
- Selected features, including image generation, image editing, and resume review, are restricted to premium users in the current implementation.
- Text-generation endpoints enforce the configured free-use limit for non-premium users.
- User creation queries filter records by the authenticated user ID. Community queries expose only records marked as published.

For production, use Clerk production keys and verify plan entitlements on the server. Frontend visibility alone is not an access-control mechanism.

---

## Deployment

The project uses separate Vercel projects for the frontend and backend.

### Frontend

- Set the Vercel Root Directory to `client`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Configure `VITE_BASE_URL` to the backend's public HTTPS URL.
- Configure `VITE_CLERK_PUBLISHABLE_KEY` with the appropriate Clerk publishable key.

### Backend

- Set the Vercel Root Directory to `server` if deploying the backend from this repository's `server` directory.
- Configure all required server-side environment variables in Vercel.
- Set `FRONTEND_URL` to the exact frontend origin, without a trailing slash.
- Ensure CORS middleware runs before Clerk middleware and API routes.
- Confirm all runtime dependencies are included in `server/package.json` and `server/package-lock.json`.
- Inspect Runtime Logs if a function invocation fails. A deployment marked **Ready** does not guarantee that every runtime endpoint works.

### CORS example

```javascript
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:5173'
    ].filter(Boolean),
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
```

Place this before `app.use(clerkMiddleware())` and before route registration. Update the allowlist if your frontend domain changes.

---

## Troubleshooting

### CORS error in the browser

1. Confirm `VITE_BASE_URL` points to the backend URL.
2. Confirm the backend's `FRONTEND_URL` exactly matches the browser's frontend origin.
3. Ensure CORS middleware executes before authentication middleware and routes.
4. Test the preflight request from PowerShell:

   ```powershell
   curl.exe -i -X OPTIONS "https://YOUR-BACKEND-DOMAIN/api/user/get-user-creations" `
     -H "Origin: https://YOUR-FRONTEND-DOMAIN" `
     -H "Access-Control-Request-Method: GET" `
     -H "Access-Control-Request-Headers: authorization"
   ```

5. If Vercel returns `FUNCTION_INVOCATION_FAILED`, inspect the backend's Runtime Logs. A runtime crash can prevent CORS headers from being returned.

### `FUNCTION_INVOCATION_FAILED` on Vercel

- Check the complete runtime stack trace, not only the browser's CORS message.
- Verify required environment variables are present in the correct Vercel project and environment.
- Ensure the deployed backend's Root Directory and entry point are correct.
- Verify native and optional dependencies are installed in the backend project. The PDF parsing dependency may require its worker/runtime dependencies, including `@napi-rs/canvas` for the current setup.
- Test the backend root endpoint before debugging an individual API route.

### Gemini returns `429`, `503`, or a timeout

These responses may indicate rate limits, temporary service load, unavailable models, or a slow request. Check the current model identifier, quota, and API status. Use bounded request timeouts and avoid unbounded retries. An application-level timeout does not guarantee the provider will always respond quickly.

### Clipdrop returns a network or DNS error

An `ECONNRESET` or `EAI_AGAIN` error indicates a connection or DNS problem rather than a normal HTTP response. Test connectivity from the same network or hosting environment where the backend runs. A local VPN does not affect the network path of a deployed server.

### Cloudinary transformation does not work

Background removal and generative object removal have separate feature requirements. Verify account access, transformation syntax, and region availability. A returned Cloudinary URL alone does not prove that a generative transformation completed successfully.

### Resume PDF returns no text

The current PDF workflow extracts text from PDFs. Image-only scanned PDFs may require OCR and therefore may not produce readable text with text extraction alone.

---

## Security Notes

- Never commit `.env` files or expose server-side secrets in the frontend.
- Keep `CLERK_SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`, `CLIPDROP_API_KEY`, and Cloudinary API secrets on the backend only.
- Treat `VITE_*` values as public because Vite embeds them into client-side assets.
- Validate uploaded file size, MIME type, and content on the server; frontend checks alone are insufficient.
- Ensure API routes enforce authentication, premium access, and ownership checks on the server.
- Keep CORS allowlists limited to trusted origins instead of allowing arbitrary origins with credentials.
- Avoid logging session tokens, API keys, resume contents, or other personal information.

---

## Future Improvements

Potential next steps for the project include:

- Stream long AI responses to improve perceived latency.
- Add pagination and search to creation history and the Community gallery.
- Add integration tests for authentication, usage limits, image uploads, and likes.
- Improve upload validation and add explicit error states for provider/network failures.
- Add rate limiting, structured request logging, and monitoring for production APIs.
- Evaluate image-processing provider support and costs before expanding public availability.

---

## Author

**Rameshwar Dudhate**  
IIT Patna — Computer Science and Engineering

- GitHub: https://github.com/Rameshwar1302
- Live demo: https://create-aio-psgu.vercel.app/
