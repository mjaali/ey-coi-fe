type PageFooterProps = {
  children: React.ReactNode;
};

export function PageFooter({ children }: PageFooterProps) {
  return (
    <footer className="border-t border-border/70 pt-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </footer>
  );
}
