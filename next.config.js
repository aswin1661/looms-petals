/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['bootstrap'],
  images: {
    // Allow external images from Picsum
    domains: ['picsum.photos'],
    // Alternatively, use remotePatterns if you want stricter matching:
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    // ],
  },
}

module.exports = nextConfig