import type { NextConfig } from "next";
import { env } from "./lib/env";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${env.NEXT_PUBLIC_S3_BUCKET_NAME}.fly.storage.tigris.dev`,
        port: "",
      },
    ],
  },
};

export default nextConfig;
