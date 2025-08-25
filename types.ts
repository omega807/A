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

export interface SEOAnalysis {
    metaDescription: string;
    relatedKeywords: string[];
    checklist: {
        titleContainsKeyword: boolean;
        metaDescriptionContainsKeyword: boolean;
        headingsContainKeyword: boolean;
        contentContainsKeyword: boolean;
    };
}

export interface ArticleContent {
    title: string;
    content: string;
    hashtags: string[];
    links: ArticleLink[];
    visualPrompts: VisualPrompt[];
    seoAnalysis?: SEOAnalysis;
}

export interface Article extends ArticleContent {
    id: string;
    imageUrls: string[];
    platformName: string;
    topic: string;
    seoKeywordUsed?: string;
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