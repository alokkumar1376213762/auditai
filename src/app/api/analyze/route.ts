import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import Groq from "groq-sdk";
import { WebsiteAuditReport, ScrapedSignals, ComprehensivePillar } from "@/types/audit";

function calculateGrade(score: number): "A+" | "A" | "B" | "C" | "D" | "F" {
  if (score >= 93) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

function getPillarStatus(score: number): "Excellent" | "Good" | "Needs Improvement" | "Poor" {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Improvement";
  return "Poor";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { url, apiKey, model } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please provide a valid website URL." }, { status: 400 });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    // Step 1: Scrape Website HTML
    const startTime = Date.now();
    let html = "";
    let statusCode = 200;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AuditAI/2.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeoutId);
      statusCode = response.status;
      html = await response.text();
    } catch (fetchErr: any) {
      console.warn("Direct fetch error:", fetchErr.message);
      return NextResponse.json(
        {
          error: `Could not reach ${url}. Please verify that the domain exists and is publicly accessible. (${fetchErr.message})`,
        },
        { status: 502 }
      );
    }

    const responseTimeMs = Date.now() - startTime;

    // Step 2: Cheerio DOM Parsing
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const ogTitle = $('meta[property="og:title"]').attr("content") || "";
    const ogDescription = $('meta[property="og:description"]').attr("content") || "";
    const ogImage = $('meta[property="og:image"]').attr("content") || "";
    const twitterCard = $('meta[name="twitter:card"]').attr("content") || "";
    const viewportMeta = $('meta[name="viewport"]').attr("content") || "";

    // Trust & Architecture checks
    const hasSchemaJsonLd = $('script[type="application/ld+json"]').length > 0;
    const hasSitemapLink =
      $('link[rel="sitemap"]').length > 0 || $('a[href*="sitemap"]').length > 0;

    let hasPrivacyPolicy = false;
    let hasTermsOfService = false;
    let hasContactOrAbout = false;

    $("a").each((_, el) => {
      const href = ($(el).attr("href") || "").toLowerCase();
      const text = $(el).text().toLowerCase();
      if (href.includes("privacy") || text.includes("privacy")) hasPrivacyPolicy = true;
      if (href.includes("terms") || text.includes("terms") || text.includes("tos"))
        hasTermsOfService = true;
      if (
        href.includes("contact") ||
        text.includes("contact") ||
        href.includes("about") ||
        text.includes("about us")
      ) {
        hasContactOrAbout = true;
      }
    });

    const hasFormsOrInputs = $("form").length > 0 || $('input[type="email"]').length > 0;

    const h1Elements: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 160) h1Elements.push(text);
    });

    const h2Count = $("h2").length;
    const h3Count = $("h3").length;

    let totalImages = 0;
    let missingAltImages = 0;
    $("img").each((_, el) => {
      totalImages++;
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") missingAltImages++;
    });

    const scriptsCount = $("script[src]").length;
    const stylesheetsCount = $('link[rel="stylesheet"]').length;
    const linksCount = $("a").length;
    const buttonsCount = $("button").length + $('a[class*="btn"], a[class*="button"]').length;

    // Clean invisible elements for body text extraction
    $("script, style, noscript, svg, iframe").remove();
    const rawBodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = rawBodyText ? rawBodyText.split(/\s+/).length : 0;
    const bodySnippet = rawBodyText.slice(0, 4000);

    const scrapedSignals: ScrapedSignals = {
      url,
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      viewportMeta,
      hasSchemaJsonLd,
      hasSitemapLink,
      hasPrivacyPolicy,
      hasTermsOfService,
      hasContactOrAbout,
      hasFormsOrInputs,
      headings: {
        h1: h1Elements.slice(0, 5),
        h2Count,
        h3Count,
      },
      images: {
        total: totalImages,
        withAlt: Math.max(0, totalImages - missingAltImages),
        missingAlt: missingAltImages,
      },
      resources: {
        scripts: scriptsCount,
        stylesheets: stylesheetsCount,
        links: linksCount,
        buttons: buttonsCount,
      },
      textStats: {
        charCount: rawBodyText.length,
        wordCount,
      },
      mobileResponsive: Boolean(viewportMeta && viewportMeta.includes("width=device-width")),
      ssl: url.startsWith("https://"),
      responseTimeMs,
    };

    // Step 3: Run with Groq AI using environment key
    const effectiveApiKey = apiKey || process.env.GROQ_API_KEY;
    const selectedModel = model || process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    if (effectiveApiKey) {
      try {
        const groq = new Groq({ apiKey: effectiveApiKey });

        const systemPrompt = `You are a Principal Web Auditor, Chief Product Designer, Core Web Vitals Engineer, and Head of SEO & AI Discovery (AEO/GEO).
Your job is to rigorously evaluate a website across the 7 mandatory industry pillars:

1. Performance & Technical (Core Web Vitals: LCP, FID/INP, CLS estimation, Mobile responsiveness, Uptime/reliability, HTTPS, script/asset payload)
2. SEO & Discoverability + AEO & GEO (Search rankings, organic traffic readiness, Answer Engine Optimization (AEO) for AI search, Generative Engine Optimization (GEO) for ChatGPT/Perplexity/Gemini, Meta tags, Headings, Schema structured data, XML sitemap/robots)
3. User Experience (UX) & Design (Navigation clarity, Visual consistency, Readability, Typography, Contrast, Whitespace, WCAG 2.1 a11y, Alt text)
4. Content Quality & Media (Relevance to audience, Originality, Depth, Freshness, Tone, Media quality)
5. Conversion & Business Impact (CRO) (CTA effectiveness, Conversion rate potential for signups/sales, Bounce risk, Friction points)
6. Trust & Credibility (Privacy policy, Terms, Contact/About transparency, Testimonials, Social proof, Security badges, Professional polish vs amateur markers)
7. Analytics & Engagement Signals (Traffic sources readiness, Social share viral cards, Lead capture mechanisms)

You MUST reply strictly with a JSON object matching this schema:
{
  "overallScore": number (0-100),
  "summary": string (3-4 crisp, highly actionable sentences assessing commercial readiness and main bottlenecks),
  "pillars": {
    "performance": {
      "id": "perf",
      "title": "Performance & Technical",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "Core Web Vitals (LCP/INP/CLS)", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Mobile Responsiveness", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "HTTPS & Protocol Security", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Asset & Script Overhead", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[] (2-4 items),
      "cons": string[] (2-4 items)
    },
    "seoAndAeo": {
      "id": "seo",
      "title": "SEO, AEO & Generative Search (GEO)",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "AEO & GEO (AI Search Readiness)", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Meta Tags & SERP Preview", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Structured Data (Schema / JSON-LD)", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Hierarchy & Crawlability", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[],
      "cons": string[]
    },
    "uxAndDesign": {
      "id": "ux",
      "title": "User Experience (UX) & Design",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "Visual Design & Aesthetics", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Navigation & Information Architecture", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Typography & Whitespace", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "WCAG 2.1 Accessibility & Alt Text", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[],
      "cons": string[]
    },
    "contentQuality": {
      "id": "content",
      "title": "Content Quality & Media",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "Audience Relevance & Depth", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Tone & Clarity", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Media Optimization (Images/Media)", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[],
      "cons": string[]
    },
    "conversion": {
      "id": "cro",
      "title": "Conversion & Business Impact (CRO)",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "Call-to-Action (CTA) Prominence", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Friction Points & Form Design", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Bounce Rate Risk", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[],
      "cons": string[]
    },
    "trustAndCredibility": {
      "id": "trust",
      "title": "Trust & Credibility",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "Social Proof & Testimonials", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Privacy Policy & Terms Compliance", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Contact & Transparency", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[],
      "cons": string[]
    },
    "analyticsAndEngagement": {
      "id": "analytics",
      "title": "Analytics & Engagement Signals",
      "score": number (0-100),
      "status": "Excellent" | "Good" | "Needs Improvement" | "Poor",
      "summary": string,
      "subItems": [
        { "name": "Social Sharing & OpenGraph", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string },
        { "name": "Lead Capture & Retention Loop", "score": number, "status": "Passed"|"Warning"|"Failed", "detail": string }
      ],
      "pros": string[],
      "cons": string[]
    }
  },
  "actionItems": [
    {
      "id": string,
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "category": "Performance" | "SEO & AEO" | "UX & Design" | "Content" | "Conversion (CRO)" | "Trust & Security" | "Analytics",
      "title": string,
      "description": string,
      "estimatedEffort": "Quick (< 15 mins)" | "Moderate (1-2 hrs)" | "In-depth (Half day)",
      "impact": string
    }
  ] (5-7 prioritized recommendations),
  "topStrengths": string[] (3-5 bullet points),
  "quickWins": string[] (3 immediate high-impact quick fixes)
}`;

        const userPrompt = `Audit this website:
URL: ${url}
HTTP Status: ${statusCode}
Response Time: ${responseTimeMs}ms
SSL: ${scrapedSignals.ssl}
Mobile Viewport Meta: "${scrapedSignals.viewportMeta || "MISSING"}"
Title: "${scrapedSignals.title}"
Meta Description: "${scrapedSignals.description || "MISSING"}"
OpenGraph Title: "${scrapedSignals.ogTitle || "MISSING"}"
OpenGraph Image: "${scrapedSignals.ogImage || "MISSING"}"
Twitter Card: "${scrapedSignals.twitterCard || "MISSING"}"
Schema.org JSON-LD Found: ${scrapedSignals.hasSchemaJsonLd}
Sitemap Reference: ${scrapedSignals.hasSitemapLink}
Privacy Policy Link Found: ${scrapedSignals.hasPrivacyPolicy}
Terms of Service Link Found: ${scrapedSignals.hasTermsOfService}
Contact/About Link Found: ${scrapedSignals.hasContactOrAbout}
Forms/Inputs Found: ${scrapedSignals.hasFormsOrInputs}
H1 Headings: ${JSON.stringify(scrapedSignals.headings.h1)}
H2 Count: ${scrapedSignals.headings.h2Count} | H3 Count: ${scrapedSignals.headings.h3Count}
Total Images: ${scrapedSignals.images.total} | Missing Alt: ${scrapedSignals.images.missingAlt}
Scripts: ${scrapedSignals.resources.scripts} | Stylesheets: ${scrapedSignals.resources.stylesheets}
Links: ${scrapedSignals.resources.links} | Buttons & CTA links: ${scrapedSignals.resources.buttons}
Total Word Count: ${scrapedSignals.textStats.wordCount}

Page Content Excerpt:
"${bodySnippet.replace(/[\n\r]+/g, " ")}"`;

        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: selectedModel,
          temperature: 0.3,
          response_format: { type: "json_object" },
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
        const overallScore = Math.min(100, Math.max(0, Math.round(parsed.overallScore || 75)));

        const finalReport: WebsiteAuditReport = {
          url,
          analyzedAt: new Date().toISOString(),
          overallScore,
          grade: calculateGrade(overallScore),
          summary: parsed.summary || "Full multi-pillar audit completed.",
          usedAiModel: `Groq AI (${selectedModel})`,
          scrapedSignals,
          pillars: parsed.pillars,
          actionItems: parsed.actionItems || [],
          topStrengths: parsed.topStrengths || [],
          quickWins: parsed.quickWins || [],
        };

        return NextResponse.json(finalReport);
      } catch (groqErr: any) {
        console.error("Groq API error:", groqErr);
      }
    }

    // Step 4: Deterministic fallback engine evaluating all 7 pillars
    // 1. Performance
    let perfScore = 85;
    if (responseTimeMs > 1000) perfScore -= 20;
    else if (responseTimeMs > 500) perfScore -= 10;
    if (scriptsCount > 20) perfScore -= 15;
    if (!scrapedSignals.ssl) perfScore -= 25;

    // 2. SEO & AEO / GEO
    let seoScore = 80;
    if (!scrapedSignals.title) seoScore -= 25;
    if (!scrapedSignals.description) seoScore -= 20;
    if (!scrapedSignals.hasSchemaJsonLd) seoScore -= 15; // Essential for AEO & GEO
    if (scrapedSignals.headings.h1.length === 0) seoScore -= 15;

    // 3. UX & Design
    let uxScore = 85;
    if (!scrapedSignals.mobileResponsive) uxScore -= 35;
    if (scrapedSignals.images.missingAlt > 0) uxScore -= Math.min(20, scrapedSignals.images.missingAlt * 4);

    // 4. Content Quality
    let contentScore = 80;
    if (wordCount < 150) contentScore -= 25;
    else if (wordCount > 600) contentScore += 10;

    // 5. Conversion (CRO)
    let croScore = 75;
    if (buttonsCount === 0) croScore -= 25;
    if (!scrapedSignals.hasFormsOrInputs) croScore -= 10;

    // 6. Trust & Credibility
    let trustScore = 80;
    if (!scrapedSignals.hasPrivacyPolicy) trustScore -= 15;
    if (!scrapedSignals.hasTermsOfService) trustScore -= 10;
    if (!scrapedSignals.hasContactOrAbout) trustScore -= 15;
    if (!scrapedSignals.ssl) trustScore -= 30;

    // 7. Analytics & Engagement
    let analyticsScore = 75;
    if (!ogImage) analyticsScore -= 20;
    if (!twitterCard) analyticsScore -= 10;

    perfScore = Math.max(20, Math.min(100, perfScore));
    seoScore = Math.max(20, Math.min(100, seoScore));
    uxScore = Math.max(20, Math.min(100, uxScore));
    contentScore = Math.max(20, Math.min(100, contentScore));
    croScore = Math.max(20, Math.min(100, croScore));
    trustScore = Math.max(20, Math.min(100, trustScore));
    analyticsScore = Math.max(20, Math.min(100, analyticsScore));

    const overallScore = Math.round(
      (perfScore + seoScore + uxScore + contentScore + croScore + trustScore + analyticsScore) / 7
    );

    const fallbackReport: WebsiteAuditReport = {
      url,
      analyzedAt: new Date().toISOString(),
      overallScore,
      grade: calculateGrade(overallScore),
      summary: `Automated 7-pillar audit completed for ${url}. The website scores ${overallScore}/100 with key strengths in ${
        scrapedSignals.ssl ? "security" : "structure"
      } and high-impact optimization potential in ${
        !scrapedSignals.hasSchemaJsonLd ? "AEO/GEO structured data" : "Core Web Vitals"
      }.`,
      usedAiModel: effectiveApiKey
        ? "Heuristic Multi-Pillar Engine (Groq fallback)"
        : "Heuristic 7-Pillar Engine (Add Groq Key for Deep AI)",
      scrapedSignals,
      pillars: {
        performance: {
          id: "perf",
          title: "Performance & Technical",
          score: perfScore,
          status: getPillarStatus(perfScore),
          summary: "Core Web Vitals latency, script overhead, and transport encryption.",
          subItems: [
            {
              name: "Initial Response Time (TTFB)",
              score: responseTimeMs < 500 ? 95 : responseTimeMs < 1000 ? 75 : 45,
              status: responseTimeMs < 500 ? "Passed" : responseTimeMs < 1000 ? "Warning" : "Failed",
              detail: `${responseTimeMs}ms server latency`,
            },
            {
              name: "Mobile Responsiveness",
              score: scrapedSignals.mobileResponsive ? 98 : 30,
              status: scrapedSignals.mobileResponsive ? "Passed" : "Failed",
              detail: scrapedSignals.mobileResponsive ? "Configured with device-width" : "Missing viewport meta tag",
            },
            {
              name: "HTTPS Security Setup",
              score: scrapedSignals.ssl ? 100 : 20,
              status: scrapedSignals.ssl ? "Passed" : "Failed",
              detail: scrapedSignals.ssl ? "TLS/SSL active" : "Insecure HTTP connection",
            },
            {
              name: "Script & Asset Overhead",
              score: scriptsCount < 15 ? 90 : 65,
              status: scriptsCount < 15 ? "Passed" : "Warning",
              detail: `${scriptsCount} script bundles detected`,
            },
          ],
          pros: [
            scrapedSignals.ssl ? "HTTPS/SSL encryption active" : "Server responded successfully",
            `Initial server response: ${responseTimeMs}ms`,
          ],
          cons: [
            ...(scriptsCount > 15 ? [`High script payload count (${scriptsCount} external scripts).`] : []),
            ...(responseTimeMs > 800 ? ["Server latency exceeds recommended 600ms threshold."] : []),
          ],
        },
        seoAndAeo: {
          id: "seo",
          title: "SEO, AEO & Generative Search (GEO)",
          score: seoScore,
          status: getPillarStatus(seoScore),
          summary: "Traditional search visibility plus Generative Engine Optimization (Perplexity/ChatGPT/Gemini).",
          subItems: [
            {
              name: "AEO & GEO AI Citations",
              score: scrapedSignals.hasSchemaJsonLd ? 90 : 45,
              status: scrapedSignals.hasSchemaJsonLd ? "Passed" : "Warning",
              detail: scrapedSignals.hasSchemaJsonLd
                ? "JSON-LD entities enable AI answers"
                : "Missing Schema JSON-LD for AI search engines",
            },
            {
              name: "Title & Meta Description",
              score: scrapedSignals.title && scrapedSignals.description ? 95 : 40,
              status: scrapedSignals.title && scrapedSignals.description ? "Passed" : "Failed",
              detail: scrapedSignals.title ? `Title present (${scrapedSignals.title.length} chars)` : "Missing title",
            },
            {
              name: "Structured Data (Schema.org)",
              score: scrapedSignals.hasSchemaJsonLd ? 95 : 30,
              status: scrapedSignals.hasSchemaJsonLd ? "Passed" : "Failed",
              detail: scrapedSignals.hasSchemaJsonLd ? "Valid JSON-LD schema detected" : "No JSON-LD schema found",
            },
            {
              name: "Heading Hierarchy",
              score: scrapedSignals.headings.h1.length === 1 ? 95 : 60,
              status: scrapedSignals.headings.h1.length === 1 ? "Passed" : "Warning",
              detail: `${scrapedSignals.headings.h1.length} H1 tags, ${scrapedSignals.headings.h2Count} H2 tags`,
            },
          ],
          pros: [
            scrapedSignals.title ? "Descriptive title tag implemented" : "HTML structure parsed",
            scrapedSignals.hasSchemaJsonLd ? "Structured JSON-LD helps AI Overviews" : "Semantic heading tags present",
          ],
          cons: [
            ...(!scrapedSignals.description ? ["Missing meta description tag for SERP snippets."] : []),
            ...(!scrapedSignals.hasSchemaJsonLd ? ["Implement JSON-LD Schema to rank in Perplexity and ChatGPT Search (GEO)."] : []),
          ],
        },
        uxAndDesign: {
          id: "ux",
          title: "User Experience (UX) & Design",
          score: uxScore,
          status: getPillarStatus(uxScore),
          summary: "Visual design consistency, accessibility compliance, and readability.",
          subItems: [
            {
              name: "Visual Hierarchy & Layout",
              score: scrapedSignals.headings.h2Count >= 2 ? 90 : 70,
              status: scrapedSignals.headings.h2Count >= 2 ? "Passed" : "Warning",
              detail: `${scrapedSignals.headings.h2Count} distinct section headings (H2)`,
            },
            {
              name: "Accessibility (WCAG a11y)",
              score: scrapedSignals.images.missingAlt === 0 ? 95 : 55,
              status: scrapedSignals.images.missingAlt === 0 ? "Passed" : "Warning",
              detail: `${scrapedSignals.images.missingAlt} of ${scrapedSignals.images.total} images missing alt text`,
            },
            {
              name: "Mobile Usability",
              score: scrapedSignals.mobileResponsive ? 98 : 30,
              status: scrapedSignals.mobileResponsive ? "Passed" : "Failed",
              detail: scrapedSignals.mobileResponsive ? "Responsive viewport configured" : "Unresponsive viewport",
            },
          ],
          pros: [
            scrapedSignals.mobileResponsive ? "Mobile-first responsive viewport confirmed" : "Desktop layout ready",
            `${scrapedSignals.resources.links} navigable links for user journeys`,
          ],
          cons: [
            ...(scrapedSignals.images.missingAlt > 0
              ? [`${scrapedSignals.images.missingAlt} images lack alt attributes for screen readers.`]
              : []),
          ],
        },
        contentQuality: {
          id: "content",
          title: "Content Quality & Media",
          score: contentScore,
          status: getPillarStatus(contentScore),
          summary: "Relevance, textual depth, and media richness.",
          subItems: [
            {
              name: "Text Depth & Substance",
              score: wordCount > 300 ? 90 : 60,
              status: wordCount > 300 ? "Passed" : "Warning",
              detail: `~${wordCount} words detected across main page`,
            },
            {
              name: "Media Integration",
              score: totalImages > 3 ? 90 : 70,
              status: totalImages > 3 ? "Passed" : "Warning",
              detail: `${totalImages} images and visual elements`,
            },
          ],
          pros: [
            `Comprehensive textual coverage with ~${wordCount} words`,
            "Clean content segmentation with headings",
          ],
          cons: [
            ...(wordCount < 150 ? ["Thin content risk: Add more depth and audience value proposition."] : []),
          ],
        },
        conversion: {
          id: "cro",
          title: "Conversion & Business Impact (CRO)",
          score: croScore,
          status: getPillarStatus(croScore),
          summary: "Call-to-Action clarity, lead capture, and bounce rate friction.",
          subItems: [
            {
              name: "Call-to-Action (CTA) Presence",
              score: buttonsCount > 0 ? 90 : 40,
              status: buttonsCount > 0 ? "Passed" : "Failed",
              detail: `${buttonsCount} interactive CTA buttons or anchor buttons`,
            },
            {
              name: "Lead Capture Mechanisms",
              score: scrapedSignals.hasFormsOrInputs ? 90 : 50,
              status: scrapedSignals.hasFormsOrInputs ? "Passed" : "Warning",
              detail: scrapedSignals.hasFormsOrInputs ? "Form or input field detected" : "No direct signup form found",
            },
          ],
          pros: [
            `${buttonsCount} prominent interaction triggers guiding visitors`,
          ],
          cons: [
            ...(!scrapedSignals.hasFormsOrInputs ? ["Add an inline email or demo capture form to lower bounce rate."] : []),
          ],
        },
        trustAndCredibility: {
          id: "trust",
          title: "Trust & Credibility",
          score: trustScore,
          status: getPillarStatus(trustScore),
          summary: "Transparency, privacy policy, terms, and security indicators.",
          subItems: [
            {
              name: "Legal Compliance (Privacy & Terms)",
              score: scrapedSignals.hasPrivacyPolicy && scrapedSignals.hasTermsOfService ? 95 : 55,
              status: scrapedSignals.hasPrivacyPolicy ? "Passed" : "Warning",
              detail: `Privacy Policy: ${scrapedSignals.hasPrivacyPolicy ? "Found" : "Missing"} | Terms: ${scrapedSignals.hasTermsOfService ? "Found" : "Missing"}`,
            },
            {
              name: "Contact & Identity Transparency",
              score: scrapedSignals.hasContactOrAbout ? 95 : 50,
              status: scrapedSignals.hasContactOrAbout ? "Passed" : "Warning",
              detail: scrapedSignals.hasContactOrAbout ? "Contact or About page linked" : "Missing direct contact links",
            },
          ],
          pros: [
            scrapedSignals.ssl ? "SSL certificate builds trust with browser lock" : "Basic web server headers active",
            scrapedSignals.hasPrivacyPolicy ? "Privacy Policy link provided" : "Navigational structure intact",
          ],
          cons: [
            ...(!scrapedSignals.hasPrivacyPolicy ? ["Missing Privacy Policy link in footer."] : []),
            ...(!scrapedSignals.hasContactOrAbout ? ["Provide clear contact details or About page to enhance credibility."] : []),
          ],
        },
        analyticsAndEngagement: {
          id: "analytics",
          title: "Analytics & Engagement Signals",
          score: analyticsScore,
          status: getPillarStatus(analyticsScore),
          summary: "Social sharing virality and user engagement retention.",
          subItems: [
            {
              name: "OpenGraph Social Cards",
              score: ogImage ? 95 : 40,
              status: ogImage ? "Passed" : "Warning",
              detail: ogImage ? "og:image configured for rich cards" : "Missing og:image tag",
            },
            {
              name: "Twitter / X Card Tags",
              score: twitterCard ? 90 : 50,
              status: twitterCard ? "Passed" : "Warning",
              detail: twitterCard ? `Card type: ${twitterCard}` : "Missing twitter:card meta tag",
            },
          ],
          pros: [
            ogTitle ? "Social title tags present" : "Valid URL routing",
          ],
          cons: [
            ...(!ogImage ? ["Add high-resolution (1200x630) og:image for rich previews on social feeds."] : []),
          ],
        },
      },
      actionItems: [
        ...(!scrapedSignals.hasSchemaJsonLd
          ? [
              {
                id: "act-geo",
                priority: "CRITICAL" as const,
                category: "SEO & AEO" as const,
                title: "Implement Schema.org JSON-LD (AEO & GEO Optimization)",
                description:
                  "Search engines and AI agents (ChatGPT Search, Perplexity, Google AI Overviews) rely on structured JSON-LD data to cite your website as an authoritative source.",
                estimatedEffort: "Quick (< 15 mins)" as const,
                impact: "Unlocks Generative Engine Optimization (GEO) citations and rich SERP snippets.",
              },
            ]
          : []),
        ...(scrapedSignals.images.missingAlt > 0
          ? [
              {
                id: "act-alt",
                priority: "HIGH" as const,
                category: "UX & Design" as const,
                title: "Fix Missing Image Alt Text (WCAG Compliance)",
                description: `${scrapedSignals.images.missingAlt} image(s) lack alternative text attributes, violating WCAG 2.1 Level A accessibility.`,
                estimatedEffort: "Quick (< 15 mins)" as const,
                impact: "Improves screen reader accessibility and Google Image SEO rankings.",
              },
            ]
          : []),
        ...(!scrapedSignals.ogImage
          ? [
              {
                id: "act-og",
                priority: "MEDIUM" as const,
                category: "Analytics" as const,
                title: "Add OpenGraph Social Share Image (og:image)",
                description: "Without an og:image tag, links shared on X, LinkedIn, Slack, and Discord render as plain text without preview visuals.",
                estimatedEffort: "Quick (< 15 mins)" as const,
                impact: "Increases social click-through rate by up to 40%.",
              },
            ]
          : []),
        ...(!scrapedSignals.hasPrivacyPolicy
          ? [
              {
                id: "act-privacy",
                priority: "HIGH" as const,
                category: "Trust & Security" as const,
                title: "Add Privacy Policy and Terms of Service",
                description: "Essential for GDPR, CCPA, consumer trust, and Google Ad/Search compliance.",
                estimatedEffort: "Moderate (1-2 hrs)" as const,
                impact: "Mitigates legal compliance risks and protects brand authority.",
              },
            ]
          : []),
        {
          id: "act-cro",
          priority: "MEDIUM" as const,
          category: "Conversion (CRO)" as const,
          title: "Strengthen Above-the-Fold Call-to-Action (CTA)",
          description: "Ensure high color contrast on primary buttons and provide frictionless micro-conversion steps (e.g. 1-click demo or newsletter).",
          estimatedEffort: "Quick (< 15 mins)" as const,
          impact: "Reduces bounce rate and elevates visitor-to-lead conversion rates.",
        },
      ],
      topStrengths: [
        scrapedSignals.ssl ? "Strong HTTPS/TLS transport encryption" : "Domain resolved successfully",
        scrapedSignals.mobileResponsive ? "Mobile-first device-width scaling configured" : "Semantic DOM hierarchy present",
        `Fast initial server response: ${responseTimeMs}ms TTFB`,
        scrapedSignals.headings.h1.length === 1 ? "Proper single H1 topic structure" : "Navigable link structure",
      ],
      quickWins: [
        "Embed JSON-LD Schema for Generative AI search engines (Perplexity/ChatGPT)",
        "Review OpenGraph preview image (1200x630) for viral sharing",
        "Audit image alt tags for full WCAG accessibility compliance",
      ],
    };

    return NextResponse.json(fallbackReport);
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze website." }, { status: 500 });
  }
}
