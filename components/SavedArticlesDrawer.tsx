
import React from 'react';
import type { Article } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface SavedArticlesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    articles: Article[];
    onLoadArticle: (article: Article) => void;
    onDeleteArticle: (articleId: string) => void;
}

const SavedArticlesDrawer: React.FC<SavedArticlesDrawerProps> = ({
    isOpen,
    onClose,
    articles,
    onLoadArticle,
    onDeleteArticle
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-30" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            {/* Background backdrop */}
            <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="pointer-events-auto w-screen max-w-md">
                            <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 shadow-xl">
                                <div className="bg-gray-700 px-4 py-6 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-medium text-white" id="slide-over-title">Saved Articles</h2>
                                        <div className="ml-3 flex h-7 items-center">
                                            <button type="button" className="rounded-md bg-gray-700 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white" onClick={onClose}>
                                                <span className="sr-only">Close panel</span>
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                    {articles.length === 0 ? (
                                        <p className="text-gray-400">No saved articles yet.</p>
                                    ) : (
                                        <ul className="space-y-4">
                                            {articles.map(article => (
                                                <li key={article.id} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLoadArticle(article)}>
                                                        <p className="text-sm font-medium text-blue-400 truncate">{article.platformName}</p>
                                                        <p className="font-semibold text-white truncate">{article.title}</p>
                                                        <p className="text-sm text-gray-400 truncate">{article.topic}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => onDeleteArticle(article.id)}
                                                        className="ml-4 p-2 rounded-full text-gray-400 hover:bg-red-800/50 hover:text-red-300 transition"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedArticlesDrawer;
