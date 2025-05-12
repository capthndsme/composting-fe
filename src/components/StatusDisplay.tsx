import { cn } from "@/lib/utils";

const StatusDisplay = ({text, className}: {text?: string, className?: string}) => {
  return (
    // Added: relative, overflow-hidden
    <div className="status-display bg-yellow-400 border-yellow-500 border-4 rounded-md text-3xl px-0 py-1 w-full relative overflow-hidden flex items-center justify-center">
      {/* Added: span wrapper with class */}
      <span className={cn("status-text text-md p-1 text-yellow-950", className)}>{text}</span>
    </div>
  );
}
export default StatusDisplay;