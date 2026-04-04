# AgroFeed - Feed Distribution Platform

A production-ready full-stack web application for a feed distribution company built with Next.js, MongoDB, and Tailwind CSS.

## Features

### Customer Features
- User registration and login with JWT authentication
- Browse products with category filtering and search
- Product details with nutritional information
- Add to cart and manage quantities
- Checkout with delivery/pickup options
- Order history and tracking
- Submit product reviews
- Contact form

### Admin Features
- Dashboard with statistics and analytics
- Full product management (CRUD)
- Order management with status updates
- User management
- Content management system (CMS)
- Review moderation
- Contact message management

### Technical Features
- Dark/Light mode toggle
- Responsive design
- Toast notifications
- Loading skeletons
- Protected routes
- Role-based access control

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **State Management**: React Context

## Project Structure

```
feed-platform/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth route group
│   │   ├── login/         # Login page
│   │   └── register/      # Register page
│   ├── (admin)/           # Admin route group
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   ├── users/         # User management
│   │   ├── content/       # CMS
│   │   ├── reviews/       # Review moderation
│   │   ├── contacts/      # Contact messages
│   │   └── layout.tsx     # Admin layout
│   ├── (customer)/        # Customer route group
│   │   ├── dashboard/     # Customer dashboard
│   │   ├── orders/        # Order history
│   │   └── cart/          # Shopping cart
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints
│   │   ├── products/      # Product endpoints
│   │   ├── orders/        # Order endpoints
│   │   ├── users/         # User endpoints
│   │   ├── reviews/       # Review endpoints
│   │   ├── content/       # Content endpoints
│   │   ├── contact/       # Contact endpoints
│   │   └── stats/         # Statistics endpoint
│   ├── products/          # Products listing page
│   ├── product/[id]/      # Product detail page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── privacy/           # Privacy policy page
│   ├── terms/             # Terms page
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components (shadcn)
│   └── shared/           # Shared components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── models/               # Mongoose models
├── types/                # TypeScript types
├── middleware.ts         # Next.js middleware
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd feed-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/feed-distribution
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-super-secret-nextauth-key
NEXTAUTH_URL=http://localhost:3000
DELIVERY_CHARGE=150
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Creating an Admin User

1. Register a new user through the website
2. In MongoDB, update the user's role to 'admin':
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (admin)
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order
- `PATCH /api/orders/[id]` - Update order status (admin)

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `PATCH /api/reviews/[id]` - Approve/reject review (admin)
- `DELETE /api/reviews/[id]` - Delete review (admin)

### Content
- `GET /api/content` - Get content
- `POST /api/content` - Update content (admin)

### Contact
- `GET /api/contact` - List messages (admin)
- `POST /api/contact` - Submit message
- `PATCH /api/contact/[id]` - Mark as read (admin)
- `DELETE /api/contact/[id]` - Delete message (admin)

## Database Models

### User
- name: string
- email: string (unique)
- password: string (hashed)
- role: 'customer' | 'admin'
- createdAt: Date

### Product
- name: string
- category: string
- description: string
- nutrients: { protein, fat, fiber, moisture }
- price: number
- stock: number
- image: string
- createdAt: Date

### Order
- user: ObjectId (ref: User)
- items: [{ product, quantity, price }]
- deliveryType: 'delivery' | 'pickup'
- deliveryCharge: number
- totalPrice: number
- status: string
- shippingAddress: object
- createdAt: Date

### Review
- user: ObjectId (ref: User)
- product: ObjectId (ref: Product)
- rating: number (1-5)
- comment: string
- approved: boolean
- createdAt: Date

### Content
- key: string (unique)
- title: string
- value: string
- updatedAt: Date

### Contact
- name: string
- email: string
- subject: string
- message: string
- read: boolean
- createdAt: Date

## Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth | Yes |
| NEXTAUTH_URL | Application URL | Yes |
| DELIVERY_CHARGE | Delivery fee amount | No (default: 150) |

## License

MIT License
