import { getSevenDaysFromToday } from '@/utils/dateUtils';
import { useEffect, useState } from 'react';
import TimeDisplay from './TimeDisplay';

export interface TimeState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ targetDate }: { targetDate?: string }) => {
  const [date, setDate] = useState<TimeState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const getTime = () => {
    const end = targetDate ? Date.parse(targetDate) : Date.parse(getSevenDaysFromToday());
    const time = Math.max(end - Date.now(), 0);

    setDate({
      days: Math.floor(time / (1000 * 60 * 60 * 24)),
      hours: Math.floor((time / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((time / 1000 / 60) % 60),
      seconds: Math.floor((time / 1000) % 60),
    });
  };

  useEffect(() => {
    const interval = setInterval(getTime, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  return (
    <div className="flex flex-wrap gap-6 mt-6">
      <TimeDisplay value={date.days} label="Days" />
      <TimeDisplay value={date.hours} label="Hours" />
      <TimeDisplay value={date.minutes} label="Minutes" />
      <TimeDisplay value={date.seconds} label="Seconds" />
    </div>
  );
}; 