import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface CardRootProps extends ComponentProps<"a"> {}

export const CardRoot = ({ className, ...props }: CardRootProps) => {
  return (
    <a
      href="/"
      className={twMerge(
        "bg-navy-700 border-[0.5px] border-navy-600 p-3 space-y-4 rounded-lg block",
        "hover:bg-navy-600/50 hover:border-r-navy-500 transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
        className,
      )}
      {...props}
    />
  );
};

interface CardHeaderProps extends ComponentProps<"div"> {}

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div className={twMerge("flex flex-col gap-2", className)} {...props} />
  );
};

interface CardTitleProps extends ComponentProps<"span"> {}

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <span className={twMerge("text-sm font-medium", className)} {...props} />
  );
};

interface CardNumberProps extends ComponentProps<"span"> {}

export const CardNumber = ({ className, ...props }: CardNumberProps) => {
  return (
    <span className={twMerge("text-xs text-navy-200", className)} {...props} />
  );
};

interface CardFooterProps extends ComponentProps<"div"> {}

export const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return (
    <div className={twMerge("flex items-center gap-2", className)} {...props} />
  );
};

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Number: CardNumber,
  Footer: CardFooter,
};
