import { cn } from "@/lib/utils";

export default function Container({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-14", className)} {...props}>
      {children}
    </Tag>
  );
}
