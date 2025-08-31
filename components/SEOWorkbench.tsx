import React, { useState, useEffect } from 'react';
import { findKeywords } from '../services/geminiService';
import type { SEOAnalysis, KeywordSuggestion, SEOChecklistItem } from '../types';
import { SEOWorkbenchIcon } from './icons/SEOWorkbenchIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface SEOWorkbenchProps {
    topic: string;
    selectedKeyword: string;
    onKeywordSelect: (keyword: KeywordSuggestion) => void;
    analysis: SEOAnalysis | null;
}

const SEOWorkbench: React.FC<SEOWorkbenchProps> = ({ topic, selectedKeyword, onKeywordSelect, analysis }) => {
    const [activeTab, setActiveTab] = useState<'research' | 'analysis'>('research');
    const [keywords, setKeywords] = useState<KeywordSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If an article is generated with an analysis, switch to the analysis tab
        if (analysis) {
            setActiveTab('analysis');
        } else {
            setActiveTab('research');
        }
    }, [analysis]);

    const handleFindKeywords = async () => {
        if (!topic.trim()) {
            setError('Please enter a main topic in the controls above first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setKeywords([]);
        try {
            const result = await findKeywords(topic);
            setKeywords(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
        const circumference = 2 * Math.PI * 40; // 2 * pi * radius
        const offset = circumference - (score / 100) * circumference;
        const colorClass = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

        return (
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <circle
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${colorClass}`}>
                    {score}
                </span>
            </div>
        );
    };

    const ChecklistItem: React.FC<{ item: SEOChecklistItem }> = ({ item }) => {
        const getIcon = () => {
            switch (item.status) {
                case 'Pass': return <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
                case 'Needs Improvement': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
                case 'Fail': return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
                default: return null;
            }
        };

        return (
             <div className="py-3 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                    <div className="mr-3 mt-0.5">{getIcon()}</div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.check}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.recommendation}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6 flex items-center border-b border-gray-200 dark:border-gray-700">
                 <SEOWorkbenchIcon className="w-6 h-6 mr-3 text-green-500 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SEO Workbench</h2>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                    <button onClick={() => setActiveTab('research')} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition ${activeTab === 'research' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Keyword Research
                    </button>
                    <button onClick={() => setActiveTab('analysis')} disabled={!analysis} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition ${activeTab === 'analysis' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        On-Page Analysis
                    </button>
                </nav>
            </div>
            
            <div className="p-6">
                {activeTab === 'research' && (
                    <div className="animate-fade-in-fast">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Discover high-potential keywords for your topic. The selected keyword will be used to optimize the article.</p>
                        <button
                            onClick={handleFindKeywords}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md disabled:bg-green-700 disabled:cursor-not-allowed transition-colors duration-200 mb-4"
                        >
                            {isLoading ? 'Finding Keywords...' : <><SparklesIcon className="w-5 h-5 mr-2" />Find Keywords</>}
                        </button>
                        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
                        {keywords.length > 0 && (
                            <div className="space-y-2">
                                {keywords.map(kw => (
                                    <button 
                                        key={kw.keyword} 
                                        onClick={() => onKeywordSelect(kw)}
                                        className={`w-full text-left p-3 rounded-md border-2 transition ${selectedKeyword === kw.keyword ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{kw.keyword}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${kw.type === 'Primary' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>{kw.type}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kw.intent}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                         <div className="mt-4">
                            <label htmlFor="seo-keyword-manual" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Or enter keyword manually:</label>
                            <input
                                type="text"
                                id="seo-keyword-manual"
                                value={selectedKeyword}
                                onChange={(e) => onKeywordSelect({ keyword: e.target.value, type: 'Primary', intent: 'Custom' })}
                                placeholder="e.g., benefits of machine learning"
                                className="mt-1 w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                )}
                {activeTab === 'analysis' && analysis && (
                    <div className="animate-fade-in-fast space-y-6">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall SEO Score</p>
                            <ScoreCircle score={analysis.score} />
                            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                                For keyword: <strong className="text-blue-600 dark:text-blue-400">"{selectedKeyword}"</strong>
                            </p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Readability</h4>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{analysis.readability.level}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{analysis.readability.notes}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Actionable Checklist</h4>
                            <div className="space-y-3">
                                {analysis.checklist.map((item, index) => (
                                    <ChecklistItem key={index} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SEOWorkbench;
