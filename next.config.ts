/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
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
