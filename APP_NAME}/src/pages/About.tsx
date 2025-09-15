import React from 'react';

const About: React.FC = () => {
    return (
        <div className="about-page">
            <h1>About {APP_NAME}</h1>
            <p>
                {APP_NAME} is an image-authenticity tool designed to help users verify the authenticity of images. 
                Our platform provides a range of features including reverse image search, forensic analysis, and AI detection.
            </p>
            <h2>Our Mission</h2>
            <p>
                We aim to empower users with the tools they need to discern the truth behind images in an increasingly 
                digital world. With {APP_NAME}, you can easily upload images and receive detailed reports on their 
                authenticity.
            </p>
            <h2>Features</h2>
            <ul>
                <li>Reverse Image Search</li>
                <li>Forensic Analysis</li>
                <li>AI Detection</li>
                <li>User-friendly Interface</li>
            </ul>
            <h2>Contact Us</h2>
            <p>
                For more information, please reach out to us at support@{APP_NAME}.com.
            </p>
        </div>
    );
};

export default About;