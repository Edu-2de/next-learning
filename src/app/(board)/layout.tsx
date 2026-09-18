import { Header } from "./header";

export default function BoardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="max-w-[1620px] w-full mx-auto p-10 flex flex-col gap-8 h-dhv">
      <Header />

      {children}
    </div>
  );
}
