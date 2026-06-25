import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/teachers", "/teachers/", "/guide", "/disclaimer", "/privacy", "/terms"],
        disallow: ["/dashboard", "/admin", "/api/", "/room/"],
      },
    ],
    sitemap: "https://www.tutorlink.cc/sitemap.xml",
  };
}
