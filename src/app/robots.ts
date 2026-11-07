import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/superadmin", "/set-password", "/api/"],
    },
    sitemap: "https://www.promptvault.codes/sitemap.xml",
  };
}
