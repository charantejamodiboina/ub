/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true, // ✅ Add this line
  },
};
// module.exports = {
//   output: 'export',
// }
export default nextConfig;
