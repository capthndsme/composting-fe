/** Simple full sized spinner that takes its parent containing size */
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useEffect } from "react";

const FullsizeSpinner = ({renderCb, unrenderCb, className = ""}: {
  renderCb?: () => void,
  unrenderCb?: () => void,
  className?: string
}) => {
  useEffect(() => {
    if (renderCb) renderCb()
    return () => {
      if (unrenderCb) unrenderCb()
    }
  }, [])
   return (
      <div className='flex items-center justify-center w-full h-full'>
         <Loader className={cn("w-16 h-16 animate-spin", className)} />
      </div>
   );
};

export default FullsizeSpinner;

 