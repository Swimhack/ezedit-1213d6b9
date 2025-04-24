
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-8 h-8">
        <div className="absolute w-full h-full bg-ezblue rounded flex items-center justify-center text-eznavy font-bold">
          Ez
        </div>
      </div>
      {showText && (
        <span className="text-xl font-bold">
          <span className="text-ezblue">Ez</span>
          <span className="text-ezwhite">Edit</span>
          <span className="text-ezgray-light">.co</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
