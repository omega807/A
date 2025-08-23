import { Platform, UserProfile } from './types';

export const PLATFORMS: Platform[] = [
    { name: 'Generic Blog Post', wordCount: 1000, charCount: null },
    { name: 'LinkedIn Article', wordCount: 700, charCount: null },
    { name: 'Medium Story', wordCount: 1500, charCount: null },
    { name: 'X (Twitter) Thread', wordCount: null, charCount: 280 },
    { name: 'Facebook Post', wordCount: 500, charCount: 63206 },
    { name: 'Instagram Caption', wordCount: 300, charCount: 2200 },
    { name: 'Substack Newsletter', wordCount: 2000, charCount: null },
    { name: 'Reddit Post', wordCount: 1000, charCount: 40000 },
    { name: 'Dev.to Article', wordCount: 1200, charCount: null },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
    style: 'Informative and engaging',
    tone: 'Professional yet approachable',
    audience: 'General audience with an interest in technology',
};