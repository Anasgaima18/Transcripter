import React from 'react';

const GlassCard = ({ children, className = "", hoverEffect = false }) => {
    return (
        <div
            className={`
        glass-card rounded-3xl p-6 
        ${hoverEffect ? 'hover:scale-[1.02]' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default GlassCard;
