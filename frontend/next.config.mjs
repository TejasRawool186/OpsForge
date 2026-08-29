/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendHost = process.env.BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendHost}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
