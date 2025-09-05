/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
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
