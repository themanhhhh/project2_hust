import { Loader2 } from 'lucide-react';

interface AdminLoadingProps {
  /** Text to show next to the spinner */
  text?: string;
  /** Full page centered loading or inline */
  fullPage?: boolean;
}

/**
 * Reusable loading component for admin pages.
 * 
 * Usage:
 *   Full page:  <AdminLoading fullPage text="Đang tải dữ liệu..." />
 *   Inline:     <AdminLoading text="Đang tải..." />
 */
export function AdminLoading({ text = 'Đang tải...', fullPage = false }: AdminLoadingProps) {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <span className="text-sm text-muted-foreground">{text}</span>
        </div>
      </div>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text}
    </span>
  );
}
