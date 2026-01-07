import React, { useEffect, useRef } from 'react';
import { useBeep } from '../hooks/useBeep';

interface TimerProps {
  duration?: number;
  cooldownDuration?: number;
  intervals?: number[];
  triggerTimestamp: number;
  currentTime: number;
}

const GET_READY_SECONDS = 4;
const FINISHING_SECONDS = 4;
const PREPARING_SECONDS = 4; // Beep for this many seconds before the next cycle

const Timer: React.FC<TimerProps> = ({ duration, cooldownDuration, intervals, triggerTimestamp, currentTime }) => {
  const { playBeeps } = useBeep();
  const lastBeepKeyRef = useRef<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const timeSinceTrigger = currentTime - triggerTimestamp;

  let displayedTime: number;
  let status: 'starting' | 'running' | 'finishing' | 'cooldown' | 'preparing' | 'done';
  let progress = 0;
  let circleColorClass: string;
  let cycleOrIntervalIndex: number;

  if (intervals && intervals.length > 0) {
    // Logic for varied intervals
    let cumulativeTime = 0;
    let currentIntervalIndex = -1;
    let timeIntoInterval = 0;
    const totalDuration = intervals.reduce((a, b) => a + b, 0);

    if (timeSinceTrigger >= totalDuration || timeSinceTrigger < 0) {
      currentIntervalIndex = -1;
    } else {
      for (let i = 0; i < intervals.length; i++) {
        const intervalDuration = intervals[i];
        if (timeSinceTrigger < cumulativeTime + intervalDuration) {
          currentIntervalIndex = i;
          timeIntoInterval = timeSinceTrigger - cumulativeTime;
          break;
        }
        cumulativeTime += intervalDuration;
      }
    }
    cycleOrIntervalIndex = currentIntervalIndex;

    if (currentIntervalIndex === -1) {
      status = 'done';
      displayedTime = 0;
      circleColorClass = 'stroke-gray-400';
      progress = 1;
    } else {
      const currentIntervalDuration = intervals[currentIntervalIndex];
      displayedTime = Math.max(0, currentIntervalDuration - Math.floor(timeIntoInterval));
      progress = (currentIntervalDuration - timeIntoInterval) / currentIntervalDuration;

      const isWorkInterval = currentIntervalIndex % 2 !== 0;

      if (currentIntervalIndex === 0) {
        status = 'starting';
        circleColorClass = 'stroke-yellow-400';
      } else if (isWorkInterval) { // Work interval
        if (displayedTime <= FINISHING_SECONDS && displayedTime >= 1) {
          status = 'finishing';
          circleColorClass = 'stroke-red-400';
        } else {
          status = 'running';
          circleColorClass = 'stroke-green-400';
        }
      } else { // Rest interval
        if (displayedTime <= PREPARING_SECONDS && displayedTime >= 1) {
          status = 'preparing';
          circleColorClass = 'stroke-purple-400';
        } else {
          status = 'cooldown';
          circleColorClass = 'stroke-blue-400';
        }
      }
    }
  } else if (duration !== undefined && cooldownDuration !== undefined) {
    // Existing logic for fixed duration/cooldown
    const firstCycleDuration = GET_READY_SECONDS + duration + cooldownDuration;
    const subsequentCycleDuration = duration + cooldownDuration;

    let currentCycleIndex: number;
    let timeIntoCycle: number;
    let isFirstCycle: boolean;

    if (timeSinceTrigger < firstCycleDuration) {
      currentCycleIndex = 0;
      timeIntoCycle = timeSinceTrigger;
      isFirstCycle = true;
    } else {
      const timeAfterFirstCycle = timeSinceTrigger - firstCycleDuration;
      currentCycleIndex = 1 + Math.floor(timeAfterFirstCycle / subsequentCycleDuration);
      timeIntoCycle = timeAfterFirstCycle % subsequentCycleDuration;
      isFirstCycle = false;
    }
    cycleOrIntervalIndex = currentCycleIndex;

    if (isFirstCycle) {
      const startOfMainTimer = GET_READY_SECONDS;
      const startOfCooldown = startOfMainTimer + duration;
      const startOfPreparing = startOfCooldown + cooldownDuration - PREPARING_SECONDS;

      if (timeIntoCycle < startOfMainTimer) {
        status = 'starting';
        circleColorClass = 'stroke-yellow-400';
        displayedTime = GET_READY_SECONDS - Math.floor(timeIntoCycle);
        progress = (GET_READY_SECONDS - timeIntoCycle) / GET_READY_SECONDS;
      } else if (timeIntoCycle < startOfCooldown) {
        const timeIntoMainCountdown = timeIntoCycle - startOfMainTimer;
        displayedTime = Math.max(0, duration - Math.floor(timeIntoMainCountdown));
        if (displayedTime <= FINISHING_SECONDS && displayedTime >= 1) {
          status = 'finishing';
          circleColorClass = 'stroke-red-400';
        } else {
          status = 'running';
          circleColorClass = 'stroke-green-400';
        }
        progress = (duration - timeIntoMainCountdown) / duration;
      } else if (timeIntoCycle < startOfPreparing) {
        status = 'cooldown';
        circleColorClass = 'stroke-blue-400';
        const timeIntoCooldown = timeIntoCycle - startOfCooldown;
        displayedTime = Math.max(0, cooldownDuration - Math.floor(timeIntoCooldown));
        progress = (cooldownDuration - timeIntoCooldown) / cooldownDuration;
      } else {
        status = 'preparing';
        circleColorClass = 'stroke-purple-400';
        const timeIntoCooldown = timeIntoCycle - startOfCooldown;
        displayedTime = Math.max(0, cooldownDuration - Math.floor(timeIntoCooldown));
        progress = (cooldownDuration - timeIntoCooldown) / cooldownDuration;
      }
    } else {
      const startOfMainTimer = 0;
      const startOfCooldown = startOfMainTimer + duration;
      const startOfPreparing = startOfCooldown + cooldownDuration - PREPARING_SECONDS;

      if (timeIntoCycle < startOfCooldown) {
        const timeIntoMainCountdown = timeIntoCycle - startOfMainTimer;
        displayedTime = Math.max(0, duration - Math.floor(timeIntoMainCountdown));
        if (displayedTime <= FINISHING_SECONDS && displayedTime >= 1) {
          status = 'finishing';
          circleColorClass = 'stroke-red-400';
        } else {
          status = 'running';
          circleColorClass = 'stroke-green-400';
        }
        progress = (duration - timeIntoMainCountdown) / duration;
      } else if (timeIntoCycle < startOfPreparing) {
        status = 'cooldown';
        circleColorClass = 'stroke-blue-400';
        const timeIntoCooldown = timeIntoCycle - startOfCooldown;
        displayedTime = Math.max(0, cooldownDuration - Math.floor(timeIntoCooldown));
        progress = (cooldownDuration - timeIntoCooldown) / cooldownDuration;
      } else {
        status = 'preparing';
        circleColorClass = 'stroke-purple-400';
        const timeIntoCooldown = timeIntoCycle - startOfCooldown;
        displayedTime = Math.max(0, cooldownDuration - Math.floor(timeIntoCooldown));
        progress = (cooldownDuration - timeIntoCooldown) / cooldownDuration;
      }
    }
  } else {
    return null; // Should not happen with valid props
  }

  progress = Math.max(0, Math.min(1, progress));

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  // Effect to handle audio cues
  useEffect(() => {
    const currentStatus = status;
    const previousStatus = prevStatusRef.current;

    if (previousStatus && currentStatus !== previousStatus) {
      if ((currentStatus === 'running' || currentStatus === 'cooldown') && previousStatus !== 'done') {
        playBeeps(1, 523, 1000, 250, 'sine');
      }
    }
    
    const beepKey = `${cycleOrIntervalIndex}-${status}-${displayedTime}`;
    if (lastBeepKeyRef.current !== beepKey) {
      if (status === 'starting' || status === 'preparing') {
        playBeeps(1, 660, 100);
        lastBeepKeyRef.current = beepKey;
      } else if (status === 'finishing') {
        playBeeps(1, 880, 150);
        lastBeepKeyRef.current = beepKey;
      }
    }

    prevStatusRef.current = currentStatus;
  }, [cycleOrIntervalIndex, status, displayedTime, playBeeps]);

  return (
    <div className="absolute top-4 right-4 w-28 h-28 md:w-32 md:h-32 pointer-events-none z-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="10"
          className="stroke-gray-600/50"
          fill="rgba(30, 30, 30, 0.75)"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="10"
          fill="transparent"
          className={`transform -rotate-90 origin-center transition-stroke-dashoffset duration-300 ease-linear ${circleColorClass}`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        {/* Text in the middle */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          dy="0.1em"
          className="text-5xl font-extrabold fill-white"
        >
          {displayedTime}
        </text>
      </svg>
    </div>
  );
};

export default Timer;