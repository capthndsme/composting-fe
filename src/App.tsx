import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrestartScreen from "./screens/PrestartScreen";
import FullsizeSpinner from "./components/FullsizeSpinner";
import { Toaster } from "./components/ui/sonner";


const Home = lazy(() => import('@/screens/Home'))
function App() {
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setTimeout(() => {
         setLoading(false);
      }, 5000);
   }, []);
   return (
      <>
         <Toaster />
         {loading && <PrestartScreen dismiss={() => setLoading(false)} />}
         <Suspense fallback={<FullsizeSpinner />}>
                   
            <BrowserRouter>
               <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="*" element={<div>404 | Not found</div>} />
               </Routes>
            </BrowserRouter>
         </Suspense>
      </>
   );
}

export default App;
