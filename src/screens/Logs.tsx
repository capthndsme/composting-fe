import { useGetLog } from "@/hooks/useGetLog";

const Logs = () => {

    const { data, isLoading, isError } = useGetLog();

   if (isLoading) {
      return <div>Loading logs...</div>;
   }

   if (isError) {
      return <div>Error loading logs</div>;
   }

   return (
      <div className="w-full h-lvh overflow-y-scroll bg-[#efefef]">
         <div className="h-[30vh] bg-green-400 flex items-end justify-start p-4 px-5 text-3xl font-light">
            Logs
         </div>
         <div className="p-4">
            <div className="bg-gray-300 p-4 rounded-lg">
               {data?.map((log, index) => (
                  <div key={index} className="border-b border-gray-400 py-2 last:border-b-0 text-sm">
                     Date: {new Date(log.createdAt).toLocaleDateString()}
                     <br />
                     Message: {log.message}
                     <br />
                     Event: {log.type}
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
   
} 
export default Logs;

//