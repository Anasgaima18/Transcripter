import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Line = styled.div`
  height: 1rem; background: #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

const Box = styled.div`
  background: #e2e8f0; border-radius: 0.75rem; animation: ${pulse} 1.4s ease-in-out infinite;
`;

const Circle = styled.div`
  background: #e2e8f0; border-radius: 9999px; animation: ${pulse} 1.4s ease-in-out infinite;
`;

const Panel = styled.div`
  background: #fff; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; margin-bottom: 1rem;
`;

export const SkeletonText = ({ lines = 3, width = '100%' }) => (
  <div style={{ width }}>
    {Array.from({ length: lines }).map((_, index) => (
      <Line key={index} />
    ))}
  </div>
);

export const SkeletonTitle = ({ width = '60%' }) => (
  <Box style={{ height: '2rem', width, marginBottom: '1rem' }} />
);

export const SkeletonAvatar = ({ size = 48 }) => (
  <Circle style={{ width: size, height: size }} />
);

export const SkeletonCard = ({ height = 200 }) => (
  <Box style={{ height }} />
);

export const TranscriptionCardSkeleton = () => (
  <Panel>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <Box style={{ height: '1rem', width: '8rem' }} />
      <Box style={{ height: '1rem', width: '5rem' }} />
    </div>
    <SkeletonText lines={2} />
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
      <Box style={{ height: '1rem', width: '6rem' }} />
      <Box style={{ height: '1rem', width: '6rem' }} />
    </div>
  </Panel>
);

export const DashboardSkeleton = () => (
  <div>
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonTitle width="30%" />
    </div>
    <div style={{ display: 'grid', gap: '1rem' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <TranscriptionCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

const Skeleton = { Text: SkeletonText, Title: SkeletonTitle, Avatar: SkeletonAvatar, Card: SkeletonCard, TranscriptionCard: TranscriptionCardSkeleton, Dashboard: DashboardSkeleton };

export default Skeleton;
