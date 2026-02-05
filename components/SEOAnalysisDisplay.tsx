import React from 'react';
import type { SEOAnalysis } from '../types';

interface SEOAnalysisDisplayProps {
    analysis: SEOAnalysis;
}

const SEOAnalysisDisplay: React.FC<SEOAnalysisDisplayProps> = ({ analysis }) => {
    return (
        <div className="p-6 bg-premium-dark rounded-3xl border border-premium-border shadow-inner-glass">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">SEO Score</h3>
                <span className="text-2xl font-black text-blue-500">{analysis.score}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{analysis.metaDescription}</p>
        </div>
    );
};

export default SEOAnalysisDisplay;