import React, { useState, useEffect } from 'react';
import { findKeywords } from '../services/geminiService';
import type { SEOAnalysis, KeywordSuggestion, SEOChecklistItem } from '../types';
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
        if (analysis) setActiveTab('analysis');
    }, [analysis]);

    const handleFindKeywords = async () => {
        if (!topic.trim()) return setError('Primary narrative objective required.');
        setIsLoading(true);
        setError(null);
        try {
            const result = await findKeywords(topic);
            setKeywords(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Research failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="flex p-1.5 bg-premium-black rounded-2xl border border-premium-border shadow-inner-glass">
                 <button onClick={() => setActiveTab('research')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition ${activeTab === 'research' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}>Research</button>
                <button onClick={() => setActiveTab('analysis')} disabled={!analysis} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition ${activeTab === 'analysis' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300 opacity-50 cursor-not-allowed'}`}>Site Audit</button>
            </div>
            
            {activeTab === 'research' && (
                <div className="space-y-6">
                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Target Concept: {topic || 'System Idle'}</p>
                        <button onClick={handleFindKeywords} disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20">
                            {isLoading ? 'Scanning Matrix...' : 'Launch Keyword Scan'}
                        </button>
                    </div>
                    
                    {error && <div className="text-[10px] font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
                    
                    <div className="space-y-3">
                        {keywords.map(kw => (
                            <button key={kw.keyword} onClick={() => onKeywordSelect(kw)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedKeyword === kw.keyword ? 'border-blue-500 bg-blue-500/5 shadow-lg' : 'border-premium-border bg-premium-black hover:border-gray-700'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-xs text-white">{kw.keyword}</span>
                                    <span className={`text-[8px] px-2 py-0.5 font-black uppercase tracking-widest rounded-full ${kw.type === 'Primary' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>{kw.type}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono italic">{kw.intent}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'analysis' && analysis && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-premium-black rounded-3xl border border-premium-border shadow-inner-glass">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">System SEO Index</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-black ${analysis.score > 80 ? 'text-green-500' : 'text-blue-500'}`}>{analysis.score}</span>
                                <span className="text-xs text-gray-600">/100</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin-slow"></div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Readability Matrix</h4>
                        <div className="p-4 bg-premium-black rounded-2xl border border-premium-border shadow-inner-glass">
                            <p className="font-bold text-sm text-white mb-1">{analysis.readability.level}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{analysis.readability.notes}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Critical Audit Checklist</h4>
                        <div className="space-y-3">
                            {analysis.checklist.map((item, i) => (
                                <div key={i} className="p-4 bg-premium-black rounded-2xl border border-premium-border flex items-start gap-4">
                                    {item.status === 'Pass' ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
                                    <div className="space-y-1">
                                        <p className="font-bold text-xs text-white">{item.check}</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed">{item.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEOWorkbench;