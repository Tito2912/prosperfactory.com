/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export (keeps deployment close to your current HTML sites)
  output: 'export',
  trailingSlash: true,

  // SEO-friendly: keep strict checks on
  reactStrictMode: true,
};

export default nextConfig;
