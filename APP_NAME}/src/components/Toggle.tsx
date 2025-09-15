import React from 'react';

interface ToggleProps {
  isChecked: boolean;
  onToggle: () => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ isChecked, onToggle, label }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="hidden"
          checked={isChecked}
          onChange={onToggle}
        />
        <div className={`block bg-gray-300 w-14 h-8 rounded-full ${isChecked ? 'bg-[#047857]' : ''}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isChecked ? 'transform translate-x-full' : ''}`}
        ></div>
      </div>
      <span className="ml-3 text-gray-700">{label}</span>
    </label>
  );
};

export default Toggle;