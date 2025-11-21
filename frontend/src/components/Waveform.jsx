import { useEffect, useRef, useState } from 'react';

const Waveform = ({ isRecording, audioLevel = 0.5 }) => {
  const [bars, setBars] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      height: Math.random() * 30 + 20,
      delay: i * 0.05
    }))
  );
  const animationRef = useRef(null);

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
    <div className="w-full flex items-center justify-center py-8">
      <div className="h-24 w-full max-w-3xl flex items-end gap-1 px-4">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className="flex-1 rounded-full bg-gradient-to-t from-[#00F0FF] to-[#7000FF] transition-[height] duration-100 ease-linear opacity-80 hover:opacity-100 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            style={{
              height: `${bar.height}%`,
              minHeight: '10%'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Waveform;
