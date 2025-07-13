# home-management
A web app for managing the home including a Google-synced calendar, local weather, and forecast.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node.js)

### Project Structure
- `client/` — Vue.js frontend
- `server/` — Node.js/Express/TypeScript backend

### Setup Instructions

#### 1. Clone the repository
```bash
git clone <repo-url>
cd home-management
```

#### 2. Install dependencies

##### Client
```bash
cd client
npm install
```

##### Server
```bash
cd ../server
npm install
```

#### 3. Environment Variables
Create a `.env` file in the `server/` directory for backend secrets (e.g., Google API credentials, JWT secret, etc.). Example:
```env
PORT=3001
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
```

#### 4. Running the Project

##### Start the server (TypeScript, development mode)
```bash
cd server
npm run dev
```

##### Start the client (Vue.js)
```bash
cd client
npm run dev
```

The client will typically run on http://localhost:5173 and the server on http://localhost:3001.

## Features
- Google Calendar sync
- Local weather and forecast (planned)
- User authentication
- Responsive UI

## License
Apache
