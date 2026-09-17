import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface CardRootProps extends ComponentProps<"div"> {}

export const CardRoot = ({ className, ...props }: CardRootProps) => {
  return (
    <div
      className={twMerge(
        "bg-navy-800 rounded-xl border-[0.5px] border-navy-500 pt-3 flex flex-col gap-1",
        className,
      )}
      {...props}
    />
  );
};

interface CardHeaderProps extends ComponentProps<"div"> {}

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={twMerge("flex items-center justify-between px-3", className)}
      {...props}
    />
  );
};

interface CardTitleProps extends ComponentProps<"span"> {}

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <span
      className={twMerge(
        "bg-navy-700 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs",
        className,
      )}
      {...props}
    />
  );
};

interface CardIssueCountProps extends ComponentProps<"span"> {}

export const CardIssueCount = ({
  className,
  ...props
}: CardIssueCountProps) => {
  return (
    <span className={twMerge("text-xs text-navy-200", className)} {...props} />
  );
};

interface CardContentProps extends ComponentProps<"div"> {}

export const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <div
      className={twMerge(
        "felx flex-col gap-2.5 overflow-y-scroll p-3",
        className,
      )}
      {...props}
    />
  );
};

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  IssueContent: CardIssueCount,
  Content: CardContent,
};
