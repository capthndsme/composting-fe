import { useGetHistoryData } from '../hooks/useServerApi';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import StatusDisplay from './StatusDisplay';
import { useState } from 'react';

export type GraphableType =
  | "humidity"
  | "ph_level"
  | "temperature"
  | "soil_moisture";
  const typeLabels = {
    soil_moisture: 'Soil Moisture',
    humidity: 'Humidity',
    ph_level: 'pH Level',
    temperature: 'Temperature'
  };
  
  const typeUnits = {
    soil_moisture: '%',
    humidity: '%',
    ph_level: '',
    temperature: '°C'
  };



  const MonitoringHistoryPage = () => {
  const [selectedType, setSelectedType] = useState('soil_moisture');
  const [currentPage, setCurrentPage] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const itemsPerPage = 7; // 7 days per page as intended
  
  // Calculate the date range for the current page
  const today = new Date();
  
  // For page 0: today to today-6 (7 days)
  // For page 1: today-7 to today-13 (7 days)
  // For page 2: today-14 to today-20 (7 days)
  const startOffset = currentPage * itemsPerPage;
  const endOffset = startOffset + itemsPerPage - 1;

  // Start date is the older date (further back in time)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - endOffset);
  
  // End date is the newer date (closer to today)
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - startOffset);

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  console.log(`Page ${currentPage}: ${startDateString} to ${endDateString}`);

  // Now pass these to your hook
  const { data: historyData, isLoading, error } = useGetHistoryData(
    selectedType, 
    startDateString, 
    endDateString
  );

  // Generate dates for display (from newest to oldest within the page)
  const generateDates = (page = 0) => {
    const dates = [];
    const today = new Date();
    const startOffset = page * itemsPerPage;
   
    for (let i = startOffset; i < startOffset + itemsPerPage; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push({
        dayNumber: i + 1,
        dateString: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      });
    }
   
    return dates;
  };
  
  const dates = generateDates(currentPage);
  
  // Create a map of date to data for easy lookup
  const dataMap = new Map();
  if (historyData) {
    historyData.forEach(item => {
      dataMap.set(item.day, item);
    });
  }
  
  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
    setCurrentPage(0); // Reset to first page when changing type
    setIsDropdownOpen(false);
  };
  
  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setCurrentPage(prev => prev + 1);
  };
  
  const canGoPrevious = currentPage > 0;
  const canGoNext = true; // Always allow going forward to see older data
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-400 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading history...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-green-400 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Error loading data: {error.message}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-green-400">
      {/* Header with Status Display and Dropdown */}
      <div className='bg-white p-4'>
        <div className="mt-18">
          <StatusDisplay text="Monitoring History" />
        </div>
        
        {/* Type Selection Dropdown */}
        <div className="mt-4 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-green-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between border-2 border-black"
          >
            { /** @ts-ignore */}
            <span>{typeLabels[selectedType]}</span>
            <ChevronDown className={`w-5 h-5 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-2  border-black rounded-lg mt-1 z-10 shadow-lg">
              {Object.entries(typeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`w-full  bg-transparent! text-left py-3 px-4 hover:bg-green-100 transition-colors ${
                    selectedType === key ? 'bg-green-200 font-semibold' : ''
                  } ${key === 'soil_moisture' ? 'rounded-t-lg' : ''} ${key === 'temperature' ? 'rounded-b-lg' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-lg overflow-hidden mx-4 mt-4">
        <table className="w-full">
          <thead className="bg-green-400">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-black border-r border-black">
                Date
              </th>
              <th className="px-3 py-3 text-left font-semibold text-black border-r border-black">
                Average
              </th>
              <th className="px-3 py-3 text-left font-semibold text-black border-r border-black">
                Min
              </th>
              <th className="px-3 py-3 text-left font-semibold text-black">
                Max
              </th>
            </tr>
          </thead>
          <tbody className="bg-green-400">
            {dates.map((dateInfo) => {
              const data = dataMap.get(dateInfo.dateString);
              // @ts-ignore
              const unit = typeUnits[selectedType] ;
              const averageValue = data ? `${data.average_val.toFixed(2)}${unit}` : `0.00${unit}`;
              const minValue = data ? `${data.min_val.toFixed(2)}${unit}` : `0.00${unit}`;
              const maxValue = data ? `${data.max_val.toFixed(2)}${unit}` : `0.00${unit}`;
             
              return (
                <tr key={dateInfo.dateString} className="border-b border-black">
                  <td className="px-3 py-3 text-black font-medium border-r border-black">
                    {dateInfo.displayDate}
                  </td>
                  <td className="px-3 py-3 text-black font-medium border-r border-black">
                    {averageValue}
                  </td>
                  <td className="px-3 py-3 text-black font-medium border-r border-black">
                    {minValue}
                  </td>
                  <td className="px-3 py-3 text-black font-medium">
                    {maxValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Navigation Buttons */}
      <div className="  grid grid-cols-3  items-center px-4 mt-6 pb-32  ">
        <button 
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`flex items-center  gap-2 font-semibold transition-opacity ${
            canGoPrevious ? 'text-white hover:text-green-100' : 'text-green-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
           <span className="mr-2">Prev</span>
        </button>
       
        <div className="text-white font-semibold">
          Page {currentPage + 1}
        </div>
       
        <button 
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex items-center   gap-2 font-semibold transition-opacity ${
            canGoNext ? 'text-white hover:text-green-100' : 'text-green-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="mr-2">Next</span>
          <ChevronRight className="w-6 h-6" />
 
        </button>
      </div>
    </div>
  );
};

export default MonitoringHistoryPage;