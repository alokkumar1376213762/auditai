import { ActionItem } from "@/types/audit";

export function generateFixCodeSnippet(action: ActionItem, url: string): { language: string; filename: string; code: string } {
  const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const cat = (action.category || "").toLowerCase();
  const title = (action.title || "").toLowerCase();

  // 1. Schema JSON-LD
  if (cat.includes("seo") || title.includes("schema") || title.includes("structured") || title.includes("aeo") || title.includes("json-ld")) {
    return {
      language: "html",
      filename: "app/layout.tsx or index.html",
      code: `<!-- Add to <head> for AEO & Google AI Overview citations -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "${domain}",
  "url": "https://${domain}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://${domain}/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>`,
    };
  }

  // 2. Security Headers
  if (cat.includes("trust") || cat.includes("security") || title.includes("header") || title.includes("https")) {
    return {
      language: "typescript",
      filename: "next.config.ts / next.config.mjs",
      code: `// Secure Headers for HSTS, XSS protection, and Clickjacking mitigation
export default {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ],
      },
    ];
  },
};`,
    };
  }

  // 3. Performance / Image Optimization
  if (cat.includes("perf") || title.includes("image") || title.includes("lcp") || title.includes("asset")) {
    return {
      language: "tsx",
      filename: "components/HeroImage.tsx",
      code: `// Optimized Hero Image with priority loading & WebP/AVIF formats
import Image from "next/image";

export function HeroImage() {
  return (
    <Image
      src="/hero.webp"
      alt="${domain} Hero Banner"
      width={1200}
      height={630}
      priority={true} // Eliminates LCP latency
      placeholder="blur"
      blurDataURL="data:image/webp;base64,..."
      className="rounded-xl object-cover w-full h-auto"
    />
  );
}`,
    };
  }

  // 4. Accessibility / Contrast
  if (cat.includes("ux") || title.includes("accessib") || title.includes("alt") || title.includes("wcag")) {
    return {
      language: "html",
      filename: "AccessibleComponents.html",
      code: `<!-- WCAG 2.1 AA Compliant interactive button with focus ring -->
<button
  type="button"
  aria-label="Submit website audit analysis"
  class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
>
  <span>Execute Action</span>
</button>`,
    };
  }

  // 5. Default General Meta / Social Share
  return {
    language: "html",
    filename: "app/layout.tsx",
    code: `<!-- OpenGraph & Twitter Social Cards for ${domain} -->
<meta property="og:title" content="${action.title}" />
<meta property="og:description" content="${action.description.slice(0, 140)}..." />
<meta property="og:image" content="https://${domain}/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="robots" content="index, follow" />`,
  };
}
