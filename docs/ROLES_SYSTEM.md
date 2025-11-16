# Roles System for FarmFresh

## Overview
The FarmFresh application now includes a role-based access control system with two roles: **user** and **admin**. By default, all new registrations are assigned the **user** role.

## Roles

### User Role (Default)
- Default role for all new registrations
- Standard user privileges
- Can access all public features

### Admin Role
- Administrative privileges
- Can manage users and system settings
- Can update user roles

## Database Schema

### Users Table
The `users` table now includes a `role` column:

```sql
role ENUM('user', 'admin') DEFAULT 'user'
```

- **Type**: ENUM with values 'user' or 'admin'
- **Default**: 'user'
- **Indexed**: Yes (for fast queries)

## Registration

### Default Role Assignment
When a user registers through the registration form, they are automatically assigned the **user** role:

```javascript
// Registration automatically sets role to 'user'
const result = await userModel.create({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Password123",
    // ... other fields
    // role is automatically set to 'user'
});
```

### Manual Role Assignment
During registration, if a role is provided, it will be validated and used (though typically only admins should set roles):

```javascript
const result = await userModel.create({
    // ... user data
    role: 'admin' // Only if explicitly provided and valid
});
```

## User Model Methods

### Check if User is Admin
```javascript
// By user ID
const isAdmin = await userModel.isAdmin(userId);

// By email
const isAdmin = await userModel.isAdminByEmail(email);
```

### Update User Role
```javascript
const result = await userModel.updateRole(userId, 'admin');
// Returns: { success: true, message: "User role updated to admin", user: {...} }
```

### Get Users by Role
```javascript
// Get all admin users
const admins = await userModel.getByRole('admin');

// Get all regular users
const users = await userModel.getByRole('user');
```

### Update User (includes role)
```javascript
const result = await userModel.update(userId, {
    role: 'admin',
    // ... other fields
});
```

## API Endpoints

### User Registration
```http
POST /api/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "postcode": "SW1A 1AA",
    "termsAccepted": true
}
```

**Response:**
```json
{
    "success": true,
    "message": "Registration successful! Welcome to FarmFresh!",
    "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "user",
        // ... other fields
    }
}
```

### Update User Role
```http
PUT /api/users/:id/role
Content-Type: application/json

{
    "role": "admin"
}
```

**Response:**
```json
{
    "success": true,
    "message": "User role updated to admin",
    "user": {
        "id": 1,
        "role": "admin",
        // ... other fields
    }
}
```

### Get Users by Role
```http
GET /api/users/role/:role
```

**Example:**
```bash
# Get all admin users
curl http://localhost:3000/api/users/role/admin

# Get all regular users
curl http://localhost:3000/api/users/role/user
```

### Check if User is Admin
```http
GET /api/users/:id/is-admin
```

**Response:**
```json
{
    "isAdmin": true
}
```

## Usage Examples

### Registration with Default Role
```bash
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
```

### Update User to Admin
```bash
curl -X PUT http://localhost:3000/api/users/1/role \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Check Admin Status
```bash
curl http://localhost:3000/api/users/1/is-admin
```

### Get All Admins
```bash
curl http://localhost:3000/api/users/role/admin
```

## Statistics

The `getStatistics()` method now includes role counts:

```javascript
const stats = await userModel.getStatistics();
// Returns:
// {
//     total: 10,
//     active: 9,
//     inactive: 1,
//     newsletter: 5,
//     recent: 3,
//     admins: 2,
//     users: 8
// }
```

## Security Considerations

1. **Role Validation**: Only 'user' and 'admin' roles are accepted
2. **Default Role**: All new registrations default to 'user'
3. **Role Updates**: Should be restricted to admin users only (implement authorization middleware)
4. **Password Security**: Passwords are hashed using SHA-256 with salt

## Future Enhancements

1. **Authorization Middleware**: Add middleware to protect admin-only endpoints
2. **Role Permissions**: Add granular permissions system
3. **Role History**: Track role changes with audit log
4. **Multiple Roles**: Support for users with multiple roles
5. **Role-based UI**: Show/hide features based on user role

## Migration

If you have existing users without roles, the database initialization script will:
1. Add the `role` column to the `users` table
2. Set default role to 'user' for all existing users
3. Create an index on the `role` column

Run the initialization script:
```bash
node scripts/init-database.js
```

## Testing

All role functionality has been tested:
- ✅ Default role assignment on registration
- ✅ Role update functionality
- ✅ Admin status checking
- ✅ Get users by role
- ✅ Statistics include role counts

