import { AppSidebar } from "@/components/app-sidebar";
import { inter, lora } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <AppSidebar />
      <div
        className={cn(
          lora.variable,
          inter.variable,
          "flex min-h-screen flex-1 flex-col pb-20 font-[family-name:var(--font-inter)] text-[var(--blue)] md:pb-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
