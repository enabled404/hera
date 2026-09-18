import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/dashboard"],
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://herasec.vercel.app/sitemap.xml",
    host: "https://herasec.vercel.app",
  };
}
