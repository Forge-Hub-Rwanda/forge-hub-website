import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * The web app manifest: what an Android phone uses when someone adds the site
 * to their home screen. The icons are the black ForgeHub mark on a white
 * square, the same artwork as `icon.svg` and `apple-icon.png` in this folder.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} ${site.region}`,
    short_name: site.name,
    description: "Build · Innovate · Empower",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
