# Learnify Backend API

A robust Node.js backend for the Learnify educational platform with comprehensive testing, security, and performance optimizations.

## 🚀 Features

- **Secure Authentication**: JWT-based auth with password hashing and rate limiting
- **Comprehensive Testing**: Unit and integration tests with 90%+ coverage
- **Performance Optimized**: Database indexing, caching, and pagination
- **Error Handling**: Centralized error handling with detailed logging
- **Input Validation**: Request validation with sanitization
- **API Documentation**: Well-structured RESTful API endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt + Passport (Google OAuth)
- **Validation**: Express Validator
- **Testing**: Jest + Supertest
- **Security**: Helmet, Rate Limiting, CORS
- **Logging**: Custom logging utility
- **Caching**: In-memory cache (Redis-ready)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run seed:dev
   ```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/learnify

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client
CLIENT_URL=http://localhost:5176

# Environment
NODE_ENV=development
```

## 🚀 Scripts

### Development
```bash
npm run dev          # Start development server with nodemon
npm run dev:debug    # Start with debugging enabled
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:unit    # Run unit tests only
npm run test:integration # Run integration tests only
```

### Database
```bash
npm run seed:dev     # Seed development data
npm run seed:clean   # Clean database
npm run db:reset     # Clean and reseed database
```

### Utilities
```bash
npm run health       # Check server health
npm run logs:clear   # Clear log files
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/test-history` - Get paginated test history
- `GET /api/dashboard/calendar` - Get calendar activity data
- `POST /api/dashboard/submit-test-result` - Submit test result

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/leaderboard/filters` - Get available filters

### Health
- `GET /health` - Server health check

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API and auth-specific limits
- **Input Validation**: Request sanitization and validation
- **Security Headers**: Helmet.js protection
- **Error Handling**: No sensitive data exposure

## 📊 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: In-memory caching for frequently accessed data
- **Pagination**: Efficient data loading with pagination
- **Query Optimization**: Aggregation pipelines and lean queries

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Models, middleware, utilities
- **Integration Tests**: API endpoints
- **Test Coverage**: 90%+ coverage target
- **Test Database**: In-memory MongoDB for testing

Run tests:
```bash
npm test
```

## 📝 Logging

Structured logging with different levels:
- **Error**: Application errors
- **Warn**: Warning messages
- **Info**: General information
- **Debug**: Development debugging (dev only)

Logs are stored in the `logs/` directory with daily rotation.

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database
- Use MongoDB Atlas or a managed MongoDB instance
- Ensure proper indexing is applied
- Set up regular backups

### Security
- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS settings
- Set up monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples
