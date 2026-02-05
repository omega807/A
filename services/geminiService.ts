
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Platform, UserProfile, ResearchData, ArticleContent, TopicIdea, KeywordSuggestion, ArticlePlan, RepurposePlatform } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BRITISH_SPELLING_INSTRUCTION = "CRITICAL: You MUST use British English spelling throughout (e.g., use 's' instead of 'z' in words like 'optimise', 'analysing', 'organise', 'synthesising'). Do not use American English conventions.";

/**
 * Robust error parser to extract human-readable messages from API errors.
 */
const parseApiError = (error: any): string => {
    console.error("Stratis System - API Error Logged:", error);
    
    let message = "";
    
    // Try to extract message from common SDK error structures
    if (typeof error === 'string') {
        message = error;
    } else if (error?.error?.message) {
        message = error.error.message;
    } else if (error?.message) {
        message = error.message;
    } else {
        try {
            // Attempt to handle cases where the error is a stringified JSON
            const stringified = JSON.stringify(error);
            const parsed = JSON.parse(stringified);
            message = parsed?.error?.message || parsed?.message || stringified;
        } catch (e) {
            message = String(error);
        }
    }

    const lowerMessage = message.toLowerCase();
    
    // Specific check for Quota / Rate Limit (429)
    if (lowerMessage.includes("429") || 
        lowerMessage.includes("quota") || 
        lowerMessage.includes("exhausted") || 
        lowerMessage.includes("rate_limit") ||
        lowerMessage.includes("resource_exhausted")) {
        return "Stratis Synthesis Limit Reached: Your current API quota has been exceeded. Please check your billing status at ai.google.dev/gemini-api/docs/billing or wait for the cooldown period to expire.";
    }

    // Specific check for Overload (503)
    if (lowerMessage.includes("503") || lowerMessage.includes("overloaded") || lowerMessage.includes("unavailable")) {
        return "The synthesis engine is momentarily overloaded. We are attempting to re-establish a stable connection.";
    }

    // Auth Errors
    if (lowerMessage.includes("api_key") || lowerMessage.includes("invalid") || lowerMessage.includes("unauthorized")) {
        return "Access denied. Please verify your system credentials or API key configuration.";
    }

    // If it's still a JSON string, try one last time to clean it
    if (message.startsWith('{') && message.endsWith('}')) {
        try {
            const finalClean = JSON.parse(message);
            if (finalClean?.error?.message) return finalClean.error.message;
        } catch(e) {}
    }

    return message || "An unexpected variance occurred during synthesis. Our systems are investigating the discrepancy.";
};

/**
 * Exponential backoff logic for retrying transient API errors.
 */
const callGeminiWithRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            let msg = "";
            if (typeof error === 'string') msg = error;
            else if (error?.message) msg = error.message;
            else if (error?.error?.message) msg = error.error.message;
            else msg = JSON.stringify(error);

            const lowerMsg = msg.toLowerCase();
            
            // Determine if the error is transient and worth retrying
            const isTransient = lowerMsg.includes("429") || 
                               lowerMsg.includes("503") || 
                               lowerMsg.includes("quota") || 
                               lowerMsg.includes("exhausted") || 
                               lowerMsg.includes("deadline") ||
                               lowerMsg.includes("network") ||
                               lowerMsg.includes("resource_exhausted");

            if (isTransient && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
                console.warn(`Stratis Resilience: Transient error detected. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw new Error(parseApiError(error));
        }
    }
    throw new Error(parseApiError(lastError));
};

export const findKeywords = async (topic: string): Promise<KeywordSuggestion[]> => {
    return callGeminiWithRetry(async () => {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an expert SEO strategist. For the topic "${topic}", generate a list of 5-7 keyword suggestions.
            ${BRITISH_SPELLING_INSTRUCTION}
            - Include 2-3 "Primary" keywords that are broad and have high traffic potential.
            - Include 3-4 "Secondary" (long-tail) keywords that are more specific.
            - For each keyword, determine the likely user "intent" (e.g., Informational, Commercial, Navigational).
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            keyword: { type: Type.STRING },
                            type: { type: Type.STRING, description: "'Primary' or 'Secondary'" },
                            intent: { type: Type.STRING, description: "The likely user search intent." }
                        },
                        required: ["keyword", "type", "intent"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as KeywordSuggestion[];
    });
};

export const exploreTopicIdeas = async (topic: string): Promise<TopicIdea[]> => {
    return callGeminiWithRetry(async () => {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an expert content strategist and SEO specialist. Brainstorm 5 creative and engaging article ideas based on the broad topic: "${topic}". 
            ${BRITISH_SPELLING_INSTRUCTION}
            For each idea, provide a catchy, SEO-friendly title, a unique angle or synopsis, and a list of 3-5 relevant keywords.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "A catchy, SEO-friendly title for the article." },
                            angle: { type: Type.STRING, description: "A short (1-2 sentence) description of the unique angle or focus of the article." },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 relevant SEO keywords." },
                        },
                        required: ["title", "angle", "keywords"],
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TopicIdea[];
    });
};

export const researchTopic = async (topic: string): Promise<ResearchData> => {
    return callGeminiWithRetry(async () => {
        const researchSchema = {
            type: Type.OBJECT,
            properties: {
                history: { type: Type.STRING, description: "A summary of the topic's history." },
                facts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of quirky or little-known facts." },
                misconceptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of common misconceptions or urban myths." },
            },
            required: ["history", "facts", "misconceptions"],
        };

        const prompt = `Your task is to research the topic: "${topic}". Use Google Search to find up-to-date, factual information.
        ${BRITISH_SPELLING_INSTRUCTION}
        Provide a detailed breakdown covering its history, quirky and little-known facts, and common misconceptions or urban myths.
        
        Your final output MUST be a single, valid JSON object that adheres to the following schema.
        Schema:
        ${JSON.stringify(researchSchema, null, 2)}
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map(chunk => chunk.web && { uri: chunk.web.uri, title: chunk.web.title })
            .filter((source): source is { uri: string; title: string } => !!source)
            .reduce((acc, current) => {
                if (!acc.find(item => item.uri === current.uri)) {
                    acc.push(current);
                }
                return acc;
            }, [] as { uri: string; title: string }[]);

        const text = response.text.trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("No JSON object found in the AI response.");
        }
        const jsonText = text.substring(jsonStart, jsonEnd + 1);
        const parsedData = JSON.parse(jsonText);
        return { ...parsedData, sources: sources || [] };
    });
};

const getPlatformConstraints = (
    platform: Platform,
    manualCount?: { min: string; max: string; type: 'words' | 'chars' }
): string => {
    if (manualCount && (manualCount.min.trim() || manualCount.max.trim())) {
        let constraints = `- Platform: ${platform.name} (with custom length)`;
        const min = parseInt(manualCount.min, 10);
        const max = parseInt(manualCount.max, 10);
        const type = manualCount.type;
        const typeLabel = type === 'words' ? 'Word' : 'Character';

        if (min > 0 && max > 0 && min <= max) {
            constraints += `\n- ${typeLabel} Count: Between ${min} and ${max}.`;
        } else if (max > 0) {
            constraints += `\n- Maximum ${typeLabel} Count: ${max}.`;
        } else if (min > 0) {
            constraints += `\n- Minimum ${typeLabel} Count: ${min}.`;
        }
        return constraints;
    }
    return `
- Platform: ${platform.name}
${platform.wordCount ? `- Word Count Limit: Approximately ${platform.wordCount} words` : ''}
${platform.charCount ? `- Character Count Limit: ${platform.charCount} characters` : ''}
    `;
};

export const generateArticlePlan = async (
    topic: string, 
    platform: Platform, 
    researchData: ResearchData, 
    userProfile: UserProfile,
    manualCount?: { min: string; max: string; type: 'words' | 'chars' },
    seoKeyword?: string
): Promise<ArticlePlan> => {
    return callGeminiWithRetry(async () => {
        const platformConstraints = getPlatformConstraints(platform, manualCount);
        const prompt = `
            You are an expert blog post writer and SEO strategist. Create a detailed plan for an article.
            ${BRITISH_SPELLING_INSTRUCTION}
            Topic: "${topic}"
            Platform Constraints: ${platformConstraints}
            Author Profile: ${JSON.stringify(userProfile)}
            ${seoKeyword ? `Target Keyword: "${seoKeyword}"` : ''}

            OUTPUT REQUIREMENTS:
            - Provide title, hashtags, links, and visualPrompts.
            - If seoKeyword is present, provide a full seoAnalysis object.
        `;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                links: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { text: { type: Type.STRING }, url: { type: Type.STRING } },
                        required: ["text", "url"]
                    }
                },
                visualPrompts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            placeholder: { type: Type.STRING },
                            type: { type: Type.STRING },
                            prompt: { type: Type.STRING }
                        },
                        required: ["placeholder", "type", "prompt"]
                    }
                },
                seoAnalysis: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        metaDescription: { type: Type.STRING },
                        relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        readability: {
                            type: Type.OBJECT,
                            properties: { level: { type: Type.STRING }, notes: { type: Type.STRING } },
                            required: ["level", "notes"]
                        },
                        checklist: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    check: { type: Type.STRING },
                                    status: { type: Type.STRING },
                                    recommendation: { type: Type.STRING }
                                },
                                required: ["check", "status", "recommendation"]
                            }
                        }
                    }
                }
            },
            required: ["title", "hashtags", "links", "visualPrompts"]
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedPlan = JSON.parse(jsonText);
        parsedPlan.sources = researchData.sources;
        if (seoKeyword) parsedPlan.seoKeywordUsed = seoKeyword;
        return parsedPlan as ArticlePlan;
    });
};

export async function* streamArticleContent(
    plan: ArticlePlan,
    platform: Platform,
    researchData: ResearchData,
    userProfile: UserProfile,
    manualCount?: { min: string; max: string; type: 'words' | 'chars' },
    regenerateLayout?: boolean
): AsyncGenerator<string> {
    const platformConstraints = getPlatformConstraints(platform, manualCount);
    const prompt = `
        Write the main HTML content for an article.
        ${BRITISH_SPELLING_INSTRUCTION}
        Plan: ${JSON.stringify(plan)}
        Platform: ${platformConstraints}
        Profile: ${JSON.stringify(userProfile)}
        Research: ${JSON.stringify(researchData)}
        ${regenerateLayout ? `REGENERATE LAYOUT: Create a completely new layout structure.` : ''}

        RULES:
        - Output raw HTML ONLY. No tags like <html>, <head> or <body>.
        - Use <p> tags for every paragraph.
        - Use <h2>/<h3> for headings.
        - Strategic use of <blockquote class="pull-quote">, lists, and two-column divs (<div class="two-col-container">).
        - Place placeholders for images exactly where appropriate using <img src="[ID]" class="img-float-left" /> style tags.
    `;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    for await (const chunk of responseStream) {
        yield chunk.text;
    }
}

export const generateImage = async (prompt: string): Promise<string> => {
    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `High-end editorial photography, cinematic lighting, 8k: ${prompt}`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        throw new Error("Image generation failed.");
    });
};

export const repurposeContent = async (articleTitle: string, articleContent: string, platform: RepurposePlatform): Promise<string> => {
    return callGeminiWithRetry(async () => {
        const prompt = `You are a social media growth expert. Repurpose the following article for ${platform}.
        ${BRITISH_SPELLING_INSTRUCTION}
        
        Article Title: "${articleTitle}"
        Article Content (HTML): ${articleContent}
        
        GUIDELINES:
        - For "X (Twitter) Thread": Create a compelling 5-7 tweet thread. Start with a hook. Use numbered tweets (1/n).
        - For "LinkedIn Post": Create a professional, insightful post with bullet points and a clear call to action. Focus on industry authority.
        - For "Instagram Caption": Create a vibrant, engaging caption with line breaks for readability. Include relevant emojis and a block of 5-10 trending hashtags at the end.
        
        Output the raw text of the post only. Do not include meta-commentary.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text;
    });
};
