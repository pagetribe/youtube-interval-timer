import React from 'react';
import { Preset } from '../types';
import YouTubeIcon from './icons/YouTubeIcon';
import { formatSecondsToTime } from '../services/timeService';

interface PresetManagerProps {
  presets: (Preset | null)[];
  onLoad: (slotIndex: number) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onLoad }) => {
  return (
    <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
      <h3 className="text-xl font-bold text-center text-white mb-4">Saved Presets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset, index) => (
          <div key={index} className="bg-gray-700 p-4 rounded-lg flex flex-col min-h-[230px]">
            <div>
              <h4 className="font-bold text-white h-12 overflow-hidden" title={preset?.title || `Preset ${index + 1}`}>
                {preset?.title || `Preset ${index + 1}`}
              </h4>
              {preset ? (
                <div className="text-sm text-gray-300 space-y-1 overflow-hidden">
                   <div className="flex items-center gap-2">
                     <YouTubeIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                     <p className="truncate" title={preset.url}>{preset.url}</p>
                   </div>
                   <p><span className="font-semibold">Trigger:</span> {formatSecondsToTime(preset.triggerTimestamp)}</p>
                   {preset.intervals ? (
                     <p><span className="font-semibold">Timer:</span> {preset.intervals.length} varied intervals</p>
                   ) : (
                     <p><span className="font-semibold">Timer:</span> {formatSecondsToTime(preset.duration!)} / {formatSecondsToTime(preset.cooldownDuration!)}</p>
                   )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-4">Empty Slot</p>
              )}
            </div>
            <div className="text-sm mt-auto">
                <button
                    onClick={() => onLoad(index)}
                    disabled={!preset}
                    className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg px-4 py-2 text-center transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Load
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresetManager;