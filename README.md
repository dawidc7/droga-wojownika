# Droga Wojownika — PWA starter

This folder is the PWA version of the interactive prototype.

## Files

- `index.html` — the actual app UI and logic.
- `manifest.json` — tells the phone/browser that this is an installable web app.
- `service-worker.js` — caches the app shell so it can load offline.
- `assets/icon-192.png` and `assets/icon-512.png` — temporary app icons.

## Run it locally

A service worker does not work correctly by double-clicking `index.html`.
Serve the folder through localhost.

### Windows + Python

Open PowerShell in this folder and run:

    py -m http.server 8080

Then visit:

    http://localhost:8080

You can also use:

    python -m http.server 8080

### VS Code

The Live Server extension is also fine for testing the UI.
For PWA testing, make sure the site is served through localhost.

## Check that the PWA is working

In Chrome/Edge:

1. Open DevTools.
2. Go to Application.
3. Open Manifest — you should see "Droga Wojownika".
4. Open Service Workers — the worker should be registered.
5. Refresh the page.
6. In Chrome/Edge, use the install icon in the address bar if available.

## iPhone

Once deployed over HTTPS:

1. Open the site in Safari.
2. Tap Share.
3. Tap "Add to Home Screen".
4. Open it from the new home-screen icon.

## Important

This version still stores journal data in `localStorage` on that device/browser.
The next development stage should be authentication + a cloud database + photo storage.
