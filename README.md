# Transio - Transport Management System

A comprehensive open-source Transport Management System (TMS) built with modern web technologies. Designed specifically for European transport companies, with a focus on freight exchanges like Timocom.

## 🚀 Features

### Core Modules
- **Dashboard**: Real-time overview with aggregated summaries and proactive alerts
- **Transport Orders**: Complete order lifecycle management from offer to payment
- **Drivers Management**: Personal details, documents, payments tracking, expiry alerts
- **Vehicles Management**: Maintenance tracking, mileage monitoring, repair history
- **Partners Management**: Companies/clients database, order history, contracts
- **Invoicing**: Invoice generation, tracking, PDF export
- **Reports**: Comprehensive reporting with CSV/Excel export
- **Settings**: User management, system configuration, backup/restore

### Technical Features
- 🔐 JWT-based authentication with role management
- 📱 Progressive Web App (PWA) with offline support
- 🌐 RESTful API architecture
- 📊 Real-time data aggregation and reporting
- 📄 PDF generation for invoices and documents
- 🔄 Automatic backup system
- 📈 Performance monitoring
- 🛡️ OWASP security compliance

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form
- **UI Components**: Custom components with Lucide icons

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Joi

### Infrastructure
- **Process Manager**: PM2
- **Web Server**: Apache/Nginx (reverse proxy)
- **SSL**: Let's Encrypt compatible

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- MongoDB 6.0 or higher
- npm or yarn package manager
- PM2 (for production deployment)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/transio.git
cd transio
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Configure environment variables

Create `.env` files in both root and server directories:

**Root `.env`:**
```env
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

**Server `.env`:**
```env
NODE_ENV=development
PORT=8001
MONGODB_URI=mongodb://localhost:27017/transio
JWT_SECRET=your-secret-jwt-key-change-this-in-production
APP_URL=http://localhost:3001
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

### 4. Initialize the database
```bash
# Make sure MongoDB is running
mongod

# The application will create collections automatically on first run
```

### 5. Run the development servers
```bash
# In one terminal - Frontend
npm run dev

# In another terminal - Backend
cd server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

### 6. Create initial admin user

Use the registration endpoint or MongoDB directly to create your first admin user.

## 🏗️ Project Structure

```
transio/
├── components/          # React components
│   ├── curso/          # Order-related components
│   ├── sofer/          # Driver-related components
│   ├── vehicul/        # Vehicle-related components
│   └── ...
├── pages/              # Next.js pages
│   ├── api/           # API routes (if any)
│   ├── curse/         # Orders pages
│   ├── soferi/        # Drivers pages
│   └── ...
├── public/            # Static assets
├── server/            # Backend application
│   ├── models/        # MongoDB schemas
│   ├── routes/        # Express routes
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── app.js        # Express app entry point
├── styles/           # Global styles
├── utils/            # Frontend utilities
└── hooks/            # Custom React hooks
```

## 🚀 Production Deployment

### Using PM2

1. Build the frontend:
```bash
npm run build
```

2. Configure PM2 ecosystem file (already included):
```bash
# Edit ecosystem.config.js with your paths and settings
```

3. Start with PM2:
```bash
pm2 start ecosystem.config.js
```

4. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

### Using Docker (Optional)

Docker support coming soon.

## 🔧 Configuration

### Database Configuration
- MongoDB connection string in `MONGODB_URI`
- Database name can be changed in the connection string
- Indexes are created automatically

### Security Configuration
- Change `JWT_SECRET` to a strong random string
- Configure CORS origins in `server/app.js`
- Set up rate limiting based on your needs
- Enable HTTPS in production

### Email Configuration
- Configure SMTP settings in `.env`
- Email templates are in `server/templates/`

## 📚 API Documentation

### Authentication
```
POST /api/auth/login     - User login
POST /api/auth/register  - User registration
POST /api/auth/logout    - User logout
GET  /api/auth/me       - Get current user
```

### Resources
All resources follow RESTful conventions:
```
GET    /api/[resource]      - List all
GET    /api/[resource]/:id  - Get one
POST   /api/[resource]      - Create new
PUT    /api/[resource]/:id  - Update
DELETE /api/[resource]/:id  - Delete
```

Available resources:
- `/api/curse` - Transport orders
- `/api/soferi` - Drivers
- `/api/vehicule` - Vehicles
- `/api/parteneri` - Partners
- `/api/facturi` - Invoices
- `/api/rapoarte` - Reports
- `/api/setari` - Settings

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and Express.js
- UI components from Lucide React
- Styled with Tailwind CSS

## 📞 Support

For support, please open an issue in the GitHub repository.

## 🔒 Security

For security concerns, please contact the repository maintainers.

---

Made with ❤️ for the transport industry