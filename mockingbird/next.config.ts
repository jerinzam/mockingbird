import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NODE_ENV === 'production' 
              ? 'https://your-production-domain.com' 
              : '*' 
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,HEAD,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  }
};

export default nextConfig;
