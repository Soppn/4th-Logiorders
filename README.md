# Logistics Order System (GitHub Pages + Google Sheets)

Front-end hosted on GitHub Pages. Backend is a Google Apps Script that writes and reads a Google Sheet.

## Files
- `index.html` — order submission form
- `form.js` — form logic (POST → Apps Script)
- `fac.html` — FAC dashboard (live polling + alerts)
- `fac.js` — dashboard logic (GET from Apps Script)
- `style.css` — shared styles
- `apps-script/Code.gs` — Google Apps Script backend

## Setup

1. **Create the Google Sheet**
   - Tab: `orders`
   - Headers (row 1):  
     `timestamp | unit | requester | priority | grid | items_json | notes | status | id`

2. **Apps Script backend**
   - From the sheet: Extensions → Apps Script.
   - Paste `apps-script/Code.gs`.
   - Set `ALLOWED_ORIGIN` to your Pages origin, and `SHARED_TOKEN` to a long random string.
   - Deploy → **New deployment** → **Web app**  
     - Execute as: *Me*  
     - Who has access: *Anyone* (or with Google account)
   - Copy the **web app URL**.

3. **Frontend config**
   - In `form.js` and `fac.js`, set:
     - `SCRIPT_URL` to your web app URL.
     - `SHARED_TOKEN` to the exact same value as in Apps Script.

4. **GitHub Pages**
   - Push these files to a public repo.
   - Settings → **Pages** → Source: *Deploy from a branch* → Branch: `main` → Folder: `/ (root)`.
   - Visit:  
     - Form: `https://<user>.github.io/<repo>/`  
     - FAC:  `https://<user>.github.io/<repo>/fac.html`

## Notes
- This is a lightweight system; token is client-visible (soft gate). For stronger security, move the endpoint to a serverless backend using a real secret or Google service account.
- The FAC page polls every 8s and shows a toast + optional beep when new orders appear.
- To filter on the FAC page, use the status dropdown.
