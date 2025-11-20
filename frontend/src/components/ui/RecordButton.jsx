import React from 'react';

const RecordButton = ({ isRecording, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative w-24 h-24 rounded-full flex items-center justify-center
        transition-all duration-300 ease-out outline-none border-none
        ${isRecording
                    ? 'bg-gradient-to-br from-red-600 to-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)] animate-pulse'
                    : 'bg-gradient-to-br from-red-500 to-red-400 shadow-lg shadow-red-500/40 hover:shadow-red-500/50 hover:-translate-y-1 hover:scale-105'
                }
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      `}
            aria-pressed={isRecording}
        >
            <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
            <div className={`
        absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300
        ${isRecording ? 'opacity-100 animate-ping' : ''}
      `} />
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white z-10">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </button>
    );
};

export default RecordButton;
