# Military Asset Management System - Frontend

## Tech Stack

- **React 19**: Modern UI library with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Vite**: Fast build tool and dev server

## Features

### Dashboard
- View key metrics: Opening Balance, Closing Balance, Net Movement, Assigned, Expended
- Click on Net Movement to see detailed breakdown (Purchases, Transfer In, Transfer Out)
- Filter by Date, Base, and Equipment Type
- Role-based data access

### Purchases Page
- Record new purchases
- View purchase history
- Filter by date and equipment type
- Role-based creation permissions

### Transfers Page
- Transfer assets between bases
- View transfer history with from/to base details
- Filter transfers by date and equipment
- Prevent transfers to same base

### Assignments & Expenditures Page
- Tab-based interface for assignments and expenditures
- Assign assets to personnel
- Record expended assets with reasons
- View complete history with filters

### Role-Based Access
- **Admin**: Full access to all features and all bases
- **Base Commander**: Access limited to assigned base
- **Logistics Officer**: Can manage purchases and transfers only

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Update API URL if needed:
Edit `src/utils/api.js` and change `API_URL` if backend is not on localhost:5000

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Base Commander**: username: `commander1`, password: `commander123`
- **Logistics Officer**: username: `logistics1`, password: `logistics123`

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with navigation
│   └── Layout.css
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Dashboard.jsx       # Dashboard with metrics
│   ├── Purchases.jsx       # Purchases management
│   ├── Transfers.jsx       # Transfers management
│   └── Assignments.jsx     # Assignments & Expenditures
├── utils/
│   └── api.js              # API client and endpoints
├── App.jsx                 # Main app component with routing
└── App.css                 # Global styles
```

## Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Security

- JWT token stored in localStorage
- Automatic token injection in API requests
- Protected routes require authentication
- Role-based UI rendering
