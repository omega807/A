
import React, { useState } from 'react';
import { exploreTopicIdeas } from '../services/geminiService';
import type { TopicIdea } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface TopicExplorerProps {
    onIdeaSelect: (idea: TopicIdea) => void;
}

const TopicExplorer: React.FC<TopicExplorerProps> = ({ onIdeaSelect }) => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<TopicIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExplore = async () => {
        if (!topic.trim()) return setError('Objective required.');
        setIsLoading(true);
        setError(null);
        try {
            const result = await exploreTopicIdeas(topic);
            setIdeas(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Exploration sequence failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Exploration Matrix</label>
                <div className="relative group">
                    <input
                        type="text"
                        value={topic}
                        onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Search concepts..."
                        className="w-full p-4 pr-14 bg-premium-black border border-premium-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-white shadow-inner-glass outline-none"
                    />
                    <button
                        onClick={handleExplore}
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {isLoading ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">System Report</span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-200 leading-relaxed uppercase tracking-tight mb-4">
                        {error}
                    </p>
                    <button 
                        onClick={handleExplore}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshIcon className="w-3 h-3" />
                        Retry Sync
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {ideas.map((idea, i) => (
                    <button 
                        key={i} 
                        onClick={() => onIdeaSelect(idea)}
                        className="w-full text-left group p-6 bg-premium-black border border-premium-border rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/[0.02] transition-all duration-300 shadow-inner-glass animate-slide-up"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <h4 className="text-sm font-bold text-white mb-2 group-hover:text-blue-400 transition-colors leading-tight">{idea.title}</h4>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed line-clamp-2">{idea.angle}</p>
                        <div className="flex flex-wrap gap-2">
                            {idea.keywords.map(kw => (
                                <span key={kw} className="px-2 py-0.5 bg-white/5 text-gray-500 text-[9px] font-bold uppercase tracking-widest rounded-md">{kw}</span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TopicExplorer;
