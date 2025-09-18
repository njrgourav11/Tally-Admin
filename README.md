# Tally B2B Admin Platform

A complete admin-facing web application for B2B e-commerce with Tally Prime integration.

## Features

- **Dashboard**: Real-time stats, Tally connection status, manual sync
- **Product Management**: View synced items, add descriptions/images
- **Order Management**: View orders, update status, customer details
- **Tally Integration**: XML API communication, automatic sync every 30 minutes

## Tech Stack

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Integration**: Tally Prime XML API

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure environment variables in `.env`:
```
PORT=5000
TALLY_HOST=localhost
TALLY_PORT=9000
FIREBASE_PROJECT_ID=your-project-id
```

Add Firebase service account key to `config/serviceAccountKey.json`

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update Firebase config in `src/config/firebase.ts`

Start frontend:
```bash
npm start
```

### 3. Tally Prime Setup

1. Enable Tally Prime API (default port 9000)
2. Ensure Tally is running and accessible
3. Test connection via Dashboard

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `PUT /api/products/:id` - Update product
- `POST /api/products` - Create product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status

### Sync
- `POST /api/sync/manual` - Manual sync trigger
- `GET /api/sync/test` - Test Tally connection

## Deployment

### Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy
```

### Backend (Render/Railway)
Deploy backend to cloud service with environment variables configured.

## Usage

1. **Dashboard**: Monitor system status and trigger manual sync
2. **Products**: View Tally-synced items, add descriptions and images
3. **Orders**: Manage customer orders and update status

Auto-sync runs every 30 minutes to keep data current with Tally Prime.