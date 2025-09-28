import React from 'react';

// Publicly hosted USACE logo used across the application
const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/United_States_Army_Corps_of_Engineers_logo.svg';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <img
            src={LOGO_URL}
            alt="USACE Logo"
            className={className}
        />
    );
};

export default Logo;
