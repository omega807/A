import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile as UserProfileType, Platform, Article, ArticleContent, GenerationStep, ResearchData } from './types';
import { PLATFORMS, DEFAULT_USER_PROFILE } from './constants';
import { researchTopic, writeArticle, generateImage } from './services/geminiService';
import UserProfile from './components/UserProfile';
import ArticleDisplay from './components/ArticleDisplay';
import SavedArticlesDrawer from './components/SavedArticlesDrawer';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [platform, setPlatform] = useState<Platform>(PLATFORMS[0]);
    const [userProfile, setUserProfile] = useState<UserProfileType>(DEFAULT_USER_PROFILE);
    const [generatedArticle, setGeneratedArticle] = useState<Article | null>(null);
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRegeneratingLayout, setIsRegeneratingLayout] = useState<boolean>(false);
    const [lastResearchData, setLastResearchData] = useState<ResearchData | null>(null);
    const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    
    // State for custom length controls
    const [isManualCount, setIsManualCount] = useState<boolean>(false);
    const [minCount, setMinCount] = useState<string>('');
    const [maxCount, setMaxCount] = useState<string>('');
    const [countType, setCountType] = useState<'words' | 'chars'>('words');


    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                setUserProfile(JSON.parse(savedProfile));
            }
            const articlesFromStorage = localStorage.getItem('savedArticles');
            if (articlesFromStorage) {
                setSavedArticles(JSON.parse(articlesFromStorage));
            }
        } catch (e) {
            console.error("Failed to parse from localStorage", e);
        }
    }, []);

    const handleProfileChange = useCallback((newProfile: UserProfileType) => {
        setUserProfile(newProfile);
        try {
            localStorage.setItem('userProfile', JSON.stringify(newProfile));
        } catch (e) {
            console.error("Failed to save profile to localStorage", e);
        }
    }, []);

    const updateStepStatus = useCallback((index: number, status: GenerationStep['status']) => {
        setGenerationSteps(prevSteps => {
            const newSteps = [...prevSteps];
            if (newSteps[index]) {
                newSteps[index].status = status;
            }
            return newSteps;
        });
    }, []);

    const handleGenerateArticle = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedArticle(null);

        const initialSteps: GenerationStep[] = [
            { title: 'Researching topic', status: 'pending' },
            { title: 'Writing the article', status: 'pending' },
            { title: 'Generating visuals', status: 'pending' },
            { title: 'Finalizing post', status: 'pending' },
        ];
        setGenerationSteps(initialSteps);

        try {
            updateStepStatus(0, 'in-progress');
            const researchData = await researchTopic(topic);
            setLastResearchData(researchData);
            updateStepStatus(0, 'complete');
            
            updateStepStatus(1, 'in-progress');
            const articleContent: ArticleContent = await writeArticle(
                topic,
                platform,
                researchData,
                userProfile,
                isManualCount ? { min: minCount, max: maxCount, type: countType } : undefined
            );
            updateStepStatus(1, 'complete');
            
            updateStepStatus(2, 'in-progress');
            const imageUrls = await Promise.all(
                articleContent.visualPrompts.map(p => generateImage(p.prompt))
            );
            
            let finalContent = articleContent.content;
            articleContent.visualPrompts.forEach((prompt, index) => {
                const imageUrl = imageUrls[index];
                if(imageUrl) {
                    const placeholderSrc = `src="${prompt.placeholder}"`;
                    const finalImgTagPortion = `src="${imageUrl}" alt="${prompt.prompt.substring(0, 100)}"`;
                    finalContent = finalContent.replace(placeholderSrc, finalImgTagPortion);
                }
            });
            updateStepStatus(2, 'complete');


            updateStepStatus(3, 'in-progress');
            const finalArticle: Article = {
                id: Date.now().toString(),
                ...articleContent,
                content: finalContent,
                imageUrls,
                platformName: platform.name,
                topic: topic,
            };
            setGeneratedArticle(finalArticle);
            updateStepStatus(3, 'complete');

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGenerationSteps(prevSteps => {
                const newSteps = [...prevSteps];
                const errorIndex = newSteps.findIndex(s => s.status === 'in-progress');
                if (errorIndex !== -1) {
                    newSteps[errorIndex].status = 'error';
                }
                return newSteps;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateLayout = async () => {
        if (!generatedArticle || !lastResearchData) return;

        setIsRegeneratingLayout(true);
        setError(null);

        try {
            const articleContent: ArticleContent = await writeArticle(
                generatedArticle.topic,
                platform,
                lastResearchData,
                userProfile,
                isManualCount ? { min: minCount, max: maxCount, type: countType } : undefined,
                true // Set regenerateLayout to true
            );
            
            const imageUrls = await Promise.all(
                articleContent.visualPrompts.map(p => generateImage(p.prompt))
            );
            
            let finalContent = articleContent.content;
            articleContent.visualPrompts.forEach((prompt, index) => {
                const imageUrl = imageUrls[index];
                if(imageUrl) {
                    const placeholderSrc = `src="${prompt.placeholder}"`;
                    const finalImgTagPortion = `src="${imageUrl}" alt="${prompt.prompt.substring(0, 100)}"`;
                    finalContent = finalContent.replace(placeholderSrc, finalImgTagPortion);
                }
            });

            const finalArticle: Article = {
                id: Date.now().toString(), // Give it a new ID
                ...articleContent,
                content: finalContent,
                imageUrls,
                platformName: platform.name,
                topic: generatedArticle.topic,
            };
            setGeneratedArticle(finalArticle);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while regenerating layout.');
        } finally {
            setIsRegeneratingLayout(false);
        }
    };
    
    const handleSaveArticle = (article: Article) => {
        const newSavedArticles = [article, ...savedArticles.filter(a => a.id !== article.id)];
        setSavedArticles(newSavedArticles);
        localStorage.setItem('savedArticles', JSON.stringify(newSavedArticles));
    };

    const handleDeleteArticle = (articleId: string) => {
        const newSavedArticles = savedArticles.filter(a => a.id !== articleId);
        setSavedArticles(newSavedArticles);
        localStorage.setItem('savedArticles', JSON.stringify(newSavedArticles));
    };

    const loadArticle = (article: Article) => {
        setGeneratedArticle(article);
        setIsDrawerOpen(false);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <SparklesIcon className="w-8 h-8 text-blue-400" />
                            <h1 className="text-2xl font-bold tracking-tight text-white">AI Blog Post Writer</h1>
                        </div>
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                        >
                            Saved Articles ({savedArticles.length})
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-8">
                    {/* --- CONTROLS --- */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-white">Create New Article</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
                                <textarea
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., The History of Artificial Intelligence"
                                    className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="platform" className="block text-sm font-medium text-gray-400 mb-1">Target Platform</label>
                                <select
                                    id="platform"
                                    value={platform.name}
                                    onChange={(e) => setPlatform(PLATFORMS.find(p => p.name === e.target.value) || PLATFORMS[0])}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                                >
                                    {PLATFORMS.map(p => <option key={p.name}>{p.name}</option>)}
                                </select>
                            </div>

                            {/* --- Custom Length Controls --- */}
                            <div className="pt-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="manual-count"
                                        checked={isManualCount}
                                        onChange={(e) => setIsManualCount(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="manual-count" className="ml-2 block text-sm text-gray-400">
                                        Set custom length
                                    </label>
                                </div>
                                {isManualCount && (
                                    <div className="mt-3 space-y-3 p-4 bg-gray-900/50 rounded-md border border-gray-700 animate-fade-in-fast">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Count By</label>
                                            <select
                                                value={countType}
                                                onChange={(e) => setCountType(e.target.value as 'words' | 'chars')}
                                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                                            >
                                                <option value="words">Words</option>
                                                <option value="chars">Characters</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="min-count" className="block text-xs font-medium text-gray-500 mb-1">Min</label>
                                                <input
                                                    type="number"
                                                    id="min-count"
                                                    value={minCount}
                                                    min="0"
                                                    onChange={(e) => setMinCount(e.target.value)}
                                                    placeholder="e.g., 500"
                                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="max-count" className="block text-xs font-medium text-gray-500 mb-1">Max</label>
                                                <input
                                                    type="number"
                                                    id="max-count"
                                                    value={maxCount}
                                                    min="0"
                                                    onChange={(e) => setMaxCount(e.target.value)}
                                                    placeholder="e.g., 1000"
                                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleGenerateArticle}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {generationSteps.find(s => s.status === 'in-progress')?.title || 'Generating...'}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5" />
                                        Generate Article
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* --- USER PROFILE --- */}
                    <UserProfile profile={userProfile} onProfileChange={handleProfileChange} />
                </div>
                
                <div className="lg:col-span-8">
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <ArticleDisplay 
                        article={generatedArticle}
                        isLoading={isLoading}
                        isRegeneratingLayout={isRegeneratingLayout}
                        onSave={handleSaveArticle}
                        onRegenerateLayout={handleRegenerateLayout}
                        generationSteps={generationSteps}
                    />
                </div>
            </main>

            <SavedArticlesDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                articles={savedArticles}
                onLoadArticle={loadArticle}
                onDeleteArticle={handleDeleteArticle}
            />
        </div>
    );
};

export default App;