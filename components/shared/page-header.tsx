interface PageHeaderProps {
  title: string;
  description?: string;
  centered?: boolean;
}

export function PageHeader({ title, description, centered = false }: PageHeaderProps) {
  return (
    <header className={`mb-8 ${centered ? "text-center" : ""}`}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </header>
  );
}
