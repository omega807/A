import React, { useRef } from 'react';
import type { Article } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ImportIcon } from './icons/ImportIcon';

interface SavedArticlesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    articles: Article[];
    onLoadArticle: (article: Article) => void;
    onDeleteArticle: (articleId: string) => void;
    onImportArticles: (articles: Article[]) => void;
}

const SavedArticlesDrawer: React.FC<SavedArticlesDrawerProps> = ({
    isOpen,
    onClose,
    articles,
    onLoadArticle,
    onDeleteArticle,
    onImportArticles,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') throw new Error("File content is not a string");
                const importedArticles = JSON.parse(content);
                
                if (Array.isArray(importedArticles) && importedArticles.every(item => item.id && item.title && item.content)) {
                    onImportArticles(importedArticles);
                } else {
                    alert("Invalid file format.");
                }
            } catch (error) {
                console.error("Failed to import articles:", error);
                alert("Failed to read file.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="pointer-events-auto w-screen max-w-md">
                            <div className="flex h-full flex-col bg-premium-black shadow-2xl border-l border-premium-border">
                                <div className="px-8 py-6 border-b border-premium-border flex items-center justify-between bg-premium-dark/50">
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white" id="slide-over-title">Library Index</h2>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".json"
                                            className="hidden"
                                        />
                                        <button 
                                            type="button" 
                                            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition"
                                            onClick={handleImportClick}
                                            title="Import Data"
                                        >
                                             <ImportIcon className="h-5 w-5" />
                                        </button>
                                        <button type="button" className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition" onClick={onClose}>
                                            <span className="sr-only">Close Library</span>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-premium-black">
                                    {articles.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center opacity-30 grayscale">
                                            <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center mb-6">
                                                <div className="w-8 h-8 border-2 border-gray-600 rounded-sm"></div>
                                            </div>
                                            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Database Empty</p>
                                            <p className="text-[10px] text-gray-500 mt-2">Historical records will materialize here.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-4">
                                            {articles.map(article => (
                                                <li key={article.id} className="group bg-premium-dark p-6 rounded-2xl border border-premium-border hover:border-blue-500/50 hover:bg-blue-500/[0.02] transition-all cursor-pointer shadow-inner-glass animate-slide-up" onClick={() => onLoadArticle(article)}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2">{article.platformName}</p>
                                                            <p className="font-bold text-white text-sm truncate leading-tight group-hover:text-blue-400 transition-colors">{article.title}</p>
                                                            <p className="text-[10px] text-gray-500 truncate mt-2 font-mono uppercase tracking-tighter">{article.topic}</p>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onDeleteArticle(article.id); }}
                                                            className="ml-4 p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                            title="Purge"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
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