# Frontend Thu Vien

Frontend React + Vite for the library management project.

## Related Backend

Use backend repo:
https://github.com/Dungnong/BE-thuvien

Frontend is configured to call API at:
http://127.0.0.1:8000

## Requirements

1. Node.js 20+
2. npm 10+

## Quick Start

1. Clone repo
	git clone https://github.com/Dungnong/frontend-thuvien.git

2. Go to project folder
	cd frontend-thuvien

3. Install dependencies
	npm install

4. Run development server
	npm run dev

5. Open browser
	http://localhost:5173

## Build And Lint

1. Run lint
	npm run lint

2. Build production bundle
	npm run build

3. Preview production build
	npm run preview

## Team Testing Flow (BE + FE)

1. Start backend first at 127.0.0.1:8000
2. Start frontend at localhost:5173
3. Test login, borrow book, seat booking, profile update

## Common Issues

1. API request failed
	Backend is not running or not on port 8000.

2. CORS error
	Check backend CORS in LMM settings.

3. npm command blocked in PowerShell
	Use npm.cmd instead of npm.

## Notes

1. This repo contains frontend source only.
2. Keep backend and frontend running in separate terminals.
