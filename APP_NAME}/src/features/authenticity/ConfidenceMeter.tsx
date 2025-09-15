import React from 'react';

interface ConfidenceMeterProps {
    confidenceScore: number;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ confidenceScore }) => {
    const getMeterColor = () => {
        if (confidenceScore >= 75) return '#4caf50'; // Green
        if (confidenceScore >= 50) return '#ffeb3b'; // Yellow
        return '#f44336'; // Red
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h3>Confidence Meter</h3>
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden',
                margin: '10px 0'
            }}>
                <div style={{
                    width: `${confidenceScore}%`,
                    height: '100%',
                    backgroundColor: getMeterColor(),
                    transition: 'width 0.5s ease-in-out'
                }} />
            </div>
            <p>{confidenceScore}% Confidence</p>
        </div>
    );
};

export default ConfidenceMeter;