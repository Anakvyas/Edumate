import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // increase from default 1 MB
    },
  },


  async redirects() {
    return [
      {
        source: "/",        // when user visits /
        destination: "/home",  
        permanent: true,   
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };

    return config;
  },
};




export default nextConfig;
