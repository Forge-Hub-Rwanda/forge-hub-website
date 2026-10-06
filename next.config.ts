import type { NextConfig } from "next";

/**
 * Photos uploaded through /admin (team portraits, portfolio galleries) are
 * served from the Supabase project's public storage. `next/image` refuses any
 * external host it has not been told about — in development it fails the
 * whole page — so allow that one path on that one host, and nothing else.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [
          new URL(
            `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/**`,
          ),
        ]
      : [],
  },
};

export default nextConfig;
