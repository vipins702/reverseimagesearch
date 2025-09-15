import React from 'react';

const Header: React.FC = () => {
    return (
        <header style={{ backgroundColor: '#047857', padding: '1rem', textAlign: 'center' }}>
            <h1 style={{ color: '#ffffff' }}>Image Authenticity Tool</h1>
            <nav>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li style={{ display: 'inline', margin: '0 1rem' }}>
                        <a href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</a>
                    </li>
                    <li style={{ display: 'inline', margin: '0 1rem' }}>
                        <a href="/about" style={{ color: '#ffffff', textDecoration: 'none' }}>About</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;