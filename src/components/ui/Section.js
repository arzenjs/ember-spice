import { cn } from "@/lib/utils";
import Container from "./Container";

export default function Section({ className, containerClassName, children, ...props }) {
  return (
    <section className={cn("py-16 lg:py-24", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
