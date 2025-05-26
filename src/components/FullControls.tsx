import { ChevronLeft } from "lucide-react";
import Toggles from "./Toggles"
import { useNavigate } from "react-router-dom";

const FullControls = () => {
  const nav = useNavigate()
  
  return <div className="w-full h-lvh  bg-[#efefef]">
    <div className="h-[30vh] bg-green-400 flex items-end justify-start p-4 px-5 text-3xl font-light">
      <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => nav(-1)} >
        <ChevronLeft />
    
      Controls
        </div>
    </div>
     <Toggles />
  </div>
}

export default FullControls;

 