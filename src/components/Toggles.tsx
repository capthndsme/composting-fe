import { TRANSLATIONS, useGetFullServerState, useUpdateServerState } from "@/hooks/useServerApi";
import type { ServerStateKey } from "@/types/api";
import { useEffect } from "react";

const Toggles = () => {
   const serverStates = useGetFullServerState({
      enabled: true,
      staleTime: 1000 * 2,
   });

   const mutator = useUpdateServerState();

   useEffect(() => {
      const intervalFn = () => {
         serverStates.refetch();
      };

      const intervalId = setInterval(intervalFn, 2000);

      return () => {
         clearInterval(intervalId);
      };
   }, []);

   /**
    * based on the both data type, make me a simple grid of toggles (1fr 1fr 1fr)
    * and the normal shadcn switch.
    * seems extremely doable
    */

   if (serverStates.isLoading) {
      return <div>Loading...</div>;
   }

   if (!serverStates.data) {
      return <div>No data</div>;
   }

   const handleToggle = (key: ServerStateKey, value: boolean) => {
      console.log(key, value);
      mutator.mutate({
         key: key,
         value: value ? 1 : 0,
      });
   };

   /**
   * 
   * Raw example:
   * <label class="toggle">
	<input class="toggle-checkbox" type="checkbox" checked>
	<div class="toggle-switch"></div>
	<span class="toggle-label">Bluetooth</span>
</label>
   */
  const filteredData = Object.entries(serverStates.data ?? []).filter(([s]) => s !== "shredder");
   return (
      <div className="grid grid-cols-3 gap-4 px-2 py-8">
         {filteredData.map(([key, value]) => {
            return (
               <label key={key} className="toggle">
                  <input
                     className="toggle-checkbox"
                     type="checkbox"
                     checked={value === 1 || value as unknown=== "1"}
                     onChange={(e) => {
                        handleToggle(key as ServerStateKey, e.target.checked);
                     }}
                  />
                  <div className="toggle-switch"></div><br/>
                  <div className="toggle-label bg-yellow-400 inline-block px-2 py-[2px] text-sm rounded-md">{ TRANSLATIONS[key as ServerStateKey] ?? "Unknown"}</div>
               </label>
            );
         })}
         
      </div>
   );
};

export default Toggles;
