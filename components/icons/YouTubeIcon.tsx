
import React from 'react';

const YouTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M19.822 7.402a2.312 2.312 0 00-1.636-1.636C16.992 5.5 12 5.5 12 5.5s-4.992 0-6.186.266a2.312 2.312 0 00-1.636 1.636C4 8.598 4 12 4 12s0 3.402.18 4.598a2.312 2.312 0 001.636 1.636C7.008 18.5 12 18.5 12 18.5s4.992 0 6.186-.266a2.312 2.312 0 001.636-1.636C20 15.402 20 12 20 12s0-3.402-.178-4.598zM9.75 14.625v-5.25L14.25 12 9.75 14.625z"
      clipRule="evenodd"
    />
  </svg>
);

export default YouTubeIcon;
