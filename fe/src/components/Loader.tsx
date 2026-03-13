import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex h-[calc(100vh-16px-35px)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Loader;
