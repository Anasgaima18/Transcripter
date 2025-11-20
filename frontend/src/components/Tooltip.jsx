import React from 'react';

const Tooltip = ({ children, text, position = 'top' }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <span
        className={`
          absolute left-1/2 -translate-x-1/2 px-3 py-2
          bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 ease-out z-50 pointer-events-none
          ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
          
          after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent
          ${position === 'top'
            ? 'after:top-full after:border-t-slate-900'
            : 'after:bottom-full after:border-b-slate-900'
          }
        `}
      >
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
