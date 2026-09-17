import { ArchiveIcon } from "lucide-react";
import { Section } from "@/components/section";

export default function Home() {
  return (
    <div className="max-w-[1620px] w-full mx-auto p-10 flex flex-col gap-8 h-dhv">
      <div />

      <main className="grid grid-cols-4 gap-5 flex-1 items-stretch">
        <Section.Root>
          <Section.Header>
            <Section.Title>
              <ArchiveIcon className="size-3" />
              Backlog
            </Section.Title>

            <Section.IssueContent>16</Section.IssueContent>
          </Section.Header>

          <Section.Content>
            <div>card 1</div>
            <div>card 2</div>
            <div>card 3</div>
          </Section.Content>
        </Section.Root>
      </main>
    </div>
  );
}
