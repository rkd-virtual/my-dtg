# DTG Portal — React + Vite + Tailwind v3

Stable Vite setup with Login/Signup and protected Dashboard.

## Quick start
```bash
npm install   # or pnpm install
npm run dev
```

Frontend env:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Expected API:
- POST /api/auth/signup -> { token }
- POST /api/auth/login  -> { token }
