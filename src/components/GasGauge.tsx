import React from 'react';
import StatusDisplay from './StatusDisplay';

// Define the interface for the component's props
interface GasGaugeProps {
  value?: number;       // Current value - optional with default
  min?: number;       // Minimum value - optional with default
  max?: number;       // Maximum value - optional with default
  label?: string;     // Label text - optional with default
  unit?: string;      // Unit text - optional with default
}

// Define the segment structure type (though simple here)
interface Segment {
  color: string;
}

// Define the Gauge Component using React.FC and the Props interface
const GasGauge: React.FC<GasGaugeProps> = ({
  value = 25.02,    // Default value
  min = 0,          // Default minimum
  max = 50,         // Default maximum (adjust as needed)
  label = "Temperature", // Default label
  unit = "°C"        // Default unit
}) => {

  // 1. Calculate rotation for the needle
  // Clamp value within min/max
  const clampedValue: number = Math.max(min, Math.min(value, max));
  // Calculate percentage (0 to 1)
  const percentage: number = (max - min) === 0 ? 0 : (clampedValue - min) / (max - min); // Avoid division by zero
  // Calculate angle: 180 degrees span (-90 is left, 0 is top, 90 is right)
  const angle: number = percentage * 180 - 90;

  // 2. Define Segments (customize colors and number)
  const numSegments: number = 10;
  const segmentAngleStep: number = 180 / numSegments;
  // Approximate colors from the image - adjust these Tailwind colors as needed
  const segments: Segment[] = [ // Use the Segment interface
    { color: 'bg-yellow-400' }, { color: 'bg-yellow-400' },        // Yellow
    { color: 'bg-yellow-400' },   { color: 'bg-zinc-200' },   { color: 'bg-zinc-200' }, // Greens
    { color: 'bg-zinc-200' },    { color: 'bg-zinc-200' },    { color: 'bg-red-600' },
    { color: 'bg-red-600' },    { color: 'bg-red-600' },
  ];

  // Determine the radius for positioning segments (adjust as needed for size)
  const segmentRadiusOffset: string = '68px'; // Use string for inline style, adjust this pixel value!

  return (
    <div className="flex flex-col items-center p-4  w-full max-w-40"> {/* Main container */}

      {/* Title */}
      <StatusDisplay text={label} className='text-[18px] p-0' />

      {/* Gauge Area */}
      <div className="relative w-45 aspect-[2/1] overflow-hidden mb-2 mt-4"> {/* Width defines size, aspect ratio keeps it semi-circular */}
        {/* Segments Container */}
        <div className="absolute inset-0 flex justify-center items-end">
            {segments.map((segment, index) => {
              // Calculate the rotation for the center of each segment
              const segmentRotation: number = -90 + (index + 0.5) * segmentAngleStep;
              return (
                <div
                  key={index + "_" + segment.color}
                  className={`absolute bottom-0 left-1/2 w-4 h-4 ${segment.color} origin-bottom transform -translate-x-1/2 border border-gray-700 border-opacity-30`} // Segment style
                  style={{
                    transform: `rotate(${segmentRotation}deg) translateY(-${segmentRadiusOffset})`,
                    transformOrigin: 'bottom center',
                  }}
                />
              );
            })}
        </div>

        {/* Needle */}
        <div
            className="absolute bottom-0 left-1/2 w-1 h-10 bg-gray-800 origin-bottom rounded-t-full transform -translate-x-1/2 shadow-md" // Needle style
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'bottom center',
            }}
        >
        </div>

         {/* Pivot */}
         <div className="absolute bottom-0 left-1/2 w-5 h-5 bg-gray-300 border-2 border-gray-400 rounded-full transform -translate-x-1/2 translate-y-1/2 shadow-inner"></div> {/* Pivot style */}

      </div>

      {/* Value Display */}
      <div className="mt-2 px-4 py-1 bg-yellow-400 rounded shadow text-center font-bold text-lg text-gray-800">
        {clampedValue.toFixed(2)}{unit} {/* Display clamped value */}
      </div>
    </div>
  );
};

export default GasGauge;