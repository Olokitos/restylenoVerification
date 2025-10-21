import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            {/* Restyle "R" Logo */}
            <g fill="currentColor">
                {/* Main R shape */}
                <path d="M8 6C8 4.9 8.9 4 10 4H20C21.1 4 22 4.9 22 6V14C22 15.1 21.1 16 20 16H16V20H22V24H16V32H12V16H10C8.9 16 8 15.1 8 14V6Z" />
                
                {/* R leg */}
                <path d="M16 20H20C21.1 20 22 20.9 22 22V24C22 25.1 21.1 26 20 26H16V20Z" />
                
                {/* Decorative circle background */}
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            </g>
        </svg>
    );
}
