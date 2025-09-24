import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-usace-card border border-usace-border rounded-lg shadow-xl w-full max-w-lg mx-4"
                role="document"
            >
                <div className="flex justify-between items-center p-4 border-b border-usace-border">
                    <h3 id="modal-title" className="text-xl font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-usace-border hover:text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;