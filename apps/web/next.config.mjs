/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace packages from source (no separate build step); Next
  // applies its SWC pipeline — including the Emotion transform below — to them.
  transpilePackages: ['@toolkit/ui'],
  // Enables the SWC Emotion transform: component labels and SSR-friendly output.
  compiler: {
    emotion: true,
  },
};

export default nextConfig;
