import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/media/**" },
      { pathname: "/images/**" },
      { pathname: "/api/media/**" },
    ],
  },
};

export default withPayload(nextConfig);
