import { Button } from "@/components/ui/button";
import { MapPin, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export function Header({ title = "Legacy Line", showBackButton = false, onBack, className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              ←
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-foreground">{title}</span>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            Land Parcel Assessment Tool
          </span>
        </div>
      </div>
    </header>
  );
}