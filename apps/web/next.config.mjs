/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enables the SWC Emotion transform: component labels and SSR-friendly output.
  compiler: {
    emotion: true,
  },
};

export default nextConfig;
