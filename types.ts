export interface Platform {
    name: string;
    wordCount: number | null;
    charCount: number | null;
}

export interface UserProfile {
    style: string;
    tone: string;
    audience: string;
    language: string;
}

export interface ResearchData {
    history: string;
    facts: string[];
    misconceptions: string[];
    sources?: { uri: string; title: string; }[];
}

export interface ArticleLink {
    text: string;
    url: string;
}

export interface VisualPrompt {
    placeholder: string;
    type: string;
    prompt: string;
}

export interface SEOChecklistItem {
    check: string;
    status: 'Pass' | 'Needs Improvement' | 'Fail';
    recommendation: string;
}

export interface SEOAnalysis {
    score: number;
    metaDescription: string;
    relatedKeywords: string[];
    readability: {
        level: string;
        notes: string;
    };
    checklist: SEOChecklistItem[];
}

export interface ArticleContent {
    title: string;
    content: string;
    hashtags: string[];
    links: ArticleLink[];
    visualPrompts: VisualPrompt[];
    seoAnalysis?: SEOAnalysis;
    sources?: { uri: string; title: string; }[];
    seoKeywordUsed?: string;
}

export interface Article extends ArticleContent {
    id: string;
    imageUrls: string[];
    platformName: string;
    topic: string;
}

export interface GenerationStep {
    title: string;
    status: 'pending' | 'in-progress' | 'complete' | 'error';
}

export interface TopicIdea {
    title: string;
    angle: string;
    keywords: string[];
}

export interface KeywordSuggestion {
    keyword: string;
    type: 'Primary' | 'Secondary';
    intent: string;
}

// Type for the non-streamed part of the article
export type ArticlePlan = Omit<ArticleContent, 'content'>;

export type RepurposePlatform = 'X (Twitter) Thread' | 'LinkedIn Post' | 'Instagram Caption';