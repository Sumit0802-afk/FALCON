/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Proxy all /api/* requests to the Falcon backend at port 4000.
  // This avoids CORS issues in development and mirrors production behaviour.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
