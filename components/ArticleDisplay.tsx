
import React, { useState, useRef, useEffect } from 'react';
import TurndownService from 'turndown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { ShareIcon } from './icons/ShareIcon';
import { PdfIcon } from './icons/PdfIcon';
import { GoogleDocIcon } from './icons/GoogleDocIcon';
import ShareModal from './ShareModal';
import { RepurposeIcon } from './icons/RepurposeIcon';
import RepurposeModal from './RepurposeModal';
import { CheckIcon } from './icons/CheckIcon';

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
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isRepurposeModalOpen, setIsRepurposeModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const articleContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyHtml = async () => {
        if (!article) return;
        try {
            await navigator.clipboard.writeText(article.content);
            setCopySuccess('HTML Copied');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed');
        }
        setShowExportMenu(false);
    };

    const handleCopyRichText = async (htmlContent: string) => {
        try {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
            setCopySuccess('Copied to Clipboard');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Rich Copy Failed');
        }
    };

    const handleExport = async (format: 'html' | 'md' | 'txt' | 'doc' | 'pdf') => {
        if (!article) return;
        const sanitizedTitle = article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const download = (content: string, name: string, type: string) => {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = name; a.click();
            URL.revokeObjectURL(url);
        };

        if (format === 'pdf') {
            if (!articleContentRef.current) return;
            setIsGeneratingPdf(true);
            try {
                const canvas = await html2canvas(articleContentRef.current, { scale: 2, useCORS: true, backgroundColor: '#0D1117' });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
                pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
                pdf.save(`${sanitizedTitle}.pdf`);
            } catch (e) { setCopySuccess('PDF Failed'); }
            finally { setIsGeneratingPdf(false); }
        } else if (format === 'md') {
            download(turndownService.turndown(article.content), `${sanitizedTitle}.md`, 'text/markdown');
        } else if (format === 'html') {
            download(article.content, `${sanitizedTitle}.html`, 'text/html');
        }
        setShowExportMenu(false);
    };

    if (isLoading && !article) {
        return (
            <div className="w-full max-w-2xl text-center space-y-12 py-20">
                <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-t-2 border-purple-500 rounded-full animate-spin-reverse opacity-50"></div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-4xl font-extrabold tracking-tighter shimmer-text">Stratis Synthesis</h3>
                    <p className="text-gray-500 font-medium">Processing global data nodes to construct your narrative.</p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                    {generationSteps.map((step, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-700 ${step.status === 'in-progress' ? 'bg-blue-500/10 border-blue-500/20 scale-105 shadow-lg' : 'border-premium-border opacity-40'}`}>
                            <StatusIcon status={step.status} />
                            <span className={`text-xs font-bold uppercase tracking-widest ${step.status === 'in-progress' ? 'text-blue-400' : 'text-gray-500'}`}>{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!article) return (
        <div className="flex flex-col items-center justify-center text-center opacity-40 py-40">
            <div className="w-24 h-24 rounded-full border border-dashed border-gray-600 flex items-center justify-center mb-8">
                <SparklesIcon className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Engine Standby</h2>
            <p className="text-sm max-w-xs">Awaiting narrative objective to initiate synthesis sequence.</p>
        </div>
    );

    return (
        <div className="w-full max-w-4xl flex flex-col space-y-12 animate-slide-up">
            <div className="sticky top-8 z-30 glass-card rounded-3xl p-3 flex items-center justify-between shadow-premium border-white/5">
                <div className="flex items-center space-x-6 px-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{article.platformName}</span>
                        <span className="text-xs text-gray-500 font-mono">Status: Draft Verified</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button onClick={onRegenerateLayout} className="p-3 rounded-xl hover:bg-white/5 text-gray-400 transition" title="New Layout"><RefreshIcon className={`w-5 h-5 ${isRegeneratingLayout ? 'animate-spin' : ''}`} /></button>
                    <button onClick={() => setIsRepurposeModalOpen(true)} className="p-3 rounded-xl hover:bg-white/5 text-gray-400 transition" title="Repurpose"><RepurposeIcon className="w-5 h-5" /></button>
                    <button onClick={() => setIsShareModalOpen(true)} className="p-3 rounded-xl hover:bg-white/5 text-gray-400 transition" title="Share"><ShareIcon className="w-5 h-5" /></button>
                    <button onClick={() => onSave(article)} className="p-3 rounded-xl hover:bg-white/5 text-gray-400 transition" title="Archive"><SaveIcon className="w-5 h-5" /></button>
                    
                    <div className="relative" ref={exportMenuRef}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="ml-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2">
                            <ExportIcon className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                        
                        {showExportMenu && (
                            <div className="absolute right-0 mt-4 w-64 glass-card rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                                <div className="p-2 space-y-1">
                                    <button onClick={() => handleCopyRichText(article.content)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl text-gray-300">
                                        <CopyIcon className="w-4 h-4 text-blue-400" /> Copy Rich Text
                                    </button>
                                    <button onClick={handleCopyHtml} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl text-gray-300">
                                        <HtmlIcon className="w-4 h-4 text-orange-400" /> Copy HTML
                                    </button>
                                    <div className="h-px bg-white/5 my-2"></div>
                                    <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl text-gray-300">
                                        <PdfIcon className="w-4 h-4 text-red-400" /> PDF Document
                                    </button>
                                    <button onClick={() => handleExport('md')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl text-gray-300">
                                        <MarkdownIcon className="w-4 h-4 text-gray-400" /> Markdown
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-premium-dark rounded-3xl shadow-premium border border-premium-border overflow-hidden ring-1 ring-white/5 relative">
                <div ref={articleContentRef} className="p-16 md:p-24 relative z-10">
                    <div className="mb-20 space-y-6">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white leading-[1.05]">{article.title}</h1>
                        <div className="flex flex-wrap gap-3">
                            {article.hashtags?.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="prose prose-invert lg:prose-xl font-serif text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }} />
                    
                    <footer className="mt-20 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {article.links && article.links.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">Cross References</h4>
                                <div className="space-y-4">
                                    {article.links.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" className="block text-sm text-gray-400 hover:text-blue-400 transition-colors truncate">
                                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500/40 mr-3"></span> {link.text}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {article.sources && article.sources.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">Intelligence Sources</h4>
                                <div className="space-y-4">
                                    {article.sources.map((src, i) => (
                                        <a key={i} href={src.uri} target="_blank" className="block text-sm text-gray-400 hover:text-blue-400 transition-colors truncate">
                                            <span className="font-bold text-gray-300 mr-2">{src.title}</span> — {src.uri}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </footer>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-50"></div>
            </div>

            {copySuccess && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-2xl text-xs font-bold uppercase tracking-widest animate-slide-up flex items-center gap-3">
                        <CheckIcon className="w-4 h-4" />
                        {copySuccess}
                    </div>
                </div>
            )}

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} article={article} />
            <RepurposeModal isOpen={isRepurposeModalOpen} onClose={() => setIsRepurposeModalOpen(false)} article={article} />
        </div>
    );
};

export default ArticleDisplay;
