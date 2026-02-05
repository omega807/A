
import React, { useState } from 'react';
import type { Article, RepurposePlatform } from '../types';
import { repurposeContent } from '../services/geminiService';
import { XIcon as TwitterIcon } from './icons/XIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface RepurposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: Article | null;
}

const RepurposeModal: React.FC<RepurposeModalProps> = ({ isOpen, onClose, article }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [repurposedContent, setRepurposedContent] = useState('');
    const [activePlatform, setActivePlatform] = useState<RepurposePlatform | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    if (!isOpen || !article) return null;

    const handleRepurpose = async (platform: RepurposePlatform) => {
        setIsLoading(true);
        setActivePlatform(platform);
        setError(null);
        setRepurposedContent('');
        try {
            const result = await repurposeContent(article.title, article.content, platform);
            setRepurposedContent(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(repurposedContent);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const platformOptions: { name: RepurposePlatform, icon: React.ReactNode }[] = [
        { name: 'X (Twitter) Thread', icon: <TwitterIcon className="w-5 h-5" /> },
        { name: 'LinkedIn Post', icon: <LinkedInIcon className="w-5 h-5" /> },
        { name: 'Instagram Caption', icon: <InstagramIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" aria-labelledby="repurpose-modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fade-in" onClick={onClose} aria-hidden="true"></div>
            
            <div className="relative w-full max-w-2xl glass-card rounded-[32px] shadow-2xl overflow-hidden animate-slide-up border-white/10 ring-1 ring-white/5">
                <div className="p-8 sm:p-12">
                    <div className="flex items-start justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tighter text-white" id="repurpose-modal-title">
                                Stratis Engine — Repurpose
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 opacity-80">
                                Transforming intelligence for social channels
                            </p>
                        </div>
                        <button type="button" className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95" onClick={onClose}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="flex flex-wrap gap-4">
                            {platformOptions.map(p => (
                                <button
                                    key={p.name}
                                    onClick={() => handleRepurpose(p.name)}
                                    disabled={isLoading}
                                    className={`flex-1 min-w-[140px] group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${activePlatform === p.name ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-premium-black border-white/5 hover:border-blue-500/50 hover:bg-white/[0.02]'}`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors ${activePlatform === p.name ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 group-hover:text-blue-400'}`}>
                                        {p.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${activePlatform === p.name ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        {p.name.split(' ')[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="relative min-h-[320px] bg-premium-black rounded-3xl border border-white/5 p-8 shadow-inner-glass">
                             {isLoading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 rounded-3xl backdrop-blur-sm bg-premium-black/40">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 animate-pulse">Recalibrating Context...</p>
                                </div>
                            )}

                             {error && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <p className="text-xs font-medium text-red-400/80">{error}</p>
                                    <button onClick={() => activePlatform && handleRepurpose(activePlatform)} className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Retry Synthesis</button>
                                </div>
                            )}

                            {repurposedContent ? (
                                <div className="h-full flex flex-col animate-fade-in">
                                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 pr-4">
                                        <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-blue-500/30">
                                            {repurposedContent}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleCopy} 
                                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 font-bold text-xs uppercase tracking-widest ${copySuccess ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {copySuccess ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                                        {copySuccess ? 'Copied to Memory' : 'Copy to Clipboard'}
                                    </button>
                                </div>
                            ) : !isLoading && !error && (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Platform Selection</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepurposeModal;
