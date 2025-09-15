import React from 'react';
import { ImageUpload } from '../features/authenticity/ImageUpload';
import { ResultSummary } from '../features/authenticity/ResultSummary';
import { ConfidenceMeter } from '../features/authenticity/ConfidenceMeter';
import { ReverseSearchButtons } from '../components/ReverseSearchButtons';

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <h1>Welcome to the Image Authenticity Tool</h1>
            <p>Quick Links:</p>
            <ReverseSearchButtons />
            <ImageUpload />
            <ResultSummary />
            <ConfidenceMeter />
        </div>
    );
};

export default Home;