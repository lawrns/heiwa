/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      // Add other image domains as needed
    ],
  },
  env: {
    // Custom environment variables
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Redirect root to admin login
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
      },
    ]
  },


  // Force dynamic rendering for admin routes to prevent Firebase SSR issues
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
