
import React from 'react';

const BathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8a2 2 0 00-2 2v5h12v-5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V9m0-3a3 3 0 00-3 3h6a3 3 0 00-3-3z" />
    <path d="M8 7v2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default BathIcon;
