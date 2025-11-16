# Sign-In Form Database Connection

## Overview
The sign-in form (`sign-in.html`) is fully connected to the MySQL database through the authentication system.

## Connection Flow

### 1. Frontend (sign-in.html)
```html
<form id="signin-form">
    <input type="email" id="email" name="email" required>
    <input type="password" id="password" name="password" required>
    <button type="submit">Sign In</button>
</form>

<script src="/js/auth.js"></script>
```

### 2. JavaScript Handler (auth.js)
The form submission handler calls `authManager.login()`:

```javascript
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Calls API endpoint
    const result = await authManager.login(email, password);
});
```

### 3. API Call
`auth.js` makes a POST request to the login endpoint:

```javascript
async login(email, password) {
    const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    // Stores user data including role
    this.currentUser = result.user;
    this.setSession(result.user);
}
```

### 4. Backend API (server.js)
The server receives the request and uses the MySQL User model:

```javascript
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Uses MySQL User model
    const result = await userModel.authenticate(email, password);
    
    if (result.success) {
        res.json({
            success: true,
            message: result.message,
            user: result.user  // Includes role
        });
    }
});
```

### 5. MySQL Database (UserMySQL.js)
The User model authenticates against MySQL:

```javascript
async authenticate(email, password) {
    // Find user in MySQL database
    const user = await this.findByEmail(email);
    
    // Verify password
    if (!this.verifyPassword(password, user.password)) {
        return { success: false, message: 'Invalid email or password' };
    }
    
    // Update last login
    await this.pool.execute(
        'UPDATE users SET lastLogin = NOW() WHERE id = ?',
        [user.id]
    );
    
    // Return user without password (includes role)
    return {
        success: true,
        user: userWithoutPassword  // Contains role: 'user' or 'admin'
    };
}
```

## Features

### ✅ Database Connection
- Sign-in form connects to MySQL database
- User authentication against `users` table
- Password verification using SHA-256 hashing
- Last login timestamp updated in database

### ✅ Role Support
- User role is included in login response
- Role stored in session (localStorage)
- Admin badge shown in UI for admin users
- Admin panel link added for admin users

### ✅ Session Management
- User data stored in localStorage
- Session includes role information
- 24-hour session expiration
- Automatic UI updates on login

### ✅ Error Handling
- Invalid email/password errors
- Account deactivation errors
- Network error handling
- User-friendly error messages

## User Data Returned

On successful login, the API returns:

```json
{
    "success": true,
    "message": "Login successful!",
    "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+44 7123 456789",
        "postcode": "SW1A 1AA",
        "role": "user",  // or "admin"
        "termsAccepted": true,
        "newsletter": false,
        "createdAt": "2025-11-09T13:22:17.000Z",
        "lastLogin": "2025-11-09T13:22:21.000Z",
        "isActive": 1
    }
}
```

## Enhanced Features

### Admin Detection
The auth.js now includes admin detection:

```javascript
// Check if user is admin
authManager.isAdmin();  // Returns true/false

// Get user role
authManager.getUserRole();  // Returns 'user' or 'admin'
```

### UI Updates
- **Admin Badge**: Admin users see a purple "Admin" badge
- **Admin Panel Link**: Admin users see an "Admin" link in navigation
- **Admin Menu**: User menu includes admin section for admin users

### Session Storage
User session includes role:

```javascript
{
    user: {
        id: 1,
        email: "admin@example.com",
        role: "admin",  // Role stored in session
        // ... other fields
    },
    timestamp: 1699542121000
}
```

## Testing

### Test Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test1234"
  }'
```

### Expected Response
```json
{
    "success": true,
    "message": "Login successful!",
    "user": {
        "id": 2,
        "email": "testuser@example.com",
        "role": "user",
        ...
    }
}
```

## Database Schema

The `users` table in MySQL:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT '',
    password VARCHAR(255) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    termsAccepted BOOLEAN DEFAULT FALSE,
    newsletter BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME NULL,
    isActive BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

## Security

1. **Password Hashing**: SHA-256 with salt
2. **SQL Injection Prevention**: Parameterized queries
3. **Session Management**: localStorage with expiration
4. **Input Validation**: Email format, password strength
5. **Account Status**: Checks for active accounts

## Files Involved

1. **Frontend**: `public/sign-in.html` - Sign-in form
2. **JavaScript**: `public/js/auth.js` - Authentication logic
3. **Backend**: `server.js` - API endpoints
4. **Model**: `src/models/UserMySQL.js` - MySQL user model
5. **Database**: `src/config/database.js` - Database configuration

## Status

✅ **Fully Connected**: Sign-in form is connected to MySQL database
✅ **Role Support**: User roles are included and handled
✅ **Session Management**: User sessions include role information
✅ **UI Updates**: Admin features shown for admin users
✅ **Error Handling**: Comprehensive error handling in place

The sign-in form is production-ready and fully integrated with the MySQL database!

