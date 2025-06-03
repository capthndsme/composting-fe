import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import PrestartScreen from "./screens/PrestartScreen";
import FullsizeSpinner from "./components/FullsizeSpinner";
import { Toaster } from "./components/ui/sonner";
import { Gauge, Info, Settings2 } from "lucide-react";
import FullControls from "./components/FullControls";
import FullAbout from "./components/FullAbout";
 
import { useAuth } from "./components/AuthContext";
import { Login } from "./components/LoginPage";

const Home = lazy(() => import("@/screens/Home"));
const Logs = lazy(() => import("@/screens/Logs"));
const MonitoringHistory = lazy(() => import("@/screens/MonitorHistory"));

function App() {
   const [loading, setLoading] = useState(true);

   const auth = useAuth();
   useEffect(() => {
      setTimeout(() => {
         setLoading(false);
      }, 5000);
   }, []);
   if (!auth?.hash) {
      return <Login />
   }
   return (
      <>
         <Toaster />
         {loading && <PrestartScreen dismiss={() => setLoading(false)} />}

         <Suspense fallback={<FullsizeSpinner />}>
         <BrowserRouter>
               {!loading && (
                  <div className="fixed bottom-0 left-0 w-full z-10 p-4 ">
                     <div className="w-full h-16 rounded-xl flex items-center drop-shadow-accent  justify-center gap-2 bg-green-600/75 backdrop-blur-md text-white p-2">
                        

                        <NavLinkWrapper to="/">
                           <div className="flex flex-col items-center justify-center p-1 text-white ">
                              <Gauge />
                              <small>Monitor</small>
                           </div>
                        </NavLinkWrapper>

                         <NavLinkWrapper to="/controls">
                           <div className="flex flex-col items-center justify-center p-1 text-white ">
                              <Settings2 />
                              <small>Controls</small>
                           </div>
                        </NavLinkWrapper>

                         <NavLinkWrapper to="/about">
                           <div className="flex flex-col items-center justify-center p-1 text-white ">
                              <Info />
                              <small>About</small>
                           </div>
                        </NavLinkWrapper>
                     </div>
                  </div>
               )}
   
                 <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/controls" element={<FullControls />} />
                  <Route path="/about" element={<FullAbout />} />
                  <Route path="/monitoring-history" element={<MonitoringHistory />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="*" element={<div>404 | Not found</div>} />
               </Routes>
       
            </BrowserRouter>
         </Suspense>
      </>
   );
}
/** <NavLink> uses react router's internal */
const NavLinkWrapper = ({ to, children }: { to: string; children: React.ReactNode }) => {
   return (
      <NavLink to={to} className={({ isActive }) => (isActive ? "bg-green-800/60 rounded-xl h-full w-16" : "rounded-xl h-full  w-16")}>
         {children}
      </NavLink>
   );
};

export default App;
