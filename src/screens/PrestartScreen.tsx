import photo from '@/assets/Untitled.png'
const PrestartScreen = ({dismiss}: {dismiss: () => void}) => {
   return (
      <div className="fixed h-lvh w-screen z-10 top-0 left-0 bg-white grid grid-rows-2" onClick={dismiss}> 
      <img src={photo} alt="Carmona CAO (City Agriculture Office)" className='fixed aspect-square w-[64vw] max-w-[300px] z-2 left-1/2 top-1/2 -translate-x-[50%] -translate-y-[50%] '/>
         <div className="flex items-center justify-center text-center gap-4 flex-col font-semibold">
            <div className=" text-lg">Welcome to</div>
            <div className="text-4xl">Vermitrack</div>
         </div>
         <div className="bg-green-400 flex items-center justify-center flex-col gap-2 font text-green-950 font-semibold text-lg">
          Tap anywhere to<br/>start<br/>

         </div>
      </div>
   );
};

export default PrestartScreen;
