# Swiftrafik (scaffold)

This is a lightweight Vite + React + TypeScript + Tailwind scaffold for the Swiftrafik UI.

Quick start:

1. Install dependencies:

```bash
cd swiftrafik
npm install
```

2. Start the broadcaster (in another terminal):

```bash
# from workspace root
node simple-app/broadcaster.js
# or run the script from the scaffold
cd swiftrafik
npm run start-broadcaster
```

3. Start the dev server:

```bash
npm run dev
```

4. Open http://localhost:5173 (or the port shown by Vite).

Notes:
- The scaffold reads `public/airports.json` for the airport list and connects by default to `ws://localhost:8080` for the simple broadcaster.
- I kept the UI intentionally simple and accessible: sidebar airport list, filters for Commercial/Private, and a clear flight table. The WS client is in `src/App.tsx` and uses the same 5s throttling behaviour.

If you want, I can:
- Run Playwright tests to validate layout at mobile/tablet/desktop sizes.
- Add richer components (detail panel, sorting, search) and unit tests.
