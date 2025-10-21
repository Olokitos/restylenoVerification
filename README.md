# Restyle 7.0 - Modern Fashion Marketplace with Comprehensive Testing

A comprehensive fashion marketplace platform built with Laravel and React, featuring a modern glassmorphism UI design, advanced admin management system, and extensive automated testing suite.

## 🚀 Features

### ✨ Modern UI/UX
- **Glassmorphism Design**: Beautiful dark theme with backdrop blur effects
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Interactive Components**: Smooth animations and hover effects
- **Philippine Peso Formatting**: Accurate ₱ currency display

### 👤 User Management
- **User Authentication**: Secure login/logout system
- **Admin Dashboard**: Comprehensive admin panel with statistics
- **Role-based Navigation**: Different interfaces for admin vs regular users
- **Profile Management**: Complete user profile system

### 🛍️ Marketplace Features
- **Product Listings**: Create, edit, and manage fashion items
- **Category System**: Organized product categorization
- **Image Uploads**: Multiple image support for products
- **Search & Filter**: Advanced product discovery
- **Condition Tracking**: New, Like New, Good, Fair, Poor

### 💼 Seller Tools
- **Shop Profile**: Dedicated seller dashboard
- **Inventory Management**: Track active, sold, and inactive items
- **Sales Analytics**: Comprehensive statistics and insights
- **Mark as Sold**: Easy item status management
- **Delete Sold Items**: Clean up sold inventory

### 🔧 Admin Features
- **Dashboard Analytics**: User statistics, transaction monitoring
- **User Management**: Complete user administration
- **Commission Tracking**: Revenue monitoring system
- **Transaction Management**: Payment and escrow handling
- **System Monitoring**: Platform health and performance

### 💬 Communication
- **Messaging System**: Buyer-seller communication
- **Conversation Management**: Organized chat interface
- **Product Discussions**: Context-aware messaging

### 🧪 Testing Suite
- **82 Passing Tests**: Comprehensive test coverage
- **PEST Framework**: Modern PHP testing with expressive syntax
- **Browser Test Dashboard**: Web-based test runner interface
- **Feature Tests**: Profile, Wardrobe, Marketplace, Admin modules
- **Database Factories**: Test data generation

## 🛠️ Technology Stack

### Backend
- **Laravel 11**: PHP framework with modern features
- **MySQL**: Database management
- **Laravel Fortify**: Authentication system
- **Laravel Inertia**: SPA-like experience
- **PEST**: Testing framework

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool
- **Lucide React**: Beautiful icons

### Development Tools
- **Laravel Herd**: Local development environment
- **Git**: Version control
- **Composer**: PHP dependency management
- **NPM**: Node package management

## 📦 Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer
- Laravel Herd (recommended)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/willowpf/Restyle7.git
cd Restyle7
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Install Node.js dependencies**
```bash
npm install
```

4. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Database configuration**
- Update `.env` with your database credentials
- Run migrations:
```bash
php artisan migrate
```

6. **Seed the database**
```bash
php artisan db:seed
```

7. **Build frontend assets**
```bash
npm run build
```

8. **Start the application**
```bash
php artisan serve
```

## 🔑 Default Credentials

### Admin User
- **Email**: `admin@restyle.com`
- **Password**: `admin123`

### Test User
- **Email**: `test@example.com`
- **Password**: `password`

## 🧪 Running Tests

### Terminal Testing
```bash
# Run all tests
php artisan test

# Run specific test suites
php artisan test tests/Feature/Profile
php artisan test tests/Feature/Wardrobe
php artisan test tests/Feature/Marketplace
php artisan test tests/Feature/Admin

# Run with coverage
php artisan test --coverage
```

### Browser Test Dashboard
1. Start the application: `php artisan serve`
2. Visit: `http://localhost:8000/test-runner`
3. Click "Run All Tests" to execute tests in the browser

For more testing details, see [README_TESTING.md](README_TESTING.md)

## 📁 Project Structure

```
restyle7.0/
├── app/
│   ├── Http/Controllers/     # API controllers
│   ├── Models/              # Eloquent models
│   └── Providers/           # Service providers
├── database/
│   ├── migrations/          # Database schema
│   ├── seeders/            # Sample data
│   └── factories/          # Test data factories
├── resources/
│   ├── js/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   ├── css/                # Stylesheets
│   └── views/              # Blade templates
├── routes/                 # Application routes
├── tests/
│   ├── Feature/            # Feature tests
│   └── Unit/              # Unit tests
└── public/                 # Public assets
```

## 🎨 UI Components

### Glassmorphism Design System
- **Cards**: Semi-transparent with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Navigation**: Modern sidebar and header design
- **Forms**: Styled input fields and validation
- **Modals**: Overlay components with blur effects

### Color Palette
- **Primary**: Blue to Cyan gradients
- **Secondary**: Purple to Pink gradients
- **Success**: Green to Emerald gradients
- **Warning**: Orange to Red gradients
- **Danger**: Red to Pink gradients

## 🔄 Key Workflows

### Product Management
1. **Create**: Upload images, set details, choose category
2. **List**: Items appear in marketplace with search
3. **Sell**: Mark as sold when purchased
4. **Delete**: Remove sold items from inventory

### Admin Operations
1. **Monitor**: View platform statistics and health
2. **Manage**: Handle users, transactions, commissions
3. **Analyze**: Track performance and growth metrics

## 🚀 Deployment

### Production Setup
1. **Server Requirements**
   - PHP 8.2+ with extensions
   - MySQL 8.0+
   - Node.js 18+
   - Web server (Apache/Nginx)

2. **Environment Configuration**
   - Set `APP_ENV=production`
   - Configure database credentials
   - Set up file storage
   - Configure mail settings

3. **Optimization**
   - Run `php artisan config:cache`
   - Run `php artisan route:cache`
   - Run `php artisan view:cache`
   - Build production assets: `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: willowpf
- **Framework**: Laravel + React
- **Design**: Glassmorphism UI/UX
- **Testing**: PEST Framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check documentation in the docs/ folder

## 🎯 Roadmap

### Version 7.1
- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app

### Version 7.2
- [ ] AI-powered recommendations
- [ ] Social features
- [ ] Advanced search filters
- [ ] Multi-language support

---

**Restyle 7.0** - Redefining Fashion Commerce with Modern Technology & Comprehensive Testing 🚀
