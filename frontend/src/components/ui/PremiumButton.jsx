import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const PremiumButton = ({ children, onClick, className = "", variant = "primary", type = "button", disabled = false }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) * 0.2; // Magnetic strength
        const y = (clientY - (top + height / 2)) * 0.2;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variants = {
        primary: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:shadow-[0_0_30px_rgba(112,0,255,0.6)]",
        outline: "border border-primary/50 text-primary hover:bg-primary/10",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5"
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            onClick={onClick}
            disabled={disabled}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
        relative px-8 py-3 rounded-xl font-semibold tracking-wide transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
        >
            {children}
        </motion.button>
    );
};

export default PremiumButton;
