import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.tutorlink.cc", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://www.tutorlink.cc/teachers", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://www.tutorlink.cc/register", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://www.tutorlink.cc/guide", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://www.tutorlink.cc/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://www.tutorlink.cc/disclaimer", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://www.tutorlink.cc/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://www.tutorlink.cc/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
