import React from 'react';

const Pulse = ({ className = "", ...props }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${className}`} {...props} />
);

export const SkeletonText = ({ lines = 3, width = '100%' }) => (
  <div style={{ width }}>
    {Array.from({ length: lines }).map((_, index) => (
      <Pulse key={index} className="h-4 rounded-lg mb-2 last:mb-0" />
    ))}
  </div>
);

export const SkeletonTitle = ({ width = '60%' }) => (
  <Pulse className="h-8 rounded-xl mb-4" style={{ width }} />
);

export const SkeletonAvatar = ({ size = 48 }) => (
  <Pulse className="rounded-full" style={{ width: size, height: size }} />
);

export const SkeletonCard = ({ height = 200 }) => (
  <Pulse className="rounded-2xl" style={{ height }} />
);

export const TranscriptionCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
    <div className="flex justify-between mb-4">
      <Pulse className="h-4 w-32 rounded" />
      <Pulse className="h-4 w-20 rounded" />
    </div>
    <SkeletonText lines={2} />
    <div className="flex gap-4 mt-4">
      <Pulse className="h-4 w-24 rounded" />
      <Pulse className="h-4 w-24 rounded" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div>
    <div className="mb-8">
      <SkeletonTitle width="30%" />
    </div>
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <TranscriptionCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

const Skeleton = {
  Text: SkeletonText,
  Title: SkeletonTitle,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
  TranscriptionCard: TranscriptionCardSkeleton,
  Dashboard: DashboardSkeleton
};

export default Skeleton;
