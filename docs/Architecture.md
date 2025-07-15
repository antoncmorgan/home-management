# Home Management Web App

## Overview
A web application for managing home activities, starting with a calendar app. The calendar uses FullCalendar with Vue.js on the frontend and syncs with Google Calendars. The app is designed to run locally on a Raspberry Pi.

## Tech Stack

### Client (✅ Implemented)
- **Framework:** Vue.js 3.5.17
- **Calendar UI:** FullCalendar Vue component (6.1.18)
- **UI Library:** Naive UI (2.42.0) - chosen over Tailwind/Vuetify for comprehensive component library
- **Styling:** Custom CSS with Naive UI theming
- **HTTP Client:** Axios (1.6.8)
- **Build Tool:** Vite 7.0.0
- **TypeScript:** 5.8.3

### Server (✅ Implemented)
- **Language:** Node.js with TypeScript
- **Framework:** Express.js 5.1.0
- **Google Calendar Sync:** googleapis npm package (152.0.0) with OAuth2 + Google Calendar API
- **Testing:** Jest 30.0.4 with Supertest 7.1.3

### Database (✅ Implemented)
- **Primary:** SQLite (5.1.1) with sqlite3 (5.1.7)
- **ORM:** Direct SQL queries using sqlite package
- **Location:** `./data/app.db` (file-based, ideal for local use)
- **Schema:** Users table, Google tokens table with foreign key relationships

### Authentication (✅ Implemented)
- **Local:** JWT-based authentication (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 3.0.2
- **Google OAuth2:** For connecting and syncing Google Calendars
- **Session Management:** Token stored in localStorage (frontend)

### Deployment (🚧 Planned)
- **Target:** Local Raspberry Pi
- **Process Manager:** PM2 or systemd (to keep Node.js server running)
- **Optional:** Docker (for containerization), Nginx (as reverse proxy)

## Current Implementation Status

### ✅ Completed Features
1. **User Authentication System**
   - User registration and login with JWT tokens
   - Password hashing with bcryptjs
   - Protected routes middleware
   - Comprehensive test suite for auth routes

2. **Google Calendar Integration**
   - OAuth2 flow for Google Calendar access
   - Token storage and management in SQLite
   - Calendar event fetching (monthly view)
   - Automatic token refresh handling

3. **Frontend Application**
   - Vue.js 3 with TypeScript
   - Naive UI component library
   - Responsive design with mobile support
   - Authentication pages (login/register)
   - Calendar view with FullCalendar integration
   - Google Calendar connection interface

4. **Calendar Features**
   - Monthly, weekly, and daily views
   - Event display from Google Calendar
   - Responsive calendar interface
   - Event interaction (click, drag, resize handlers)

5. **Development Environment**
   - TypeScript configuration for both client and server
   - Jest testing setup with comprehensive auth tests
   - Vite development server with hot reload
   - CORS configuration for local development

### 🚧 In Progress / Planned Features
1. **Enhanced Calendar Functionality**
   - Multiple Google Calendar sync (currently supports primary only)
   - Event creation and editing
   - Calendar color coding
   - Event filtering and search

2. **Additional Home Management Features**
   - Local weather integration
   - Weather forecasts
   - Home automation controls
   - Task management

3. **Production Deployment**
   - Raspberry Pi deployment scripts
   - Environment configuration
   - Process management setup
   - Backup and recovery procedures

### 📁 Project Structure
```
home-management/
├── client/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── styles/         # CSS files
│   │   └── api.ts         # API client
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── authRoutes.ts  # Authentication endpoints
│   │   ├── googleRoutes.ts # Google Calendar API
│   │   ├── db.ts          # SQLite database layer
│   │   └── index.ts       # Server entry point
│   ├── tests/             # Jest test files
│   └── package.json
└── docs/                  # Documentation
```

## Environment Configuration
- **Client:** Runs on http://localhost:5173 (Vite dev server)
- **Server:** Runs on http://localhost:3001 (Express server)
- **Database:** SQLite file at `./data/app.db`
- **Google OAuth:** Configured with client ID and secret

## Next Steps
1. Implement multiple Google Calendar support
2. Add event creation/editing functionality
3. Integrate weather API for local weather display
4. Add task management features
5. Prepare Raspberry Pi deployment configuration
6. Add comprehensive error handling and logging
7. Implement data backup and recovery procedures
