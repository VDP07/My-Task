# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (HMR)
npm run build     # Production build to dist/
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint
```

No test suite is configured.

## Architecture

This is a React 19 + Vite single-page app with a single component (`src/App.jsx`). It renders a personal event-logging form for an endurance coach to log athlete and personal events directly to Google Calendar.

### Backend integration

The form submits via `fetch` with `mode: 'no-cors'` to a Google Apps Script web app. The deployed script URL is hardcoded in `App.jsx` as `SCRIPT_URL`. The Apps Script source lives in `google-scripts/app-script.js` in this repo — it must be manually copied/synced to Google Drive to deploy.

**Configuration (top of `app-script.js`):**
- `SPREADSHEET_ID` — Google Sheet where every submission is logged
- `CALENDAR_ID` — target Google Calendar (currently `vrattno@gmail.com`)

**Payload shape sent to the script:**
- `taskName`, `taskDateTime` (ISO string), `isAllDay`, `description`
- `isARace` (boolean, only included when `taskName === 'Athlete Race'`)
- `createTask`, `daysOut`, `taskTiming` (sent by the frontend when the task reminder checkbox is checked, but **not yet consumed** by the current Apps Script)

Because `mode: 'no-cors'` is used, the response is always opaque — success/error UI state is optimistic (error state only fires if `fetch` itself throws).

**What the script does on each POST:**

1. **Google Sheets logging** — appends a row using sheet column headers as keys. Expected headers (case-insensitive): `Task Name`, `Date`, `Time`, `All-Day Event`, `Is a Race?`, `Description`, `Submission Timestamp`.

2. **Google Calendar event** — always creates a main event. Timed events default to 1-hour duration.

3. **Conditional logic for `Athlete Race`:**
   - Google Task "Generate Race Plan" due 7 days before the event
   - All-day Calendar event "Schedule Facebook Post" 5 days before
   - If `isARace` is `true`: all-day Calendar event "Race Reflection" 7 days after

4. **Conditional logic for `Car`:**
   - Google Task "Make Appointment for Car Task" due 7 days before the event

### Styling

All CSS lives in an inline `<style>` block inside the JSX render — there is no external CSS framework. `src/index.css` contains only a body margin reset. `src/App.css` is unused in the current build.

### Form

Managed with `react-hook-form`. Two fields are conditionally rendered:
- `isARace` checkbox — shown only when `taskName === 'Athlete Race'`
- `daysOut` + `taskTiming` — shown only when the `createTask` checkbox is checked
