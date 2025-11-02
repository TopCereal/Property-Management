<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1DhnJSYkC1VI8J5EkMR7hcH5Q-vyvniaz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Backend + TypeScript types

The backend API lives in `Backend/` and exposes an OpenAPI schema at `/openapi.json`.

To generate TypeScript types for the frontend from the running backend:

1. Start the backend (from `Backend/`):

```powershell
Set-Location -LiteralPath 'C:\Users\Taylor\Property-Management\Backend'
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --port 8000
```

2. From the project root, install npm deps and run the generator:

```powershell
npm install
npm run generate:types
```

This writes `src/types/api.d.ts`. The generator command is defined in `package.json` as `generate:types` and uses `openapi-typescript`.
