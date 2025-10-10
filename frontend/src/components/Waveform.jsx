import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 100%; display: flex; align-items: center; justify-content: center; padding: 1.5rem 0;
`;

const Bars = styled.div`
  height: 6rem; width: 100%; max-width: 48rem; display: flex; align-items: flex-end; gap: 0.25rem;
`;

const Bar = styled.div`
  flex: 1; border-radius: 9999px; background: linear-gradient(to bottom, #818cf8, #60a5fa);
  transition: height 180ms ease;
`;

const Waveform = ({ isRecording, audioLevel = 0.5 }) => {
  const [bars, setBars] = useState([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const initialBars = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      height: Math.random() * 30 + 20,
      delay: i * 0.05,
    }));
    setBars(initialBars);
  }, []);

  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        setBars((prevBars) =>
          prevBars.map((bar) => ({
            ...bar,
            height: Math.random() * 60 * audioLevel + 20,
          }))
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Reset to idle state
      setBars((prevBars) =>
        prevBars.map((bar) => ({
          ...bar,
          height: 20,
        }))
      );
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioLevel]);

  return (
    <Wrap>
      <Bars>
        {bars.map((bar) => (
          <Bar key={bar.id} style={{ height: `${bar.height}%`, transitionDelay: `${bar.delay}s` }} />
        ))}
      </Bars>
    </Wrap>
  );
};

export default Waveform;
