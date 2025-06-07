import { changePassword } from "@/hooks/authApi";
import mainlogo from "../assets/mainlogo.png";
import { Input } from "./ui/input";
import  { useState } from "react";
import { toast } from "sonner";

const FullAbout = () => {
    const [oldPassword, setOldPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
         toast.error("New passwords do not match.");
         return;
      }
      try {
         await changePassword(oldPassword, newPassword);
         toast.success("Password changed successfully.");
         setOldPassword("");
         setNewPassword("");
         setConfirmPassword("");
      } catch (error: any) {
         toast.error(error?.response?.data ?? "Failed to change password.");
      
      }
   };
   
   return (
      <div className="w-full h-lvh overflow-y-scroll bg-[#efefef] pb-32">
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
             <div className="bg-gray-300 text-left px-4 py-3 rounded-lg mt-4 ">
               <b>Password management</b><br/>
               Change password.

               <div className="flex flex-col gap-2 mt-2 pb-2">
                  <Input placeholder="Old Password" type="password" />
                  <Input placeholder="New Password" type="password" />
                  <Input placeholder="Confirm New Password" type="password" />
                  <button className="bg-green-400 text-white py-2 rounded-md mt-2" onClick={handleChangePassword}>
                     Change Password
                  </button>
               </div>
 
            </div>
         </div>
         
      </div>
   );
};

export default FullAbout;
