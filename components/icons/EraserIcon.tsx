import React from 'react';

const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12h-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12h.008v.008H9.75V12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12H3.75" />
    </svg>
);

export default EraserIcon;
