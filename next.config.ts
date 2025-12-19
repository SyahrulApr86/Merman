import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: "http://websocket:3001/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
