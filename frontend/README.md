# TeleRehab Frontend

A React-based frontend for the TeleRehab system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Build for Production

```bash
npm run build
```

## Project Structure

- `src/` - Source code
  - `components/` - Reusable React components
  - `pages/` - Page components
  - `api.js` - API client
  - `auth.js` - Authentication utilities
  - `App.jsx` - Main application component
  - `main.jsx` - Application entry point

## Features

- User authentication (login/register)
- Role-based access (patient/clinician)
- Exercise video upload
- AI-assisted exercise analysis
- Progress tracking
- Clinician review system

## Development Notes

- Uses Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation
- Chart.js for data visualization