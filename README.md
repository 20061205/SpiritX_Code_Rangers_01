# Code Rangers - Authentication System

A modern, secure authentication system built with Next.js, featuring a beautiful UI and comprehensive user management.

## Features

### User Authentication
- 🔐 Secure login with username/password
- 📧 Google sign-in integration
- ✨ Modern and responsive UI with dark mode support
- 🛡️ Protected routes and session management

### Password Management
- 🔑 Secure password reset flow
- 📱 OTP verification via email
- 📊 Password strength monitoring
- 🔄 Real-time password validation

### Security Features
- 🔒 Password hashing and encryption
- ⏱️ OTP expiration (10 minutes)
- 🚫 Rate limiting for security
- 🔍 Unique email and username validation

### UI/UX Features
- 🌓 Dark/Light mode toggle
- 🎨 Beautiful gradient backgrounds
- 📱 Fully responsive design
- 🚀 Smooth transitions and animations

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Email Service**: Nodemailer
- **State Management**: React Hooks
- **Form Handling**: React Forms

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- MongoDB database
- Gmail account (for email services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/code-rangers.git
cd code-rangers
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Your application URL
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASSWORD`: Gmail app-specific password

## Features in Detail

### Authentication Flow
1. User signs up with email/username or Google
2. Email verification process
3. Secure login with session management
4. Protected route access

### Password Reset Flow
1. User requests password reset
2. OTP sent to registered email
3. OTP verification
4. New password setup with strength validation
5. Redirect to login

### Security Measures
- Passwords are hashed before storage
- OTP expires after 10 minutes
- Rate limiting on authentication endpoints
- Session management and secure cookies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the reliable database
- NextAuth.js for the authentication solution