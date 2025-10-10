import React from 'react';
import styled, { css, keyframes } from 'styled-components';

// THEME TOKENS (can be centralized later)
const colors = {
  indigo: '#4f46e5',
  indigoDark: '#4338ca',
  purple: '#7c3aed',
  red: '#ef4444',
  redDark: '#dc2626',
  emerald: '#059669',
  emeraldDark: '#047857',
  slate900: '#0f172a',
  slate800: '#1f2937',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  white: '#ffffff',
};

const focusRing = (color = colors.indigo) => css`
  outline: none;
  box-shadow: 0 0 0 2px ${color}33, 0 0 0 4px ${color}55;
`;

// ========== BUTTON ==========
const ButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: transform 150ms ease, box-shadow 200ms ease, background 200ms ease, color 200ms ease;
  transform: translateZ(0);
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  ${(p) => {
    switch (p.$size) {
      case 'sm':
        return css`padding: 0.375rem 0.75rem; font-size: 0.875rem;`;
      case 'lg':
        return css`padding: 0.75rem 1.5rem; font-size: 1rem;`;
      case 'xl':
        return css`padding: 1rem 2rem; font-size: 1.125rem;`;
      default:
        return css`padding: 0.5rem 1rem; font-size: 0.95rem;`;
    }
  }}

  ${(p) => {
    switch (p.$variant) {
      case 'secondary':
        return css`
          background: ${colors.slate100};
          color: ${colors.slate800};
          border: 1px solid ${colors.slate200};
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          &:hover { background: #e9eef6; }
          &:focus-visible { ${focusRing('#94a3b8')} }
        `;
      case 'danger':
        return css`
          background: ${colors.red};
          color: ${colors.white};
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
          &:hover { background: ${colors.redDark}; }
          &:focus-visible { ${focusRing(colors.red)} }
        `;
      case 'success':
        return css`
          background: ${colors.emerald};
          color: ${colors.white};
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
          &:hover { background: ${colors.emeraldDark}; }
          &:focus-visible { ${focusRing(colors.emerald)} }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${colors.slate600};
          &:hover { background: ${colors.slate100}; }
          &:focus-visible { ${focusRing('#94a3b8')} }
        `;
      case 'primary':
      default:
        return css`
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: ${colors.white};
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4), 
                      0 0 0 1px rgba(139, 92, 246, 0.2);
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s ease;
          }
          
          &:hover {
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            box-shadow: 0 12px 30px rgba(139, 92, 246, 0.5),
                        0 0 0 1px rgba(139, 92, 246, 0.3);
            transform: translateY(-2px);
            
            &::before {
              left: 100%;
            }
          }
          
          &:focus-visible { ${focusRing('#8b5cf6')} }
        `;
    }
  }}
`;

// Modern Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '',
  ...props 
}) => {
  return (
    <ButtonBase $variant={variant} $size={size} className={className} disabled={disabled} {...props}>
      {children}
    </ButtonBase>
  );
};

// ========== CARD ==========
const CardBase = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.slate200};
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(2, 6, 23, 0.08);
  backdrop-filter: blur(6px);
  transition: box-shadow 200ms ease;
  &:hover { box-shadow: 0 14px 32px rgba(2, 6, 23, 0.12); }

  body.dark & {
    background: rgba(31, 41, 55, 0.8);
    border-color: #374151;
    color: #ffffff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    &:hover { box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4); }
  }
`;

export const Card = ({ children, className = '', ...props }) => (
  <CardBase className={className} {...props}>{children}</CardBase>
);

// Glass Card (translucent)
const GlassCardBase = styled.div`
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.6);
  box-shadow: 0 10px 25px rgba(2, 6, 23, 0.08);
  backdrop-filter: blur(10px);
`;

export const GlassCard = ({ children, className = '', ...props }) => (
  <GlassCardBase className={className} {...props}>{children}</GlassCardBase>
);

// Container (page width)
const ContainerBase = styled.div`
  max-width: 80rem; /* 1280px */
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
  @media (min-width: 640px) { padding-left: 1.5rem; padding-right: 1.5rem; }
  @media (min-width: 1024px) { padding-left: 2rem; padding-right: 2rem; }
`;

export const Container = ({ children, className = '' }) => (
  <ContainerBase className={className}>{children}</ContainerBase>
);

// Section Header
const SectionHeaderWrap = styled.div`
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.875rem; /* text-3xl */
  line-height: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, ${colors.slate900}, ${colors.slate700});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionSubtitle = styled.p`
  color: ${colors.slate600};
  max-width: 42rem;
  margin: 0.25rem auto 0;
`;

export const SectionHeader = ({ title, subtitle, icon, className = '' }) => (
  <SectionHeaderWrap className={className}>
    <SectionTitle>
      {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
      {title}
    </SectionTitle>
    {subtitle && <SectionSubtitle>{subtitle}</SectionSubtitle>}
  </SectionHeaderWrap>
);

// Alert banner
const alertStyles = {
  info: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  success: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  warning: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  danger: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
};

const AlertBase = styled.div`
  border-radius: 0.75rem;
  border: 1px solid ${(p) => alertStyles[p.$variant].border};
  background: ${(p) => alertStyles[p.$variant].bg};
  color: ${(p) => alertStyles[p.$variant].text};
  padding: 0.75rem 1rem;
`;

export const Alert = ({ variant = 'info', children, className = '' }) => (
  <AlertBase $variant={variant} className={className}>{children}</AlertBase>
);

// Badge/Pill
const BadgeBase = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: #f1f5f9; /* slate-100 */
  color: #334155; /* slate-700 */
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

export const Badge = ({ children, className = '' }) => (
  <BadgeBase className={className}>{children}</BadgeBase>
);

const PillBase = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid #e2e8f0; /* slate-200 */
  background: rgba(255,255,255,0.7);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #334155; /* slate-700 */
  box-shadow: 0 1px 2px rgba(2,6,23,0.04);
`;

export const Pill = ({ children, className = '' }) => (
  <PillBase className={className}>{children}</PillBase>
);

// Modern Input Component
const FieldWrap = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.slate700};
  margin-bottom: 0.25rem;

  body.dark & {
    color: #e5e7eb;
  }
`;

const InputBase = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  color: ${colors.slate900};
  border: 1px solid ${(p) => (p.$error ? '#f87171' : colors.slate300)};
  border-radius: 0.75rem;
  background: ${colors.white};
  box-shadow: 0 1px 2px rgba(2,6,23,0.04);
  &::placeholder { color: ${colors.slate500}; }
  &:focus-visible { ${focusRing(colors.indigo)}; border-color: ${colors.indigo}; }

  body.dark & {
    background: #374151;
    border-color: #4b5563;
    color: #ffffff;
    &::placeholder { color: #9ca3af; }
  }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

export const Input = ({ label, error, className = '', ...props }) => (
  <FieldWrap className={className}>
    {label && <Label>{label}</Label>}
    <InputBase $error={!!error} {...props} />
    {error && <ErrorText>⚠️ {error}</ErrorText>}
  </FieldWrap>
);

const TextAreaBase = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  color: ${colors.slate900};
  border: 1px solid ${(p) => (p.$error ? '#f87171' : colors.slate300)};
  border-radius: 0.75rem;
  background: ${colors.white};
  box-shadow: 0 1px 2px rgba(2,6,23,0.04);
  &::placeholder { color: ${colors.slate500}; }
  &:focus-visible { ${focusRing(colors.indigo)}; border-color: ${colors.indigo}; }
`;

export const TextArea = ({ label, error, className = '', rows = 5, ...props }) => (
  <FieldWrap className={className}>
    {label && <Label>{label}</Label>}
    <TextAreaBase rows={rows} $error={!!error} {...props} />
    {error && <ErrorText>⚠️ {error}</ErrorText>}
  </FieldWrap>
);

// Modern Select Component
const SelectBase = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  color: ${colors.slate900};
  border: 1px solid ${colors.slate300};
  border-radius: 0.75rem;
  background: ${colors.white};
  box-shadow: 0 1px 2px rgba(2,6,23,0.04);
  cursor: pointer;
  &:focus-visible { ${focusRing(colors.indigo)}; border-color: ${colors.indigo}; }
`;

export const Select = ({ label, options, placeholder, className = '', children, ...props }) => (
  <FieldWrap className={className}>
    {label && <Label>{label}</Label>}
    <SelectBase {...props}>
      {placeholder && <option value="" disabled hidden>{placeholder}</option>}
      {Array.isArray(options) && options.length > 0
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))
        : children}
    </SelectBase>
  </FieldWrap>
);

// Record Button Component
const ping = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  70% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
`;

const pulseRecord = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const RecordButtonBase = styled.button`
  position: relative;
  width: 6rem; /* 24 */
  height: 6rem; /* 24 */
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
  border: none;
  color: #fff;
  background: ${(p) => (p.$isRecording ? 
    'linear-gradient(135deg, #dc2626, #ef4444)' : 
    'linear-gradient(135deg, #ef4444, #f87171)')};
  box-shadow: 0 15px 35px rgba(239, 68, 68, 0.4),
              0 0 0 1px rgba(239, 68, 68, 0.2);
  overflow: hidden;
  
  ${(p) => !p.$isRecording && css`
    &:hover { 
      transform: translateY(-6px) scale(1.05); 
      background: linear-gradient(135deg, #dc2626, #ef4444);
      box-shadow: 0 20px 45px rgba(239, 68, 68, 0.5),
                  0 0 0 1px rgba(239, 68, 68, 0.3);
    }
  `}
  
  ${(p) => p.$isRecording && css`
    animation: ${pulseRecord} 2s ease-in-out infinite;
    
    &::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: inherit;
      background: conic-gradient(from 0deg, #ef4444, #f87171, #dc2626, #ef4444);
      animation: rotate 3s linear infinite;
      z-index: -1;
    }
    
    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }
  `}
  
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    ${(p) => p.$isRecording ? css`
      opacity: 1;
      animation: ${ping} 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    ` : ''}
  }
`;

export const RecordButton = ({ isRecording, onClick, disabled }) => (
  <RecordButtonBase onClick={onClick} disabled={disabled} aria-pressed={isRecording} $isRecording={isRecording}>
    <VisuallyHidden>{isRecording ? 'Stop recording' : 'Start recording'}</VisuallyHidden>
    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  </RecordButtonBase>
);

const VisuallyHidden = styled.span`
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
`;

// Language Badge Component
const slideUp = keyframes`
  from { transform: translateY(6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const LanguageBadgeBase = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid ${(p) => (p.$detected ? '#a7f3d0' : '#bfdbfe')};
  color: ${(p) => (p.$detected ? '#065f46' : '#1e40af')};
  background: ${(p) => (p.$detected ? '#d1fae5' : '#dbeafe')};
  animation: ${slideUp} 200ms ease both;
`;

export const LanguageBadge = ({ language, confidence, isDetected = false }) => {
  if (!language) return null;
  return (
    <LanguageBadgeBase $detected={isDetected}>
      <span style={{ fontSize: '1rem' }}>{isDetected ? '✅' : language.emoji}</span>
      <span>{language.name}</span>
      {confidence && (
        <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{Math.round(confidence * 100)}%</span>
      )}
    </LanguageBadgeBase>
  );
};

// Timer Component
const TimerWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9; /* slate-100 */
  border: 1px solid #e2e8f0; /* slate-200 */
  border-radius: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: #334155; /* slate-700 */
`;

export const Timer = ({ seconds }) => {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TimerWrap>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{formatTime(seconds)}</span>
    </TimerWrap>
  );
};