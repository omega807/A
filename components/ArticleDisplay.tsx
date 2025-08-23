import React, { useState } from 'react';
import type { Article, GenerationStep } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StatusIcon } from './icons/StatusIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface ArticleDisplayProps {
    article: Article | null;
    isLoading: boolean;
    isRegeneratingLayout: boolean;
    onSave: (article: Article) => void;
    onRegenerateLayout: () => void;
    generationSteps: GenerationStep[];
}

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ article, isLoading, isRegeneratingLayout, onSave, onRegenerateLayout, generationSteps }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = (text: string) => {
        // Create a temporary element to parse the HTML and get the text content
        const tempEl = document.createElement('div');
        tempEl.innerHTML = text;
        const plainText = tempEl.textContent || tempEl.innerText || "";

        navigator.clipboard.writeText(plainText).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md">
                    <h3 className="text-2xl font-bold text-center text-white mb-2">Generating your article</h3>
                    <p className="text-gray-400 text-center mb-8">The AI is working its magic. Here's the progress:</p>
                    <ul className="space-y-3">
                        {generationSteps.map((step, index) => {
                            const getTextStyle = () => {
                                switch(step.status) {
                                    case 'in-progress': return 'text-blue-300 font-semibold';
                                    case 'complete': return 'text-gray-400 line-through';
                                    case 'error': return 'text-red-400 font-semibold';
                                    default: return 'text-gray-500';
                                }
                            };
                            return (
                                <li key={index} className="flex items-center p-3 bg-gray-900/50 rounded-lg transition-all duration-300 animate-fade-in">
                                    <StatusIcon status={step.status} />
                                    <span className={`ml-4 text-lg ${getTextStyle()}`}>{step.title}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed border-gray-700">
                <SparklesIcon className="w-16 h-16 text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-400">Your Article Awaits</h3>
                <p className="text-gray-500">Fill in the details on the left to get started.</p>
            </div>
        );
    }
    
    const wordCount = article.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length;

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
            <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full inline-block">{article.platformName}</p>
                        <h1 className="text-4xl font-extrabold mt-2 text-white">{article.title}</h1>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button 
                            onClick={onRegenerateLayout}
                            disabled={isRegeneratingLayout}
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                            title="Regenerate Layout"
                        >
                            <RefreshIcon className={`w-5 h-5 ${isRegeneratingLayout ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => onSave(article)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition" title="Save Article"><SaveIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleCopy(article.content)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition" title="Copy Content"><CopyIcon className="w-5 h-5" /></button>
                        <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition" title="Share"><ShareIcon className="w-5 h-5" /></button>
                    </div>
                </div>
                {copySuccess && <p className="text-sm text-green-400 mb-4">{copySuccess}</p>}

                <div className="prose prose-invert prose-lg max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }} />
                
                <div className="mt-8 border-t border-gray-700 pt-6">
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-400 mb-2">Relevant Links:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {article.links.map((link, index) => (
                                <li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{link.text}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-400 mb-2">Hashtags:</h4>
                        <div className="flex flex-wrap gap-2">
                            {article.hashtags.map((tag, index) => (
                                <span key={index} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Word Count: ~{wordCount}</p>
                </div>
            </div>
        </div>
    );
};

export default ArticleDisplay;