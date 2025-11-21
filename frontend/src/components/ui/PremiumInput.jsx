import React from 'react';

const PremiumInput = ({ label, id, type = "text", ...props }) => {
    return (
        <div className="relative group">
            <input
                id={id}
                type={type}
                className="peer w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder-transparent focus:outline-none focus:border-primary focus:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300"
                placeholder={label}
                {...props}
            />
            <label
                htmlFor={id}
                className="absolute left-4 -top-2.5 bg-[#050511] px-1 text-sm text-muted-foreground transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-primary peer-focus:text-sm"
            >
                {label}
            </label>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 peer-focus:opacity-100 pointer-events-none transition-opacity duration-500 blur-xl -z-10" />
        </div>
    );
};

export default PremiumInput;
