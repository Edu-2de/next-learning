import { Input } from "@/components/input";
import { LogInIcon, SearchIcon } from "lucide-react";

export const Header = () => {
  return (
    <div className="max-w-225 mx-auto w-full flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">Product roadmap</h1>
        <p className="text-sm text-navy-100">
          Follow the development progress of our entire platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <SearchIcon className="absolute size-4 text-navy-200 left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

          <Input
            type="text"
            placeholder="Search for features..."
            className="w-67.5 pl-8"
          />
        </div>

        <button
          type="button"
          className="size-8 rounded-full bg-navy-700 border-navy-500 flex items-center justify-center hover:bg-navy-600 transition-colors duration-150"
        >
          <LogInIcon className="size-3.5 text-navy-200 cursor-pointer" />
        </button>
      </div>
    </div>
  );
};
