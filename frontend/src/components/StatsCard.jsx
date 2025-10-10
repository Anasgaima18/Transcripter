import React from 'react';
import styled from 'styled-components';
import { Card, Badge } from './ui';

const Row = styled.div`
  display: flex; align-items: flex-start; gap: 0.75rem;
`;

const IconWrap = styled.div`
  width: 2.5rem; height: 2.5rem; border-radius: 0.75rem;
  background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center;
  font-size: 1.125rem;
`;

const Title = styled.div`
  color: #475569; font-size: 0.9rem;
`;

const Value = styled.div`
  color: #0f172a; font-size: 1.5rem; font-weight: 600;
`;

const Meta = styled.div`
  display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;
`;

const Grid = styled.div`
  display: grid; gap: 1rem; grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
`;

const StatsCard = ({ icon, title, value, subtitle, trend }) => {
  const trendPositive = (trend ?? 0) >= 0;
  return (
    <Card className="p-4">
      <Row>
        <IconWrap>{icon}</IconWrap>
        <div style={{ flex: 1 }}>
          <Title>{title}</Title>
          <Value>{value}</Value>
          <Meta>
            {subtitle && <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{subtitle}</div>}
            {typeof trend === 'number' && (
              <Badge style={{ background: trendPositive ? '#d1fae5' : '#fee2e2', color: trendPositive ? '#047857' : '#b91c1c' }}>
                {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
              </Badge>
            )}
          </Meta>
        </div>
      </Row>
    </Card>
  );
};

export const StatsGrid = ({ stats }) => (
  <Grid>
    {stats.map((stat, i) => (
      <div key={i}>
        <StatsCard {...stat} />
      </div>
    ))}
  </Grid>
);

export default StatsCard;
