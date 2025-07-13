# Home Management Web App

## Overview
A web application for managing home activities, starting with a calendar app. The calendar will use FullCalendar with Vue.js on the frontend and sync with at least two Google Calendars. The app is designed to run locally on a Raspberry Pi.

## Tech Stack

### Client
- **Framework:** Vue.js
- **Calendar UI:** FullCalendar Vue component
- **Styling:** Tailwind CSS or Vuetify

### Server
- **Language:** Node.js
- **Framework:** Express.js
- **Google Calendar Sync:** googleapis npm package (OAuth2 + Google Calendar API)

### Database
- **Primary:** SQLite (lightweight, file-based, ideal for local use)
- **Alternative:** PostgreSQL (for advanced/multi-user scenarios)

### Authentication
- **Local:** JWT-based authentication
- **Google OAuth2:** For connecting and syncing Google Calendars

### Deployment
- **Target:** Local Raspberry Pi
- **Process Manager:** PM2 or systemd (to keep Node.js server running)
- **Optional:** Docker (for containerization), Nginx (as reverse proxy)

## Features
- Calendar UI with FullCalendar
- Sync with at least two Google Calendars
- User authentication (local and Google OAuth2)
- Responsive, modern UI

## Next Steps
- Scaffold client and server projects
- Implement Google Calendar sync
- Build calendar UI
- Add authentication and user management
