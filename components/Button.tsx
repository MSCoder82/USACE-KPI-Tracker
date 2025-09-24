
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    Icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', Icon, ...props }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold text-sm inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-usace-bg disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: 'bg-usace-red text-white hover:bg-red-700 focus:ring-usace-red',
        secondary: 'bg-usace-border text-gray-200 hover:bg-gray-600 focus:ring-usace-gray',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

export default Button;
