import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "outlined";
  clickable?: boolean;
  onClick?: () => void;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  children, 
  className,
  variant = "default",
  clickable = false,
  onClick 
}: FeatureCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return "card-gradient border-0 shadow-card";
      case "outlined":
        return "bg-background border-2 border-primary/20 hover:border-primary/40 shadow-sm";
      default:
        return "bg-card shadow-card";
    }
  };

  return (
    <Card 
      className={cn(
        "transition-smooth",
        getVariantClasses(),
        clickable && "cursor-pointer hover:shadow-glow hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </CardHeader>
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}