# Heiwa House Admin Dashboard

A self-contained admin dashboard for managing bookings, rooms, surf camps, and clients with Supabase integration.

## Features

- **Authentication**: Supabase Auth with admin email verification
- **Bookings Management**: Full CRUD operations for bookings
- **Rooms Management**: Manage room inventory and pricing
- **Surf Camps Management**: Create and manage surf camp sessions
- **Clients Management**: View and manage client information
- **Add-ons Management**: Manage additional services
- **Real-time Updates**: Supabase PostgreSQL real-time data synchronization
- **Responsive Design**: Mobile-friendly admin interface

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Query + Supabase Client
- **Forms**: React Hook Form + Zod validation
- **Icons**: Heroicons + Lucide React

## Prerequisites

- Node.js 18+
- Supabase project with PostgreSQL and Authentication enabled
- Admin email addresses for authentication

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [Supabase Console](https://supabase.com/dashboard)
2. Enable Authentication with Email/Password provider
3. Set up PostgreSQL database with required tables
4. Enable Storage for file uploads
5. Get your Supabase configuration from Project Settings

### 2. Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase configuration values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
```

### 3. Admin User Setup

1. Update the admin email list in `src/lib/auth.ts`:
```typescript
const ADMIN_EMAILS = [
  'your-admin@email.com',
  'another-admin@email.com',
];
```

2. Create admin users in Supabase Authentication console or register through the app

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### 5. Access the Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Sign in with an admin email address
3. Access the dashboard at `http://localhost:3000/admin`

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin routes
│   │   ├── api/             # API endpoints
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   └── ui/              # Reusable UI components
│   └── lib/
│       ├── supabase/        # Supabase client config
│       ├── supabase-admin.ts # Supabase admin operations
│       ├── auth.ts          # Authentication utilities
│       └── schemas.ts       # Data validation schemas
├── public/                  # Static assets
├── .env.example           # Environment template
└── package.json           # Dependencies
```

## Security Notes

- Admin access is controlled by email whitelist in `src/lib/auth.ts`
- All API routes require admin authentication
- Supabase Row Level Security (RLS) policies restrict access to authenticated admin users
- Use environment variables for all sensitive configuration

## Deployment

### Netlify Deployment (Recommended)

1. **Connect Repository**:
   - Go to [Netlify](https://app.netlify.com) and sign in
   - Click "New site from Git"
   - Connect your repository: `https://github.com/lawrns/dashboard-wave`

2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (this is automatically configured via `netlify.toml`)
   - **Node version**: 18

3. **Set Environment Variables** in Netlify Dashboard:
   - Go to Site Settings > Environment Variables
   - Add all Supabase environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`

4. **Deploy**:
   - Netlify will automatically deploy when you push changes to the main branch
   - Monitor deployment status in the Netlify dashboard
   - Access your site at the generated URL (e.g., `https://amazing-site-name.netlify.app`)

5. **Custom Domain** (Optional):
   - Go to Site Settings > Domain management
   - Add your custom domain
   - Configure DNS records as instructed

### Vercel Deployment (Alternative)

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Deploy to Vercel**:
```bash
# First-time deployment
vercel

# Production deployment
vercel --prod
```

3. **Set Environment Variables in Vercel Dashboard**:
   - Go to your Vercel project dashboard
   - Navigate to Project Settings > Environment Variables
   - Add all Supabase environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`

4. **Update Admin Emails**:
   - Modify `src/lib/auth.ts` to include your admin email addresses
   - Redeploy after making changes

### Manual Deployment Steps

1. **Clone the repository**:
```bash
git clone https://github.com/lawrns/dashboard-wave.git
cd admin-dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase keys
```

4. **Test locally**:
```bash
npm run dev
# Visit http://localhost:3000/admin to test
```

5. **Build for production**:
```bash
npm run build
npm start
```

### Other Platforms

1. Build the project: `npm run build`
2. Deploy the `.next` folder and `package.json`
3. Set environment variables on your platform
4. Run `npm start` to serve the application

**Note**: For Netlify deployment, refer to the Netlify Deployment section above for detailed instructions.

## Customization

- **Branding**: Update colors in `src/app/globals.css`
- **Admin Emails**: Modify `ADMIN_EMAILS` in `src/lib/auth.ts`
- **Features**: Enable/disable features with environment flags
- **UI Components**: Customize components in `src/components/ui/`

## Troubleshooting

### Common Issues

1. **Supabase Configuration Errors**
   - Ensure all environment variables are set correctly
   - Check that Supabase project has Authentication and Database enabled
   - Verify admin emails are added to the whitelist in `src/lib/auth.ts`

2. **Authentication Issues**
   - Make sure the user email is in the admin whitelist
   - Check Supabase Authentication console for user creation
   - Verify Row Level Security (RLS) policies allow admin access

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that all required environment variables are set
   - Verify TypeScript configuration is correct

### Development Tips

- Use Supabase local development setup for testing
- Check browser console for detailed error messages
- Monitor Supabase dashboard for authentication and database activity
- Use the Network tab to debug API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase documentation
- Check the original project documentation
- Create an issue in the repository
