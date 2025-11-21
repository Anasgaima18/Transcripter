import React from 'react';
import { motion } from "framer-motion";
import PremiumCard from "./ui/PremiumCard";

export const StatsCard = ({ title, value, icon, subtitle, delay = 0 }) => {
  return (
    <PremiumCard className="relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#00F0FF] font-medium flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] group-hover:bg-[#00F0FF]/20 group-hover:scale-110 transition-all duration-300">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#00F0FF]/10 rounded-full blur-2xl group-hover:bg-[#00F0FF]/20 transition-all duration-500" />
    </PremiumCard>
  );
};

export const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default StatsCard;
