/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: process.env.CLOUD_HOSTNAME, port: '' }] },
}

module.exports = nextConfig
