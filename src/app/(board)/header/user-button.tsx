"use client";

import { authClient } from "@/lib/auth-client";
import { Loader2Icon, LogInIcon } from "lucide-react";

export const UserButton = () => {
  const { data: session, isPending } = authClient.useSession();

  async function handleSigIn() {
    await authClient.signIn.social({ provider: "github", callbackURL: "/" });
  }

  async function handleSinOut() {
    await authClient.signOut();
  }

  return (
    <>
      {isPending ? (
        <div className="size-8 rounded-full bg-navy-700 border-navy-500 flex items-center justify-center">
          <Loader2Icon className="size-3.5 text-navy-200 animate-spin" />
        </div>
      ) : session?.user ? (
        <button
          type="button"
          onClick={handleSinOut}
          className="size-8 rounded-full overflow-hidden cursor-pointer"
        >
          <img
            src={session.user.image ?? ""}
            alt={session.user.name}
            className="size-8 rounded-full"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSigIn}
          className="size-8 rounded-full bg-navy-700 border-navy-500 flex items-center justify-center hover:bg-navy-600 transition-colors duration-150"
        >
          <LogInIcon className="size-3.5 text-navy-200 cursor-pointer" />
        </button>
      )}
    </>
  );
};
