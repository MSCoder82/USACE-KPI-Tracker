
import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, action }) => {
    return (
        <div className={`bg-usace-card border border-usace-border rounded-lg shadow-lg ${className}`}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-usace-border flex justify-between items-center">
                    {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                    {action}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;
