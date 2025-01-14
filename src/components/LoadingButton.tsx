import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

/**
 * Reusable loading button component.
 */
interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      // cn(...) we use for switching between different CSS classes, depending on state
      className={cn("items-center, flex gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
