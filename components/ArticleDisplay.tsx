import React, { useState, useRef, useEffect } from 'react';
import TurndownService from 'turndown';
import type { Article, GenerationStep } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { ExportIcon } from './icons/ExportIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StatusIcon } from './icons/StatusIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { HtmlIcon } from './icons/HtmlIcon';
import { MarkdownIcon } from './icons/MarkdownIcon';
import { TxtIcon } from './icons/TxtIcon';
import { DocIcon } from './icons/DocIcon';

interface ArticleDisplayProps {
    article: Article | null;
    isLoading: boolean;
    isRegeneratingLayout: boolean;
    onSave: (article: Article) => void;
    onRegenerateLayout: () => void;
    generationSteps: GenerationStep[];
}

const turndownService = new TurndownService();

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ article, isLoading, isRegeneratingLayout, onSave, onRegenerateLayout, generationSteps }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCopy = async (htmlContent: string) => {
        try {
            // Use the Clipboard API to write HTML content.
            const blob = new Blob([htmlContent], { type: 'text/html' });
            await navigator.clipboard.write([
                new ClipboardItem({ 'text/html': blob })
            ]);
            setCopySuccess('Copied with formatting!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Could not copy rich text: ', err);
            // Fallback to plain text if rich text copy fails.
            const tempEl = document.createElement('div');
            tempEl.innerHTML = htmlContent;
            const plainText = tempEl.textContent || tempEl.innerText || "";
            try {
                await navigator.clipboard.writeText(plainText);
                setCopySuccess('Copied as plain text (fallback).');
                setTimeout(() => setCopySuccess(''), 2000);
            } catch (copyErr) {
                 console.error('Fallback copy failed: ', copyErr);
                setCopySuccess('Failed to copy');
                setTimeout(() => setCopySuccess(''), 2000);
            }
        }
    };

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = (format: 'html' | 'md' | 'txt' | 'doc') => {
        if (!article) return;
        const sanitizedTitle = article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        switch (format) {
            case 'html':
                downloadFile(article.content, `${sanitizedTitle}.html`, 'text/html');
                break;
            case 'md':
                const markdown = turndownService.turndown(article.content);
                downloadFile(markdown, `${sanitizedTitle}.md`, 'text/markdown');
                break;
            case 'txt':
                const tempEl = document.createElement('div');
                tempEl.innerHTML = article.content;
                const plainText = tempEl.textContent || tempEl.innerText || "";
                downloadFile(plainText, `${sanitizedTitle}.txt`, 'text/plain');
                break;
            case 'doc':
                const docHtml = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>${article.title}</title>
                        <style>
                            body { font-family: sans-serif; line-height: 1.6; }
                            h1, h2, h3 { font-weight: 700; }
                            img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
                            blockquote { border-left: 4px solid #dddddd; padding-left: 1em; margin-left: 0; color: #555555; }
                            blockquote.pull-quote { text-align: center; border: none; font-style: italic; font-size: 1.2em; color: #333333; margin: 2em auto; max-width: 80%; }
                            .two-col-container { display: table; width: 100%; border-spacing: 1em 0; }
                            .two-col-container > div { display: table-cell; width: 50%; }
                            .img-float-left { float: left; margin-right: 1.5rem; max-width: 45%; }
                            .img-float-right { float: right; margin-left: 1.5rem; max-width: 45%; }
                            .clearfix::after { content: ""; clear: both; display: table; }
                        </style>
                    </head>
                    <body>
                        <h1>${article.title}</h1>
                        ${article.content}
                    </body>
                    </html>
                `;
                downloadFile(docHtml, `${sanitizedTitle}.doc`, 'application/msword');
                break;
        }
        setShowExportMenu(false);
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md">
                    <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Generating your article</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8">The AI is working its magic. Here's the progress:</p>
                    <ul className="space-y-3">
                        {generationSteps.map((step, index) => {
                             const getTextStyle = () => {
                                switch(step.status) {
                                    case 'in-progress': return 'text-blue-600 dark:text-blue-300 font-semibold';
                                    case 'complete': return 'text-gray-500 dark:text-gray-400 line-through';
                                    case 'error': return 'text-red-600 dark:text-red-400 font-semibold';
                                    default: return 'text-gray-400 dark:text-gray-500';
                                }
                            };
                            return (
                                <li key={index} className="flex items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg transition-all duration-300 animate-fade-in">
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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed border-gray-300 dark:border-gray-700">
                <SparklesIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-500 dark:text-gray-400">Your Article Awaits</h3>
                <p className="text-gray-400 dark:text-gray-500">Fill in the details on the left to get started.</p>
            </div>
        );
    }
    
    const wordCount = article.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length;

    const ExportMenuItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
        <button
            onClick={onClick}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
            <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full inline-block">{article.platformName}</p>
                        <h1 className="text-4xl font-extrabold mt-2 text-gray-900 dark:text-white">{article.title}</h1>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button 
                            onClick={onRegenerateLayout}
                            disabled={isRegeneratingLayout}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                            title="Regenerate Layout"
                        >
                            <RefreshIcon className={`w-5 h-5 ${isRegeneratingLayout ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => onSave(article)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition" title="Save Article"><SaveIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleCopy(article.content)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition" title="Copy with Formatting"><CopyIcon className="w-5 h-5" /></button>
                        <div className="relative" ref={exportMenuRef}>
                            <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition" title="Export"><ExportIcon className="w-5 h-5" /></button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600 animate-fade-in-fast">
                                    <div className="py-1">
                                        <ExportMenuItem onClick={() => handleExport('doc')}>
                                            <DocIcon className="w-5 h-5 mr-3 text-blue-500" />
                                            Export as Word (.doc)
                                        </ExportMenuItem>
                                        <ExportMenuItem onClick={() => handleExport('html')}>
                                            <HtmlIcon className="w-5 h-5 mr-3 text-orange-500" />
                                            Export as HTML
                                        </ExportMenuItem>
                                        <ExportMenuItem onClick={() => handleExport('md')}>
                                            <MarkdownIcon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
                                            Export as Markdown
                                        </ExportMenuItem>
                                        <ExportMenuItem onClick={() => handleExport('txt')}>
                                            <TxtIcon className="w-5 h-5 mr-3 text-gray-500" />
                                            Export as Plain Text
                                        </ExportMenuItem>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {copySuccess && <p className="text-sm text-green-600 dark:text-green-400 mb-4 animate-fade-in-fast">{copySuccess}</p>}

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }} />
                
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Relevant Links:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {article.links.map((link, index) => (
                                <li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{link.text}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Hashtags:</h4>
                        <div className="flex flex-wrap gap-2">
                            {article.hashtags.map((tag, index) => (
                                <span key={index} className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Word Count: ~{wordCount}</p>
                </div>
            </div>
        </div>
    );
};

export default ArticleDisplay;