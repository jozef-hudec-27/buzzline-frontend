const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_CLOUD_HOSTNAME || '', port: '' }] },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}

module.exports = nextConfig
