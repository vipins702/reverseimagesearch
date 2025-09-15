import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="spinner">
            <style jsx>{`
                .spinner {
                    border: 8px solid rgba(4, 120, 87, 0.1);
                    border-left-color: #047857;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default Spinner;