
import React from 'react';

export const MarkdownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {/* Rounded rectangle border */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5h15A2.25 2.25 0 0 1 21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75A2.25 2.25 0 0 1 4.5 4.5Z" />
        {/* Letter M */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 15.5V9.5l2 2 2-2v6" />
        {/* Down arrow */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9.5v4m0 0L15.5 12m1.5 1.5L18.5 12" />
    </svg>
);
