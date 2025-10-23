import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
    
      config.watchOptions = {
        ignored: ['**/*'], 
      };
    }
    return config;
  },
  eslint: {
   
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
