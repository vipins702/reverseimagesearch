import React from 'react';

interface BadgeProps {
    label: string;
    color?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, color = '#047857' }) => {
    return (
        <span style={{
            backgroundColor: color,
            color: '#fff',
            padding: '0.5em 1em',
            borderRadius: '12px',
            fontSize: '0.875rem',
            display: 'inline-block',
        }}>
            {label}
        </span>
    );
};

export default Badge;