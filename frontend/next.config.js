/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The development badge sits in the bottom-left corner, on top of the editor's last tool button
  devIndicators: false,

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
