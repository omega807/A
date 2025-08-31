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

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center" aria-labelledby="share-modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full animate-fade-in-fast">
                <div className="px-6 pt-5 pb-6">
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="share-modal-title">
                            Share Article
                        </h3>
                        <button type="button" className="rounded-md bg-transparent text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={onClose}>
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Share "{article.title}" on your favorite platform.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                <XIcon className="w-5 h-5 mr-2" /> Share on X
                            </a>
                            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                <LinkedInIcon className="w-5 h-5 mr-2" /> Share on LinkedIn
                            </a>
                            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                <FacebookIcon className="w-5 h-5 mr-2" /> Share on Facebook
                            </a>
                            <a href={shareLinks.reddit} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                <RedditIcon className="w-5 h-5 mr-2" /> Share on Reddit
                            </a>
                        </div>
                        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-300 text-xs">
                            <strong>Note:</strong> Sharing uses a placeholder URL. Remember to replace it with your actual article link after publishing!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
