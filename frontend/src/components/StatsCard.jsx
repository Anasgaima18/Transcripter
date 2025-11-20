import React from 'react';
import GlassCard from './ui/GlassCard';

export const StatsCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <GlassCard className="p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
      </div>

      {/* Background Decoration */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </GlassCard>
  );
};

export const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsCard;
