import { useState, useEffect } from 'react';
import styled from 'styled-components';

const ToggleButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4),
              0 0 0 1px rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 9999;
  color: white;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover {
    transform: translateY(-8px) rotate(15deg) scale(1.1);
    box-shadow: 0 20px 45px rgba(139, 92, 246, 0.5),
                0 0 0 1px rgba(139, 92, 246, 0.3);
    
    &::before {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: translateY(-4px) rotate(15deg) scale(1.05);
  }

  body.light & {
    background: linear-gradient(135deg, #1f2937, #374151);
    border-color: rgba(55, 65, 81, 0.3);
    box-shadow: 0 15px 35px rgba(55, 65, 81, 0.4),
                0 0 0 1px rgba(55, 65, 81, 0.2);
                
    &:hover {
      box-shadow: 0 20px 45px rgba(55, 65, 81, 0.5),
                  0 0 0 1px rgba(55, 65, 81, 0.3);
    }
  }
`;

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ToggleButton
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </ToggleButton>
  );
};

export default ThemeToggle;