import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile as UserProfileType, Platform, Article, ArticleContent, GenerationStep, ResearchData, TopicIdea, KeywordSuggestion, ArticlePlan } from './types';
import { PLATFORMS, DEFAULT_USER_PROFILE } from './constants';
import { researchTopic, generateArticlePlan, streamArticleContent, generateImage } from './services/geminiService';
import UserProfile from './components/UserProfile';
import ArticleDisplay from './components/ArticleDisplay';
import SavedArticlesDrawer from './components/SavedArticlesDrawer';
import SEOWorkbench from './components/SEOWorkbench';
import TopicExplorer from './components/TopicExplorer';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { SunIcon } from './components/icons/SunIcon';
import { LightbulbIcon } from './components/icons/LightbulbIcon';
import { SEOWorkbenchIcon } from './components/icons/SEOWorkbenchIcon';
import { StatusIcon } from './components/icons/StatusIcon';

type Tab = 'composer' | 'research' | 'optimise';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('composer');
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
    
    const [isManualCount, setIsManualCount] = useState<boolean>(false);
    const [minCount, setMinCount] = useState<string>('');
    const [maxCount, setMaxCount] = useState<string>('');
    const [countType, setCountType] = useState<'words' | 'chars'>('words');
    const [seoKeyword, setSeoKeyword] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
        try {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) setUserProfile(JSON.parse(savedProfile));
            const articlesFromStorage = localStorage.getItem('savedArticles');
            if (articlesFromStorage) setSavedArticles(JSON.parse(articlesFromStorage));
        } catch (e) {
            console.error(e);
        }
    }, []);
    
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    };

    const handleProfileChange = useCallback((newProfile: UserProfileType) => {
        setUserProfile(newProfile);
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
    }, []);

    const updateStepStatus = useCallback((index: number, status: GenerationStep['status']) => {
        setGenerationSteps(prev => {
            const next = [...prev];
            if (next[index]) next[index].status = status;
            return next;
        });
    }, []);

    const executeGeneration = async (isRegeneration: boolean) => {
        if (!isRegeneration && !topic.trim()) {
            setError('Please enter a topic.');
            return;
        }
        const currentTopic = isRegeneration ? generatedArticle!.topic : topic;
        const currentSeoKeyword = isRegeneration ? generatedArticle!.seoKeywordUsed : seoKeyword.trim() || undefined;

        setIsLoading(true);
        setError(null);
        if (!isRegeneration) setGeneratedArticle(null);
        
        const initialSteps: GenerationStep[] = [
            { title: 'Intelligence Gathering', status: 'pending' },
            { title: 'Structural Blueprinting', status: 'pending' },
            { title: 'Content Synthesis', status: 'pending' },
            { title: 'Visual Rendering', status: 'pending' },
            { title: 'System Finalisation', status: 'pending' },
        ];
        setGenerationSteps(initialSteps);
        
        try {
            let researchData: ResearchData;
            if (isRegeneration && lastResearchData) {
                researchData = lastResearchData;
            } else {
                updateStepStatus(0, 'in-progress');
                researchData = await researchTopic(currentTopic);
                setLastResearchData(researchData);
                updateStepStatus(0, 'complete');
            }
            
            updateStepStatus(1, 'in-progress');
            const articlePlan: ArticlePlan = await generateArticlePlan(
                currentTopic,
                platform,
                researchData,
                userProfile,
                isManualCount ? { min: minCount, max: maxCount, type: countType } : undefined,
                currentSeoKeyword
            );
            updateStepStatus(1, 'complete');

            const initialArticle: Article = {
                id: Date.now().toString(),
                content: '',
                ...articlePlan,
                imageUrls: [],
                platformName: platform.name,
                topic: currentTopic,
                seoKeywordUsed: currentSeoKeyword,
            };
            setGeneratedArticle(initialArticle);
            
            updateStepStatus(2, 'in-progress');
            const contentStream = streamArticleContent(
                articlePlan,
                platform,
                researchData,
                userProfile,
                isManualCount ? { min: minCount, max: maxCount, type: countType } : undefined,
                isRegeneration
            );
            
            let finalContent = '';
            for await (const chunk of contentStream) {
                finalContent += chunk;
                setGeneratedArticle(prev => prev ? { ...prev, content: finalContent } : null);
            }
            updateStepStatus(2, 'complete');

            updateStepStatus(3, 'in-progress');
            const imageUrls = await Promise.all(
                articlePlan.visualPrompts.map(p => generateImage(p.prompt))
            );
            
            let contentWithImages = finalContent;
            articlePlan.visualPrompts.forEach((prompt, index) => {
                const imageUrl = imageUrls[index];
                if(imageUrl) {
                    const placeholderSrc = `src="${prompt.placeholder}"`;
                    const finalImgTagPortion = `src="${imageUrl}" alt="${prompt.prompt.substring(0, 100)}"`;
                    contentWithImages = contentWithImages.replace(placeholderSrc, finalImgTagPortion);
                }
            });
            updateStepStatus(3, 'complete');

            updateStepStatus(4, 'in-progress');
            const finalArticle: Article = { ...initialArticle, content: contentWithImages, imageUrls };
            setGeneratedArticle(finalArticle);
            updateStepStatus(4, 'complete');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGenerationSteps(prev => {
                const next = [...prev];
                const active = next.findIndex(s => s.status === 'in-progress');
                if (active !== -1) next[active].status = 'error';
                return next;
            });
        } finally {
            setIsLoading(false);
            if (isRegeneration) setIsRegeneratingLayout(false);
        }
    };

    const handleSaveArticle = (article: Article) => {
        const next = [article, ...savedArticles.filter(a => a.id !== article.id)];
        setSavedArticles(next);
        localStorage.setItem('savedArticles', JSON.stringify(next));
    };

    const handleDeleteArticle = (articleId: string) => {
        const next = savedArticles.filter(a => a.id !== articleId);
        setSavedArticles(next);
        localStorage.setItem('savedArticles', JSON.stringify(next));
    };

    const loadArticle = (article: Article) => {
        setGeneratedArticle(article);
        setTopic(article.topic);
        setSeoKeyword(article.seoKeywordUsed || '');
        setPlatform(PLATFORMS.find(p => p.name === article.platformName) || PLATFORMS[0]);
        setIsDrawerOpen(false);
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex bg-premium-black text-gray-200 font-sans">
            
            {/* Nav Rail */}
            <nav className="w-16 border-r border-premium-border flex flex-col items-center py-8 space-y-8 bg-premium-dark flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col space-y-4">
                    <button onClick={() => setActiveTab('composer')} className={`p-3 rounded-xl transition-all ${activeTab === 'composer' ? 'bg-white/10 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                        <SparklesIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setActiveTab('research')} className={`p-3 rounded-xl transition-all ${activeTab === 'research' ? 'bg-white/10 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                        <LightbulbIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setActiveTab('optimise')} className={`p-3 rounded-xl transition-all ${activeTab === 'optimise' ? 'bg-white/10 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                        <SEOWorkbenchIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-auto flex flex-col space-y-4">
                    <button onClick={() => setIsDrawerOpen(true)} className="p-3 text-gray-500 hover:text-gray-300 relative">
                        <div className="w-5 h-5 border-2 border-current rounded-md flex items-center justify-center text-[10px] font-bold">L</div>
                        {savedArticles.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </button>
                    <button onClick={toggleTheme} className="p-3 text-gray-500 hover:text-gray-300">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Config Sidebar */}
            <aside className="w-[380px] flex flex-col border-r border-premium-border bg-premium-dark/50 backdrop-blur-xl flex-shrink-0">
                <div className="h-16 flex items-center px-8 border-b border-premium-border">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                        {activeTab === 'composer' ? 'Content Engine' : activeTab === 'research' ? 'Knowledge Graph' : 'SEO Audit'}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {activeTab === 'composer' && (
                        <div className="space-y-8 animate-slide-up">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Core Narrative Objective</label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Enter your topic or prompt..."
                                    className="w-full h-32 p-4 bg-premium-black border border-premium-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm leading-relaxed placeholder-gray-600 shadow-inner-glass resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Publishing Channel</label>
                                    <select
                                        value={platform.name}
                                        onChange={(e) => setPlatform(PLATFORMS.find(p => p.name === e.target.value) || PLATFORMS[0])}
                                        className="w-full p-3 bg-premium-black border border-premium-border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition text-sm appearance-none shadow-inner-glass"
                                    >
                                        {PLATFORMS.map(p => <option key={p.name}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <UserProfile profile={userProfile} onProfileChange={handleProfileChange} />

                            <div className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Length Precision</label>
                                    <button onClick={() => setIsManualCount(!isManualCount)} className={`w-10 h-5 rounded-full relative transition-colors ${isManualCount ? 'bg-blue-600' : 'bg-gray-800'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isManualCount ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                {isManualCount && (
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-premium-black rounded-xl border border-premium-border animate-slide-up">
                                        <input type="number" value={minCount} onChange={(e) => setMinCount(e.target.value)} placeholder="Min" className="bg-transparent border-b border-premium-border py-1 text-sm focus:border-blue-500 outline-none" />
                                        <input type="number" value={maxCount} onChange={(e) => setMaxCount(e.target.value)} placeholder="Max" className="bg-transparent border-b border-premium-border py-1 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'research' && <TopicExplorer onIdeaSelect={(idea) => { setTopic(idea.title); setSeoKeyword(idea.keywords[0] || ''); setActiveTab('composer'); }} />}
                    {activeTab === 'optimise' && <SEOWorkbench topic={topic} selectedKeyword={seoKeyword} onKeywordSelect={(k) => { setSeoKeyword(k.keyword); setActiveTab('composer'); }} analysis={generatedArticle?.seoAnalysis ?? null} />}
                </div>

                {activeTab === 'composer' && (
                    <div className="p-8 border-t border-premium-border">
                        <button
                            onClick={() => executeGeneration(false)}
                            disabled={isLoading}
                            className="w-full group relative py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-500/20 transition-all overflow-hidden disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-5 h-5" />}
                                {isLoading ? 'Generating Engine...' : 'Initiate Synthesis'}
                            </span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Stage */}
            <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#05080E]">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="relative min-h-full py-16 px-4 lg:px-20 flex justify-center">
                     <ArticleDisplay 
                        article={generatedArticle}
                        isLoading={isLoading}
                        isRegeneratingLayout={isRegeneratingLayout}
                        onSave={handleSaveArticle}
                        onRegenerateLayout={() => executeGeneration(true)}
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
                onImportArticles={(imp) => { setSavedArticles(imp); localStorage.setItem('savedArticles', JSON.stringify(imp)); setIsDrawerOpen(false); }}
            />
        </div>
    );
};

export default App;