 
import { useGetHistoryData } from '../hooks/useServerApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatusDisplay from './StatusDisplay';
 
const MonitoringHistoryPage = () => {
  // Using your hook to fetch soil moisture data (assuming 'soilMoisture' is the type)
  const { data: historyData, isLoading, error } = useGetHistoryData('soil_moisture');

  // Generate dates from today going backward
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 11; i++) { // 11 days to match your mockup
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push({
        dayNumber: i + 1,
        dateString: date.toISOString().split('T')[0], // YYYY-MM-DD format
        displayDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  const dates = generateDates();

  // Create a map of date to data for easy lookup
  const dataMap = new Map();
  if (historyData) {
    historyData.forEach(item => {
      dataMap.set(item.day, item);
    });
  }

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
    <div className="min-h-screen bg-green-400 ">
      {/* Header with Exit button */}
 

      {/* Status Display Component */}

      <div className='bg-white p-4'>
          <div className="mt-18">
        <StatusDisplay text="Monitoring History" />
      </div>

      </div>
      {/* Data Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-400">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-black border-r border-black">
                Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-black">
                Soil Moisture
              </th>
            </tr>
          </thead>
          <tbody className="bg-green-400">
            {dates.map((dateInfo) => {
              const data = dataMap.get(dateInfo.dateString);
              const moistureValue = data ? `${data.average_val.toFixed(2)}%` : '0.00%';
              
              return (
                <tr key={dateInfo.dateString} className="border-b border-black">
                  <td className="px-4 py-3 text-black font-medium border-r border-black">
                    {dateInfo.displayDate}
                  </td>
                  <td className="px-4 py-3 text-black font-medium">
                    {moistureValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pb-32 px-4">
        <button className="flex items-center gap-2 text-white font-semibold">
          <ChevronLeft className="w-6 h-6" />
          <ChevronLeft className="w-6 h-6 -ml-4" />
          <ChevronLeft className="w-6 h-6 -ml-4" />
          <span className="ml-2">Previous</span>
        </button>
        
        <button className="flex items-center gap-2 text-white font-semibold">
          <span className="mr-2">Next</span>
          <ChevronRight className="w-6 h-6" />
          <ChevronRight className="w-6 h-6 -ml-4" />
          <ChevronRight className="w-6 h-6 -ml-4" />
        </button>
      </div>
    </div>
  );
};

export default MonitoringHistoryPage;