import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 512 384"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="USACE Castle logo"
            className={className}
        >
            <rect width="512" height="384" rx="48" fill="#d71920" />
            <rect
                x="36"
                y="36"
                width="440"
                height="312"
                rx="24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="28"
            />
            <g fill="#ffffff">
                <rect x="96" y="152" width="72" height="160" />
                <rect x="96" y="112" width="16" height="40" />
                <rect x="124" y="112" width="16" height="40" />
                <rect x="152" y="112" width="16" height="40" />

                <rect x="344" y="152" width="72" height="160" />
                <rect x="344" y="112" width="16" height="40" />
                <rect x="372" y="112" width="16" height="40" />
                <rect x="400" y="112" width="16" height="40" />

                <rect x="168" y="176" width="176" height="32" />
                <rect x="168" y="184" width="32" height="128" />
                <rect x="312" y="184" width="32" height="128" />

                <rect x="200" y="176" width="112" height="136" />
                <rect x="200" y="136" width="16" height="48" />
                <rect x="232" y="136" width="16" height="48" />
                <rect x="264" y="136" width="16" height="48" />
                <rect x="296" y="136" width="16" height="48" />

                <rect x="232" y="96" width="16" height="40" />
                <rect x="264" y="96" width="16" height="40" />
                <rect x="296" y="96" width="16" height="40" />
            </g>
            <g fill="#d71920">
                <rect x="116" y="200" width="32" height="64" />
                <rect x="364" y="200" width="32" height="64" />
                <rect x="184" y="224" width="24" height="64" />
                <rect x="304" y="224" width="24" height="64" />
                <path d="M236 312V248a40 40 0 0 1 80 0v64z" />
            </g>
        </svg>
    );
};

export default Logo;
