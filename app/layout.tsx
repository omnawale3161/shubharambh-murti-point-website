import type { Metadata } from "next";
import { DM_Sans, EB_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShopProvider } from "@/components/ShopProvider";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, localBusinessSchema, siteConfig, websiteSchema } from "@/lib/seo";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { WhatsAppBubble } from "@/components/WhatsAppBubble";
import { AppToaster } from "@/components/AppToaster";

const serif = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-eb-garamond" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Premium Murti Collection`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "ecommerce",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: siteConfig.logo, type: "image/png" }
    ],
    shortcut: [{ url: siteConfig.logo, type: "image/png" }],
    apple: [{ url: siteConfig.logo, type: "image/png" }]
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Premium murti collection" }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.defaultImage)]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
        <Script
          id="strip-extension-hydration-attributes"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var blockedAttribute = "fdprocessedid";
                function stripBlockedAttribute(root) {
                  if (!root || root.nodeType !== 1) return;
                  if (root.hasAttribute && root.hasAttribute(blockedAttribute)) {
                    root.removeAttribute(blockedAttribute);
                  }
                  if (root.querySelectorAll) {
                    root.querySelectorAll("[" + blockedAttribute + "]").forEach(function (node) {
                      node.removeAttribute(blockedAttribute);
                    });
                  }
                }
                var nativeSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function (name, value) {
                  if (String(name).toLowerCase() === blockedAttribute) return;
                  return nativeSetAttribute.call(this, name, value);
                };
                new MutationObserver(function (mutations) {
                  mutations.forEach(function (mutation) {
                    if (mutation.type === "attributes" && mutation.attributeName === blockedAttribute) {
                      mutation.target.removeAttribute(blockedAttribute);
                    }
                    mutation.addedNodes.forEach(stripBlockedAttribute);
                  });
                }).observe(document.documentElement, { attributes: true, childList: true, subtree: true });
                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function () { stripBlockedAttribute(document.documentElement); });
                } else {
                  stripBlockedAttribute(document.documentElement);
                }
              })();
            `
          }}
        />
        <JsonLd data={[localBusinessSchema, websiteSchema]} />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ShopProvider>
          <AnnouncementBar />
          <Header />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <Footer />
          <WhatsAppBubble />
          <MobileBottomBar />
          <AppToaster />
        </ShopProvider>
      </body>
    </html>
  );
}
