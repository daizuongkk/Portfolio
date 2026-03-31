/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === "development", // ✅ StrictMode only in dev
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
