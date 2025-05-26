import GasGauge from "@/components/GasGauge";
import StatusDisplay from "@/components/StatusDisplay";
import Toggles from "@/components/Toggles";
import { useGetSensorData } from "@/hooks/useServerApi";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
   const [dayString, setDayString] = useState({
      day: "2000-00-00",
      time: "12:00 PM",
   });

   const data = useGetSensorData({
      enabled: true,
      staleTime: 1000 * 2,
   });

   useEffect(() => {
      function update() {
         const now = new Date();
         const day = now.toLocaleDateString("en-US");
         const time = now.toLocaleTimeString("en-US");
         // remove the last SS
         const n = time.replace(/:[^:]+$/, "");
         // add am/pm
         const formattedTime = `${n} ${time.split(" ")[1]}`;

         setDayString({ day, time: formattedTime });

         data.refetch();
      }

      update();
      const interval = setInterval(update, 5000);
      return () => {
         clearInterval(interval);
      };
   }, []);
   return (
      <div className="flex flex-col h-lvh w-screen">
         <div className="flex p-6 flex-col gap-4 flex-shrink-0">
            <div className="w-full">
               <StatusDisplay text="Today's Status" />
            </div>
            <div className="grid grid-cols-2 mt-4">
               <Link className="flex items-center justify-center gap-2 text-center flex-col p-1" to="/monitoring-history">
                  <History size={96} className="bg-yellow-400 text-black p-2 rounded-2xl" />
                  <div className="text-sm text-black">Monitoring History</div>
               </Link>
               <div className="w-full h-full  p-4 pt-1 aspect-square">
                  <div className="w-full h-full flex flex-col rounded-full bg-yellow-400 items-center justify-center">
                     <div className="font-bold text-xl">{dayString.day}</div>
                     <div className="font-semibold text-md">{dayString.time}</div>
                  </div>
               </div>
            </div>
         </div>
         <div className="bg-green-400  flex-grow-1 flex-shrink-1 pb-32">
            <div className="grid grid-cols-2 grid-rows-2 place-items-center">
               <GasGauge value={data?.data?.temperature} />
               <GasGauge value={data?.data?.soil_moisture} label="Soil Moisture" unit="%" min={0} max={100} />
               <GasGauge value={data?.data?.humidity} label="Humidity" unit="%" min={0} max={100} />
               <GasGauge value={data?.data?.ph_level} label="pH level" unit="" min={0} max={20} />
            </div>

           
         </div>
      </div>
   );
};

export default Home;
