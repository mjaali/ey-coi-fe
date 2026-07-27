type PageFooterProps = {
  children: React.ReactNode;
};

export function PageFooter({ children }: PageFooterProps) {
  return (
    <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
      {children}
    </footer>
  );
}
