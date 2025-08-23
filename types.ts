export interface Platform {
    name: string;
    wordCount: number | null;
    charCount: number | null;
}

export interface UserProfile {
    style: string;
    tone: string;
    audience: string;
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

export interface ArticleContent {
    title: string;
    content: string;
    hashtags: string[];
    links: ArticleLink[];
    visualPrompts: VisualPrompt[];
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