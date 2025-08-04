interface WelcomeSectionProps {
  title: string;
  description: string;
  userName?: string;
}

export function WelcomeSection({
  title,
  description,
  userName,
}: WelcomeSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">
        {userName ? `Bienvenue ${userName}, ${description}` : description}
      </p>
    </div>
  );
}
