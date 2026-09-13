export interface PillarSubItem {
  name: string;
  score: number; // 0-100
  status: "Passed" | "Warning" | "Failed";
  detail: string;
}

export interface ComprehensivePillar {
  id: string;
  title: string;
  score: number; // 0-100
  status: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  summary: string;
  subItems: PillarSubItem[];
  pros: string[];
  cons: string[];
}

export interface ActionItem {
  id: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "Performance"
    | "SEO & AEO"
    | "UX & Design"
    | "Content"
    | "Conversion (CRO)"
    | "Trust & Security"
    | "Analytics";
  title: string;
  description: string;
  estimatedEffort: "Quick (< 15 mins)" | "Moderate (1-2 hrs)" | "In-depth (Half day)";
  impact: string;
}

export interface ScrapedSignals {
  url: string;
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  viewportMeta: string;
  hasSchemaJsonLd: boolean;
  hasSitemapLink: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  hasContactOrAbout: boolean;
  hasFormsOrInputs: boolean;
  headings: {
    h1: string[];
    h2Count: number;
    h3Count: number;
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
  };
  resources: {
    scripts: number;
    stylesheets: number;
    links: number;
    buttons: number;
  };
  textStats: {
    charCount: number;
    wordCount: number;
  };
  mobileResponsive: boolean;
  ssl: boolean;
  responseTimeMs: number;
}

export interface WebsiteAuditReport {
  url: string;
  analyzedAt: string;
  overallScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  usedAiModel: string;
  scrapedSignals: ScrapedSignals;
  pillars: {
    performance: ComprehensivePillar;
    seoAndAeo: ComprehensivePillar;
    uxAndDesign: ComprehensivePillar;
    contentQuality: ComprehensivePillar;
    conversion: ComprehensivePillar;
    trustAndCredibility: ComprehensivePillar;
    analyticsAndEngagement: ComprehensivePillar;
  };
  actionItems: ActionItem[];
  topStrengths: string[];
  quickWins: string[];
}
