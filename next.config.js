/** @type {import('next').NextConfig} */
const nextConfig = {
    // Standalone output is often recommended for Vercel to reduce cold starts and size
    output: 'standalone',
    eslint: {
        // Warning: This allows production builds to complete even if there are lint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
