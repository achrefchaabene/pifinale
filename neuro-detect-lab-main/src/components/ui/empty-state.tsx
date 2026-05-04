import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const EmptyState = ({ icon, title, description, className }: EmptyStateProps) => {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-muted/10 p-8 text-center", className)}>
      {icon ? <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">{icon}</div> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmptyState;
