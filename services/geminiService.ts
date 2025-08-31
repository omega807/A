import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Platform, UserProfile, ResearchData, ArticleContent, TopicIdea, KeywordSuggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findKeywords = async (topic: string): Promise<KeywordSuggestion[]> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert SEO strategist. For the topic "${topic}", generate a list of 5-7 keyword suggestions.
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

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as KeywordSuggestion[];
    } catch (e) {
        console.error("Failed to parse keywords:", e);
        throw new Error("Failed to get valid keywords from AI.");
    }
};

export const exploreTopicIdeas = async (topic: string): Promise<TopicIdea[]> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert content strategist and SEO specialist. Brainstorm 5 creative and engaging article ideas based on the broad topic: "${topic}". For each idea, provide a catchy, SEO-friendly title, a unique angle or synopsis, and a list of 3-5 relevant keywords.`,
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

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TopicIdea[];
    } catch (e) {
        console.error("Failed to parse topic ideas:", e);
        console.error("Raw response:", response.text);
        throw new Error("Failed to get valid topic ideas from AI.");
    }
};


export const researchTopic = async (topic: string): Promise<ResearchData> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Research the topic: "${topic}". Provide a detailed breakdown covering its history, quirky and little-known facts, and common misconceptions or urban myths.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    history: { type: Type.STRING, description: "A summary of the topic's history." },
                    facts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of quirky or little-known facts." },
                    misconceptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of common misconceptions or urban myths." },
                },
                required: ["history", "facts", "misconceptions"],
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ResearchData;
    } catch (e) {
        console.error("Failed to parse research data:", e);
        console.error("Raw response:", response.text);
        throw new Error("Failed to get valid research data from AI.");
    }
};

export const writeArticle = async (
    topic: string, 
    platform: Platform, 
    researchData: ResearchData, 
    userProfile: UserProfile,
    manualCount?: { min: string; max: string; type: 'words' | 'chars' },
    regenerateLayout?: boolean,
    seoKeyword?: string
): Promise<ArticleContent> => {
    
    let platformConstraints: string;

    if (manualCount && (manualCount.min.trim() || manualCount.max.trim())) {
        platformConstraints = `- Platform: ${platform.name} (with custom length)`;
        const min = parseInt(manualCount.min, 10);
        const max = parseInt(manualCount.max, 10);
        const type = manualCount.type;
        const typeLabel = type === 'words' ? 'Word' : 'Character';

        if (min > 0 && max > 0 && min <= max) {
            platformConstraints += `\n- ${typeLabel} Count: Between ${min} and ${max}.`;
        } else if (max > 0) {
            platformConstraints += `\n- Maximum ${typeLabel} Count: ${max}.`;
        } else if (min > 0) {
            platformConstraints += `\n- Minimum ${typeLabel} Count: ${min}.`;
        }
    } else {
        platformConstraints = `
- Platform: ${platform.name}
${platform.wordCount ? `- Word Count Limit: Approximately ${platform.wordCount} words` : ''}
${platform.charCount ? `- Character Count Limit: ${platform.charCount} characters` : ''}
    `;
    }


    const prompt = `
        You are an expert blog post writer and SEO strategist, thinking like the creative director of a modern online magazine (like Wired or The Verge). Your goal is to create highly readable, engaging, and visually dynamic content.

        **Topic:** "${topic}"

        **Platform Constraints:**
        ${platformConstraints}

        **Author Profile:**
        - Writing Style: ${userProfile.style}
        - Tone of Voice: ${userProfile.tone}
        - Language / Dialect: ${userProfile.language}
        - Target Audience: ${userProfile.audience}

        **Research Material (JSON):**
        ${JSON.stringify(researchData, null, 2)}
        
        ${seoKeyword ? `
        ---

        **SEO OPTIMIZATION STRATEGY (CRITICAL):**

        The user has provided a target SEO keyword: "${seoKeyword}". You MUST perform a deep SEO analysis and optimize the article for this keyword.

        1.  **Analyze and Optimize:**
            -   **Title:** The main \`title\` MUST include the exact keyword.
            -   **Meta Description:** Generate a compelling, clickable meta description (120-155 characters) including the keyword.
            -   **Keyword Placement:** Ensure the keyword appears naturally in at least one \`<h2>\` heading and within the first 150 words of the article. Integrate it a few more times throughout the body content, but avoid keyword stuffing.
            -   **Related Keywords:** Generate a list of 3-5 semantically related keywords (LSI keywords) that support the main keyword and include some in the content.
            -   **Readability:** Analyze the generated text. Aim for a reading level around 8th-10th grade. Provide a one-sentence note on the readability.

        2.  **Generate SEO Analysis Object:** Based on your optimization, create the \`seoAnalysis\` object.
            -   **Score:** Provide an overall SEO score from 0-100 based on how well you were able to implement these optimizations.
            -   **Checklist with Recommendations:** For each item in the checklist, provide a status ('Pass', 'Needs Improvement', 'Fail') and a specific, ACTIONABLE recommendation. If the status is 'Pass', the recommendation should be a brief confirmation.
                -   *Example Fail:* { "check": "Keyword in Title", "status": "Fail", "recommendation": "The title does not contain the keyword. Consider changing it to 'The Benefits of ${seoKeyword} for Beginners'." }
                -   *Example Pass:* { "check": "Keyword in Title", "status": "Pass", "recommendation": "The title successfully includes the target keyword." }
        ---
        ` : ''}

        ---

        **VISUAL ELEMENT STRATEGY (CRITICAL):**

        As a visual director, you MUST enhance this article with visual elements to maximize engagement. For each visual you decide to include, you must:
        1.  Create a unique placeholder ID in the format \`[IMAGE_X]\` (e.g., \`[IMAGE_1]\`, \`[IMAGE_2]\`).
        2.  Generate a complete \`<img>\` tag within the article \`content\` where the visual should appear. The \`src\` attribute of this tag MUST be the placeholder ID (e.g., \`<img src="[IMAGE_1]" class="img-float-left">\`).
        3.  Add a corresponding object to the \`visualPrompts\` array in the final JSON output.
        - For long-form platforms (Generic Blog Post, Medium, etc.), generate **2-4 visuals**. For shorter platforms (X, Instagram), generate **exactly 1**.
        - The visuals should be a mix of: Photorealistic Images, Infographics, or Charts.

        ---

        **CREATIVE LAYOUT BLUEPRINT (Follow this strictly):**

        ${regenerateLayout ? `**Layout Regeneration Request:** The user wants a new layout. You MUST generate a significantly different and creative layout. Use a completely different combination and order of the available layout elements. Be bold and creative.` : ''}

        1.  **Compelling Hook (Introduction):**
            - Start with a short, powerful opening paragraph (1-3 sentences) to grab the reader's attention.

        2.  **Main Body (Varied & Scannable):**
            - Break content into logical sections using \`<h2>\` and \`<h3>\` headings.
            - **CRITICAL: Keep paragraphs very short (2-4 sentences max). Each paragraph MUST be enclosed in its own \`<p>\` tag. Do NOT use \`<br>\` to create space.**
            - Use \`<strong>\` to bold key terms for emphasis.
            - **Layout Variety Requirement:** You MUST strategically intersperse at least FOUR different types of the following layout elements. At least ONE must be a two-column section and at least ONE must be a floating image.
                - **A) Pull Quote:** Use \`<blockquote class="pull-quote"><p>Impactful sentence from the text.</p></blockquote>\`.
                - **B) Informational Box:** Use a standard \`<blockquote>\` for a "Did You Know?", "Pro Tip", etc.
                - **C) List:** Use \`<ol>\` or \`<ul>\`.
                - **D) Two-Column Section:** Use \`<div class="two-col-container"><div><p>Column 1 content...</p></div><div><p>Column 2 content...</p></div></div>\`. This is great for comparisons.
                - **E) Floating Image:** Generate an \`<img>\` tag with class \`img-float-left\` or \`img-float-right\`. Place this tag at the *beginning* of a paragraph. The text in that paragraph will wrap around it.
                - **F) Mini Q&A:** Use an \`<h3>\` for a question and a \`<p>\` for the answer.

        3.  **Key Takeaways (Summary Box):**
            - Towards the end, create a summary section inside a standard \`<blockquote>\` with a heading like "Key Takeaways". Use a \`<ul>\` inside.

        4.  **Conclusion & Engagement:**
            - Write a brief concluding paragraph. End by asking an open-ended question.

        5.  **Clearfix Usage:** After content that uses floating images, you can add \`<div class="clearfix"></div>\` on its own line if needed to prevent subsequent content from wrapping incorrectly. Use this sparingly.

        ---

        **CONTENT REQUIREMENTS:**

        - The final content MUST be a single string of HTML. Do not include \`<html>\` or \`<body>\` tags.
        - Adhere strictly to word/character count limits.
        - Provide 2-4 relevant hashtags.
        - Suggest 2-3 relevant external links (use placeholder URLs).
        - Generate the required \`visualPrompts\` array and place their corresponding \`<img>\` tags (with placeholder src) in the content.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A catchy title for the article." },
            content: { type: Type.STRING, description: "The main body of the article, formatted as a single HTML string. It must include the complete <img> tags for all visuals, using [IMAGE_X] placeholders for their src attributes." },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of hashtag strings (e.g., ['#topic', '#funfacts'])." },
            links: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: {
                        text: { type: Type.STRING },
                        url: { type: Type.STRING }
                    },
                    required: ["text", "url"]
                }, 
                description: "An array of link objects."
            },
            visualPrompts: {
                type: Type.ARRAY,
                description: "An array of prompts for generating visual elements.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        placeholder: { type: Type.STRING, description: "The placeholder ID used in the content, e.g., '[IMAGE_1]'." },
                        type: { type: Type.STRING, description: "Type of visual, e.g., 'Photorealistic Image', 'Infographic'."},
                        prompt: { type: Type.STRING, description: "A detailed DALL-E style prompt for the visual." }
                    },
                    required: ["placeholder", "type", "prompt"]
                }
            },
            ...(seoKeyword && {
                seoAnalysis: {
                    type: Type.OBJECT,
                    description: "An analysis of the article's SEO optimization for the target keyword.",
                    properties: {
                        score: { type: Type.NUMBER, description: "An overall SEO score from 0 to 100." },
                        metaDescription: { type: Type.STRING, description: "A compelling meta description (120-155 chars) including the keyword." },
                        relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 related LSI keywords." },
                        readability: {
                            type: Type.OBJECT,
                            properties: {
                                level: { type: Type.STRING, description: "e.g., 'Grade 9'" },
                                notes: { type: Type.STRING, description: "A brief note on the content's readability." }
                            },
                            required: ["level", "notes"]
                        },
                        checklist: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    check: { type: Type.STRING },
                                    status: { type: Type.STRING, description: "'Pass', 'Needs Improvement', or 'Fail'" },
                                    recommendation: { type: Type.STRING, description: "A specific, actionable recommendation." }
                                },
                                required: ["check", "status", "recommendation"]
                            }
                        }
                    },
                    required: ["score", "metaDescription", "relatedKeywords", "readability", "checklist"]
                }
            })
        },
        required: ["title", "content", "hashtags", "links", "visualPrompts"]
    };


    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });

    try {
        const jsonText = response.text.trim();
        const parsedArticle = JSON.parse(jsonText);
        // Ensure links are properly formatted
        if (!Array.isArray(parsedArticle.links) || !parsedArticle.links.every((l: any) => typeof l === 'object' && 'text' in l && 'url' in l)) {
            parsedArticle.links = [{ text: 'More Info', url: 'https://example.com' }];
        }
        return parsedArticle as ArticleContent;
    } catch (e) {
        console.error("Failed to parse article content:", e);
        console.error("Raw response:", response.text);
        throw new Error("Failed to get valid article content from AI.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    // Add context to the prompt for better results
    const fullPrompt = `High-resolution, cinematic lighting, professional photography of: ${prompt}. If the prompt describes a chart or infographic, create a clean, modern, and visually appealing representation of it.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    throw new Error("Image generation failed or returned no images.");
};