type PageFooterProps = {
  children: React.ReactNode;
};

export function PageFooter({ children }: PageFooterProps) {
  return (
    <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
      {children}
    </footer>
  );
}
