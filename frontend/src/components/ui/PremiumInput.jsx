import React from 'react';

const PremiumInput = ({
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    className = "",
    id
}) => {
    return (
        <div className={`relative group ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-muted-foreground mb-2 ml-1"
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="
          w-full px-4 py-3 rounded-xl
          bg-white/5 border border-white/10
          text-foreground placeholder:text-muted-foreground/50
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
          transition-all duration-300
          glass
        "
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-xl" />
        </div>
    );
};

export default PremiumInput;
