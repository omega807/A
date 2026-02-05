import React from 'react';
import type { Article } from '../types';
import { XIcon } from './icons/XIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { RedditIcon } from './icons/RedditIcon';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: Article | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, article }) => {
    if (!isOpen || !article) return null;

    const placeholderUrl = "https://your-blog.com/your-article-slug";
    const encodedUrl = encodeURIComponent(placeholderUrl);
    const encodedTitle = encodeURIComponent(article.title);
    const encodedHashtags = article.hashtags.map(h => h.replace('#', '')).join(',');

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
        reddit: `https://www.reddit.com/submit?title=${encodedTitle}&url=${encodedUrl}`
    };

    const platforms = [
        { name: 'X (Twitter)', icon: <XIcon className="w-5 h-5" />, link: shareLinks.twitter, color: 'hover:text-blue-400' },
        { name: 'LinkedIn', icon: <LinkedInIcon className="w-5 h-5" />, link: shareLinks.linkedin, color: 'hover:text-blue-600' },
        { name: 'Facebook', icon: <FacebookIcon className="w-5 h-5" />, link: shareLinks.facebook, color: 'hover:text-blue-500' },
        { name: 'Reddit', icon: <RedditIcon className="w-5 h-5" />, link: shareLinks.reddit, color: 'hover:text-orange-500' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-labelledby="share-modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fade-in" onClick={onClose} aria-hidden="true"></div>
            
            <div className="relative w-full max-w-lg glass-card rounded-[32px] shadow-2xl overflow-hidden animate-slide-up border-white/10 ring-1 ring-white/5">
                <div className="p-10">
                    <div className="flex items-start justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tighter text-white" id="share-modal-title">
                                Broadcast Article
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 opacity-80">
                                Distributing intelligence across nodes
                            </p>
                        </div>
                        <button type="button" className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95" onClick={onClose}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Select a target gateway to share <span className="text-white">"{article.title}"</span> with your collective audience.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {platforms.map(p => (
                                <a 
                                    key={p.name} 
                                    href={p.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`flex items-center gap-4 px-6 py-4 bg-premium-black border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-400 transition-all hover:border-blue-500/50 hover:bg-white/[0.02] shadow-inner-glass group ${p.color}`}
                                >
                                    <span className="group-hover:scale-110 transition-transform">{p.icon}</span>
                                    {p.name.split(' ')[0]}
                                </a>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Node Sync Protocol</p>
                                <p className="text-[10px] text-blue-400/60 leading-relaxed">
                                    Current distribution uses a sandbox URL. Sync actual link manually after final publication.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;