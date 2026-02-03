# Test My Blood - Backend API

Node.js + Express + MySQL backend for the Test My Blood blood test booking platform.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

1. Make sure MySQL server is running
2. Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=testmyblood
DB_PORT=3306
```

### 3. Initialize Database

Run the database initialization script to create tables and insert sample data:

```bash
node config/initDb.js
```

This will:
- Create the `testmyblood` database
- Create all required tables
- Insert default admin user
- Insert default collector user
- Insert sample labs, tests, and doctors

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Default Credentials

After initialization, you can login with:

**Admin:**
- Email: admin@testmyblood.com
- Password: admin123

**Collector:**
- Email: collector@testmyblood.com
- Password: collector123

## API Endpoints

Visit `http://localhost:5000/api` for complete API documentation.

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/categories` - Get categories
- `GET /api/tests/:id` - Get test by ID
- `POST /api/tests` - Create test (admin)
- `PUT /api/tests/:id` - Update test (admin)
- `DELETE /api/tests/:id` - Delete test (admin)

### Labs
- `GET /api/labs` - Get all labs
- `GET /api/labs/:id` - Get lab by ID
- `POST /api/labs` - Create lab (admin)
- `PUT /api/labs/:id` - Update lab (admin)
- `DELETE /api/labs/:id` - Delete lab (admin)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/specialties` - Get specialties
- `POST /api/doctors/appointments` - Book appointment (requires auth)
- `GET /api/doctors/appointments/my` - Get my appointments (requires auth)
- `POST /api/doctors` - Create doctor (admin)
- `PUT /api/doctors/:id` - Update doctor (admin)
- `DELETE /api/doctors/:id` - Delete doctor (admin)

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings/my` - Get my bookings (requires auth)
- `GET /api/bookings/:id` - Get booking by ID (requires auth)
- `PUT /api/bookings/:id/cancel` - Cancel booking (requires auth)
- `GET /api/bookings` - Get all bookings (admin)
- `PUT /api/bookings/:id/status` - Update status (admin/collector)
- `PUT /api/bookings/:id/assign` - Assign collector (admin)
- `PUT /api/bookings/:id/report` - Upload report (admin)
- `GET /api/bookings/collector/assigned` - Get assigned collections (collector)
- `PUT /api/bookings/:id/collect` - Mark as collected (collector)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/collectors` - Get all collectors
- `POST /api/admin/collectors` - Create collector
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/messages` - Get contact messages

### Contact
- `POST /api/contact` - Submit contact message

## Database Schema

The database includes the following tables:
- `users` - All users (patients, collectors, admins)
- `labs` - Diagnostic laboratories
- `tests` - Blood tests
- `doctors` - Doctors for consultations
- `bookings` - Test bookings
- `booking_tests` - Tests in each booking
- `doctor_appointments` - Doctor appointments
- `contact_messages` - Contact form submissions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | (empty) |
| DB_NAME | Database name | testmyblood |
| DB_PORT | MySQL port | 3306 |
| JWT_SECRET | JWT secret key | (change in production) |
| JWT_EXPIRE | Token expiry | 7d |

## Folder Structure

```
backend/
├── config/
│   ├── database.js    # Database connection
│   ├── initDb.js      # Database initialization
│   └── schema.sql     # SQL schema
├── controllers/
│   ├── authController.js
│   ├── testController.js
│   ├── labController.js
│   ├── doctorController.js
│   ├── bookingController.js
│   └── adminController.js
├── middleware/
│   └── auth.js        # JWT authentication
├── routes/
│   ├── authRoutes.js
│   ├── testRoutes.js
│   ├── labRoutes.js
│   ├── doctorRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
├── .env               # Environment variables
├── package.json
├── server.js          # Main entry point
└── README.md
```
