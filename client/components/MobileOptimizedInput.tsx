import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface MobileOptimizedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url" | "none" | "decimal" | "numeric";
}

const MobileOptimizedInput = React.forwardRef<
  HTMLInputElement,
  MobileOptimizedInputProps
>(
  (
    {
      label,
      icon,
      error,
      success,
      hint,
      required = false,
      className,
      autoComplete,
      inputMode,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="space-y-2 w-full">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(
              "text-sm font-semibold text-foreground flex items-center gap-2",
              disabled && "opacity-60",
            )}
          >
            {icon && <span className="text-base">{icon}</span>}
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </Label>
        )}

        <div className="relative">
          <Input
            ref={ref}
            inputMode={inputMode}
            autoComplete={autoComplete}
            disabled={disabled}
            className={cn(
              "w-full h-12 sm:h-11 px-4 text-base rounded-lg transition-all duration-200",
              "bg-white dark:bg-slate-800 border-2",
              "focus:outline-none focus:ring-0",
              "placeholder-muted-foreground/50",
              isFocused && !error && "border-blue-500/50 ring-2 ring-blue-500/20",
              error
                ? "border-red-500/50 ring-2 ring-red-500/20"
                : success
                  ? "border-green-500/50 ring-2 ring-green-500/20"
                  : "border-border/50 hover:border-border",
              disabled && "opacity-60 cursor-not-allowed",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Success Indicator */}
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}

          {/* Error Indicator */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>

        {/* Error or Hint Message */}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  },
);

MobileOptimizedInput.displayName = "MobileOptimizedInput";

export default MobileOptimizedInput;
