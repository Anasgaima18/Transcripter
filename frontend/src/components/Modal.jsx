import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 9998;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 200ms ease-out;
`;

const ModalBox = styled.div`
  background: #fff; border-radius: 1rem; box-shadow: 0 20px 60px rgba(2,6,23,0.2);
  max-width: 42rem; width: 90%; max-height: 90vh; overflow: hidden;
  animation: ${scaleIn} 220ms ease-out;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 2rem; border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h2`
  font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0;
`;

const Close = styled.button`
  color: #94a3b8; font-size: 1.25rem; padding: 0.25rem; border: 0; background: transparent; cursor: pointer;
  transition: color 160ms ease; &:hover { color: #475569; }
`;

const Content = styled.div`
  padding: 2rem; overflow-y: auto; max-height: calc(90vh - 140px);
`;

const Footer = styled.div`
  display: flex; gap: 0.75rem; justify-content: flex-end;
  padding: 1.25rem 2rem; border-top: 1px solid #e2e8f0;
`;

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <Close onClick={onClose} aria-label="Close modal">×</Close>
        </Header>
        <Content>{children}</Content>
        {footer && <Footer>{footer}</Footer>}
      </ModalBox>
    </Overlay>
  );
};

export default Modal;
