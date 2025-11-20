import React from 'react';

const PremiumButton = ({
    children,
    onClick,
    variant = 'primary',
    className = "",
    disabled = false,
    type = "button"
}) => {
    const baseStyles = "relative overflow-hidden rounded-xl px-6 py-3 font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        glass: "glass hover:bg-white/20 text-foreground",
        gradient: "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-none"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default PremiumButton;
