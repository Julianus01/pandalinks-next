/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/s2/favicons',
      },
    ],
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
