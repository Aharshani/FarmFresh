# MySQL Database Setup for FarmFresh

## Overview
The FarmFresh application now uses MySQL database for user management instead of JSON files. This provides better scalability, data integrity, and performance.

## Database Configuration

### Connection Details
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: sohan@16
- **Database**: farmfresh

### Configuration File
The database configuration is located in `src/config/database.js` and can be customized using environment variables:

```javascript
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sohan@16
DB_NAME=farmfresh
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT '',
    password VARCHAR(255) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    termsAccepted BOOLEAN DEFAULT FALSE,
    newsletter BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME NULL,
    isActive BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Installation

### 1. Install Dependencies
```bash
npm install mysql2
```

### 2. Initialize Database
Run the database initialization script to create the database and tables:

```bash
node scripts/init-database.js
```

This script will:
- Create the `farmfresh` database if it doesn't exist
- Create the `users` table with proper schema
- Test the database connection

### 3. Start the Server
```bash
node server.js
```

The server will automatically:
- Connect to MySQL database
- Initialize the database on startup
- Test the connection

## Usage

### User Model
The MySQL User model is located at `src/models/UserMySQL.js` and provides the same interface as the JSON model:

```javascript
const UserMySQL = require('./src/models/UserMySQL');
const userModel = new UserMySQL();

// Register new user
const result = await userModel.create(userData);

// Authenticate user
const loginResult = await userModel.authenticate(email, password);

// Get all users
const users = await userModel.getAll();

// Get user by ID
const user = await userModel.getById(id);
```

### API Endpoints

All user-related endpoints now use MySQL:

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

## Features

### Security
- Password hashing using SHA-256 with salt
- SQL injection prevention using parameterized queries
- Email uniqueness constraint
- Input validation

### Performance
- Connection pooling for efficient database access
- Indexed fields for fast queries (email, isActive)
- Async/await for non-blocking operations

### Data Integrity
- Foreign key constraints (if needed)
- Unique email constraint
- Default values for optional fields
- Timestamp tracking (createdAt, lastLogin)

## Migration from JSON

The application has been migrated from JSON file storage to MySQL. The old JSON model (`src/models/User.js`) is still available but not used by the server.

### Data Migration
If you need to migrate existing users from JSON to MySQL:

1. Export users from `data/users.json`
2. Use the MySQL User model to import users
3. Verify data integrity

## Troubleshooting

### Connection Issues
If you encounter connection errors:

1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```

2. Check database credentials in `src/config/database.js`

3. Ensure the database exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS farmfresh;
   ```

### Table Issues
If tables are missing:

1. Run the initialization script:
   ```bash
   node scripts/init-database.js
   ```

2. Or manually create the table using the SQL schema above

## Environment Variables

For production, use environment variables instead of hardcoded credentials:

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=sohan@16
export DB_NAME=farmfresh
```

## Testing

Test the MySQL integration:

```bash
# Test registration
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test1234",
    "confirmPassword": "Test1234",
    "postcode": "SW1A 1AA",
    "termsAccepted": true
  }'

# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234"}'
```

## Files Created

1. `src/config/database.js` - Database configuration and connection pool
2. `src/models/UserMySQL.js` - MySQL User model
3. `scripts/init-database.js` - Database initialization script

## Next Steps

- Consider adding more tables (products, orders, etc.)
- Implement database migrations
- Add database backup scripts
- Set up connection retry logic
- Add database monitoring

