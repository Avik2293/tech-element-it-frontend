// Add this at the top of your file with other imports
import { useEffect } from 'react';

const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-start">
                <span className="flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 text-white hover:text-gray-200"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ErrorPopup;