import React, { useState } from 'react';
import { exploreTopicIdeas } from '../services/geminiService';
import type { TopicIdea } from '../types';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface TopicExplorerProps {
    onIdeaSelect: (idea: TopicIdea) => void;
}

const TopicExplorer: React.FC<TopicExplorerProps> = ({ onIdeaSelect }) => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<TopicIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExplore = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic to explore.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const result = await exploreTopicIdeas(topic);
            setIdeas(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
                <LightbulbIcon className="w-6 h-6 mr-3 text-yellow-500 dark:text-yellow-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Topic Explorer</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Stuck for ideas? Enter a broad topic and let the AI brainstorm for you.</p>
            <div className="space-y-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., healthy eating, future of AI"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-white"
                />
                <button
                    onClick={handleExplore}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-md disabled:bg-yellow-700 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Exploring...
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                             <SparklesIcon className="w-5 h-5" />
                            Explore Ideas
                        </div>
                    )}
                </button>
            </div>
            
            {error && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {ideas.length > 0 && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Suggested Ideas:</h3>
                    {ideas.map((idea, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{idea.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">{idea.angle}</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {idea.keywords.map(kw => (
                                    <span key={kw} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">{kw}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => onIdeaSelect(idea)}
                                className="w-full text-sm py-1.5 px-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 transition"
                            >
                                Use This Idea
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopicExplorer;