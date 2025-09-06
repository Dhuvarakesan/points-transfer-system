# ASCENSION: Points Transfer System

ASCENSION is a full-stack points transfer system for organizations, built with React, Redux Toolkit, TypeScript, Express, and MongoDB. It enables secure point transfers, user management, transaction history, and admin controls, all with a modern, responsive UI.

## Features
- User registration, login, and authentication (with encrypted passwords)
- Secure point transfers between users
- Transaction history with filtering (by type, user, and amount)
- Admin dashboard for user and transaction management
- Responsive, mobile-friendly UI
- SEO-friendly frontend
- Audit logging and error handling

## Tech Stack
- **Frontend:** React, Redux Toolkit, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Other:** CryptoJS (encryption), Lucide React (icons)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Setup
1. **Clone the repository:**
	 ```bash
	 git clone <YOUR_GIT_URL>
	 cd points-transfer-system
	 ```

2. **Install dependencies:**
	 - For the frontend:
		 ```bash
		 cd client
		 npm install
		 ```
	 - For the backend:
		 ```bash
		 cd ../server
		 npm install
		 ```

3. **Configure environment variables:**
	 - In `server/.env`, set `MONGO_URI`, `PORT`, and any other required variables.

4. **Run the development servers:**
	 - Start the backend:
		 ```bash
		 cd server
		 npm run dev
		 ```
	 - Start the frontend:
		 ```bash
		 cd ../client
		 npm run dev
		 ```

5. **Access the app:**
	 - Frontend: [http://localhost:5173](http://localhost:5173) (default Vite port)
	 - Backend API: [http://localhost:5000](http://localhost:5000) (or your chosen port)

## Folder Structure

```
points-transfer-system/
	client/    # React frontend
	server/    # Express backend
```

## Usage
- Register as a user or login as admin
- Send points to other users
- View and filter your transaction history
- Admins can manage users and view all transactions

## License
MIT
