import React from 'react';
import { motion } from 'framer-motion';

const PremiumCard = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -5, boxShadow: "0 0 30px rgba(0, 240, 255, 0.15)" }}
            className={`glass-liquid rounded-3xl p-6 relative overflow-hidden group ${className}`}
        >
            {/* Specular Highlight */}
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

            {children}
        </motion.div>
    );
};

export default PremiumCard;
