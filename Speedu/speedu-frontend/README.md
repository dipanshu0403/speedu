# Speedu Frontend

Vite React frontend for the Speedu customer and agent service booking app.

## Setup

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Backend URL

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

For deploy:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Deploy

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```
