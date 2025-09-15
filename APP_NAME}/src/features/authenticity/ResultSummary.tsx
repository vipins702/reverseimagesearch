import React from 'react';

const ResultSummary: React.FC<{ results: any }> = ({ results }) => {
    return (
        <div className="result-summary">
            <h2>Result Summary</h2>
            <div className="summary-details">
                <p><strong>Image URL:</strong> {results.imageUrl}</p>
                <p><strong>Authenticity Status:</strong> {results.authenticityStatus}</p>
                <p><strong>Confidence Score:</strong> {results.confidenceScore}%</p>
            </div>
            <div className="summary-actions">
                <button onClick={() => window.alert('Save functionality not implemented yet.')}>Save</button>
                <button onClick={() => window.alert('Report functionality not implemented yet.')}>Report</button>
                <button onClick={() => window.alert('Share functionality not implemented yet.')}>Share</button>
            </div>
        </div>
    );
};

export default ResultSummary;