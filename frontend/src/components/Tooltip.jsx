import React from 'react';
import styled, { css } from 'styled-components';

const Wrap = styled.div`
  position: relative; display: inline-block;
  &:hover > span { opacity: 1; visibility: visible; }
`;

const Bubble = styled.span`
  position: absolute; left: 50%; transform: translateX(-50%);
  background: #0f172a; color: #fff; font-size: 0.875rem; padding: 0.5rem 0.75rem;
  border-radius: 0.5rem; white-space: nowrap; opacity: 0; visibility: hidden;
  transition: opacity 160ms ease;
  z-index: 1000; pointer-events: none;
  ${(p) => p.$pos === 'top' ? css`bottom: 100%; margin-bottom: 0.5rem;` : css`top: 100%; margin-top: 0.5rem;`}

  &::after {
    content: '';
    position: absolute; left: 50%; transform: translateX(-50%);
    border: 6px solid transparent;
    ${(p) => p.$pos === 'top' ? css`top: 100%; border-top-color: #0f172a;` : css`bottom: 100%; border-bottom-color: #0f172a;`}
  }
`;

const Tooltip = ({ children, text, position = 'top' }) => {
  return (
    <Wrap>
      {children}
      <Bubble $pos={position}>{text}</Bubble>
    </Wrap>
  );
};

export default Tooltip;
