/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sayur-v2.kohipahit.web.id',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  headers: async () => [
    {
      source: '/admin',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        { key: 'CDN-Cache-Control', value: 'no-store' },
        { key: 'Pragma', value: 'no-cache' },
      ],
    },
  ],
};

export default nextConfig;
