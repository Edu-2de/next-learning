import { SearchInput } from "./search-input";
import { UserButton } from "./user-button";

export const Header = async () => {
  return (
    <div className="max-w-225 mx-auto w-full flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">Product roadmap</h1>
        <p className="text-sm text-navy-100">
          Follow the development progress of our entire platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        <SearchInput />
        <UserButton />
      </div>
    </div>
  );
};
