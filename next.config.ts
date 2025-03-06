// Ensure this file is treated as a CommonJS module
/** @type {import('next').NextConfig} */

import "@ant-design/v5-patch-for-react-19"; // ✅ Just import it, no need to assign it

const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig; // ✅ Use ES module export