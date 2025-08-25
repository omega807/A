import React, { useState } from 'react';
import type { SEOAnalysis } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SEOAnalysisDisplayProps {
    analysis: SEOAnalysis;
    keyword: string;
}

const SEOAnalysisDisplay: React.FC<SEOAnalysisDisplayProps> = ({ analysis, keyword }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const ChecklistItem: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
        <li className={`flex items-center text-sm ${checked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
            <CheckIcon className={`w-5 h-5 mr-2 flex-shrink-0 ${checked ? 'text-green-500' : 'text-gray-400 dark:text-gray-600'}`} />
            {label}
        </li>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">SEO Analysis</h2>
                <div className="space-y-6">
                    {/* Meta Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Description</label>
                        <div className="relative">
                            <textarea
                                readOnly
                                value={analysis.metaDescription}
                                className="w-full h-24 p-3 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300"
                            />
                            <button 
                                onClick={() => handleCopy(analysis.metaDescription)}
                                className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Copy Meta Description"
                            >
                                <CopyIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className={`text-xs mt-1 ${analysis.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                            {analysis.metaDescription.length} / ~155 characters
                        </p>
                        {copySuccess && <p className="text-xs text-green-500 mt-1">{copySuccess}</p>}
                    </div>

                    {/* Related Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Related Keywords</label>
                        <div className="flex flex-wrap gap-2">
                            {analysis.relatedKeywords.map((kw, index) => (
                                <span key={index} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-full">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* SEO Checklist */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            On-Page Checklist for: <span className="font-bold text-blue-600 dark:text-blue-400">"{keyword}"</span>
                        </label>
                        <ul className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                           <ChecklistItem label="Keyword in Title" checked={analysis.checklist.titleContainsKeyword} />
                           <ChecklistItem label="Keyword in Meta Description" checked={analysis.checklist.metaDescriptionContainsKeyword} />
                           <ChecklistItem label="Keyword in Headings (H2)" checked={analysis.checklist.headingsContainKeyword} />
                           <ChecklistItem label="Keyword in Content Body" checked={analysis.checklist.contentContainsKeyword} />
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SEOAnalysisDisplay;
