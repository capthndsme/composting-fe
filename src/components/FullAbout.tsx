import mainlogo from "../assets/mainlogo.png";

const FullAbout = () => {
   return (
      <div className="w-full h-lvh overflow-y-scroll bg-[#efefef]">
         <div className="h-[30vh] bg-green-400 flex items-center justify-center  ">
            <img src={mainlogo} alt="the system" className="w-48 h-48" />
         </div>

         <div className="p-4 text-center ">
            <div className="bg-gray-300 px-4 py-2 rounded-lg">
               MCU Vermitrack is an MCU-based system that monitors soil temperature, moisture, and pH levels, with web application control
               of the fan and sprinkler to support efficient composting.
               <br />
               <br />
               DEVELOPERS:
               <br />
               <br />
               Kristine D. Labastida
               <br />
               Brylle Justyn B. Ridual
               <br />
               Kenneth Miguel T. San Juan
               <br />
               <br />
               <br />
               <b>Cavite State University - Carmona</b>
            </div>
         </div>
      </div>
   );
};

export default FullAbout;
