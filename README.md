# FarmFresh - Local Farmer's Market Platform

A modern web application that connects local farmers with customers, featuring user authentication, product browsing, and order management.

## Features

- **User Authentication**: Register and login system with secure password hashing
- **User Database**: JSON-based user storage with session management
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Product Management**: Browse and search local produce
- **Shopping Cart**: Add products and manage orders
- **Quality Assessment**: AI-powered quality detection for produce

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or download the project**
   ```bash
   cd "FarmFresh 2"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
FarmFresh 2/
├── data/
│   └── users.json          # User database
├── public/
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   │   ├── auth.js        # Authentication module
│   │   ├── cart.js        # Shopping cart functionality
│   │   └── main.js        # Main application logic
│   ├── images/            # Product and UI images
│   ├── index.html         # Home page
│   ├── register.html      # User registration page
│   ├── sign-in.html       # User login page
│   └── ...                # Other HTML pages
├── server.js              # Express server
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## User Authentication

### Registration
- Visit `/register.html` to create a new account
- Required fields: First name, Last name, Email, Password, Postcode
- Password must be at least 8 characters with uppercase, lowercase, and numbers
- Terms and conditions must be accepted

### Login
- Visit `/sign-in.html` to access your account
- Use your email and password to sign in
- Sessions are maintained for 24 hours

### User Database
- User data is stored in `data/users.json`
- Passwords are hashed using SHA-256
- User sessions are managed via localStorage

## API Endpoints

The server provides the following REST API endpoints:

- `GET /api/users` - Get all users (for testing)
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/users/:id` - Get user by ID

## Sample Users

The database comes with two sample users for testing:

1. **John Doe**
   - Email: `john.doe@example.com`
   - Password: `Password123`

2. **Jane Smith**
   - Email: `jane.smith@example.com`
   - Password: `Password123`

## Development

### Running in Development Mode
```bash
npm run dev
```

### Adding New Features
1. Frontend changes go in the `public/` directory
2. Backend API changes go in `server.js`
3. User data is stored in `data/users.json`

## Security Notes

- Passwords are hashed using SHA-256 with salt
- User sessions expire after 24 hours
- Input validation is performed on both client and server
- CORS is enabled for development

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: JSON file storage
- **Authentication**: Custom JWT-like session management
- **Icons**: Font Awesome

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the FarmFresh development team.