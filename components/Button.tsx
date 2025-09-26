
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    Icon?: React.ElementType;
    // FIX: Add optional size property to support different button sizes.
    size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', Icon, size = 'md', ...props }) => {
    // FIX: Removed size-specific classes from base to be handled dynamically.
    const baseClasses = "rounded-md font-semibold inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-usace-bg disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: 'bg-usace-red text-white hover:bg-red-700 focus:ring-usace-red',
        secondary: 'bg-usace-border text-gray-200 hover:bg-gray-600 focus:ring-usace-gray',
    };

    // FIX: Define size-specific classes for padding and text size.
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-4 py-2 text-sm'
    };
    
    // FIX: Conditionally apply margin to the icon only if there is text content.
    const iconMargin = children && String(children).trim().length > 0 ? 'mr-2' : '';

    return (
        <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`} {...props}>
            {Icon && <Icon className={`w-4 h-4 ${iconMargin}`} />}
            {children}
        </button>
    );
};

export default Button;
