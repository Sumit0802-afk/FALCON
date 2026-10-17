/** @type {import('next').NextConfig} */

// Headers every page is sent with. Other sites may not show Falcon in a frame (so it cannot be
// overlaid to trick a click), a page cannot be pointed at another site's address with <base> or
// a form, plugins cannot load, and the full address of a page is not passed on to other sites.
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The development badge sits in the bottom-left corner, on top of the editor's last tool button
  devIndicators: false,

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },

  // In development, /api/* is passed on to the backend on port 4000. A built site calls the
  // backend at NEXT_PUBLIC_API_URL instead, and never sends anything to a local address
  async rewrites() {
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
