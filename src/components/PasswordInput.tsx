import {Input, InputProps} from "@/components/ui/input";
import React, {useState} from "react";
import {cn} from "@/lib/utils";
import {Eye, EyeOff} from "lucide-react";

/**
 * Own component for the password input field.
 * We need to define the action for showing/hiding password
 * ...props are for using props like placeholder, etc. inside the tag like by a normal Input.
 * We do need React.forwardRef, since we need to provide the ref from SignUpForm to the Input within this component here.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pe-10", className)}
          ref={ref}
          {...props}
        ></Input>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide Password" : "Show Password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    );
  },
);

Input.displayName = "PasswordInput";
export { PasswordInput };
