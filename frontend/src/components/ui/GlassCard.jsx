import React from 'react';

const GlassCard = ({ children, className = "", hoverEffect = false }) => {
    return (
        <div
            className={`
        glass rounded-2xl p-6 
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:scale-[1.02] hover:bg-white/20 hover:shadow-lg' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default GlassCard;
