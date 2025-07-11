/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  output: 'export',
  UrImages: {
    unoptimized: true,
  },
};
// module.exports = {
//   output: 'export',
// }
export default nextConfig;
