/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  env: {
    STACKUP_BUNDLER_API_KEY: process.env.STACKUP_BUNDLER_API_KEY,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};
