export const siteConfig = {
  name: "Shubharambh Murti Point",
  url: "https://shubharambhmurti.com",
  description: "Premium murti collection for home mandirs, gifting, festivals, and spiritual spaces.",
  phone: "+917796675304",
  locale: "en_IN",
  logo: "/assets/logo.png",
  defaultImage: "/assets/showroom-hero.png",
  instagram: "https://instagram.com/shubharambh.murti"
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
