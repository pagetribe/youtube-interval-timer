import React, { useState } from 'react';
import YouTubeIcon from './icons/YouTubeIcon';
import ClockIcon from './icons/ClockIcon';
import { parseTimeToSeconds } from '../services/timeService';

interface InputFormProps {
  onSubmit: (config: { url: string, timestamp: number, duration: number, cooldownDuration: number }) => void;
  isProcessing: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isProcessing }) => {
  const [url, setUrl] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [duration, setDuration] = useState('0:35');
  const [cooldownDuration, setCooldownDuration] = useState('0:25');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter a YouTube URL.');
      return;
    }
    
    const totalSeconds = parseTimeToSeconds(timestamp);
    if (totalSeconds === null) {
      setError('Please enter a valid trigger time (e.g., 3:15 or 195).');
      return;
    }

    const durationNum = parseTimeToSeconds(duration);
    if (durationNum === null || durationNum <= 0) {
      setError('Please enter a valid timer duration (e.g., 0:35).');
      return;
    }

    const cooldownNum = parseTimeToSeconds(cooldownDuration);
    if (cooldownNum === null || cooldownNum < 0) {
      setError('Please enter a valid rest duration (e.g., 0:25).');
      return;
    }

    onSubmit({ url, timestamp: totalSeconds, duration: durationNum, cooldownDuration: cooldownNum });
  };

  return (
    <div className="w-full max-w-lg bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Setup Timer</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Video URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <YouTubeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="youtube-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-300 mb-2">
              Trigger Time (m:ss)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="timestamp"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="e.g., 3:15 or 195"
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5"
              />
            </div>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
              Timer (m:ss)
            </label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 0:35"
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
            />
          </div>
        </div>
        <div>
          <label htmlFor="cooldown" className="block text-sm font-medium text-gray-300 mb-2">
            Rest Duration (m:ss)
          </label>
          <input
              type="text"
              id="cooldown"
              value={cooldownDuration}
              onChange={(e) => setCooldownDuration(e.target.value)}
              placeholder="e.g., 0:25"
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
            />
        </div>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Loading...' : 'Load Video & Set Timer'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;