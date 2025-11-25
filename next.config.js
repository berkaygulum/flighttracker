/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    async redirects() {
        return [
            {
                source: '/google',
                destination: 'https://google.com',
                permanent: false,
            },
        ]
    },
};

module.exports = nextConfig;
