# AI Image Analyzer

A full-stack AI-powered website that analyzes images, generates titles and keywords using DeepAI API, and provides results as a downloadable CSV.

## Features

- Upload image.
- AI analysis for title and keywords.
- Download results as CSV.

## Prerequisites

- Node.js (v18+ recommended)
- DeepAI API key (get one at https://deepai.org/)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # Or manually create .env
# Add your DEEP_AI_API_KEY in .env
npm install
npm start
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # Or manually create .env
# Ensure REACT_APP_API_URL matches backend address (default: http://localhost:5000)
npm install
npm start
```

### 3. Usage

- Go to `http://localhost:3000`
- Upload an image, analyze, and download CSV.

## Deployment

- For production, build the frontend:
    ```bash
    npm run build
    ```
- Serve the build output with a static server (e.g., serve, nginx) or host it with your backend.
- Make sure your backend is deployed and accessible to the frontend (adjust `REACT_APP_API_URL` accordingly).

## Notes

- This demo uses DeepAI's free tier. For high traffic, consider rate limits and paid options.
