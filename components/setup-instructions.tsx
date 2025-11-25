import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Create a Supabase project",
    description: (
      <>
        Go to{" "}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          supabase.com
        </a>{" "}
        and create a new project.
      </>
    ),
  },
  {
    title: "Run the database schema",
    description: (
      <>
        Open the SQL Editor in your Supabase dashboard and run the contents of{" "}
        <code className="bg-muted px-1 py-0.5 rounded">supabase/schema.sql</code>
      </>
    ),
  },
  {
    title: "Configure environment variables",
    description: (
      <>
        Copy <code className="bg-muted px-1 py-0.5 rounded">.env.sample</code> to{" "}
        <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> and add your
        Supabase project URL and anon key.
      </>
    ),
  },
  {
    title: "Restart the development server",
    description: (
      <>
        Run <code className="bg-muted px-1 py-0.5 rounded">pnpm dev</code> to start using
        the app.
      </>
    ),
  },
];

export function SetupInstructions() {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Setup Required</CardTitle>
        <CardDescription>
          Connect to Supabase to start tracking your time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="space-y-2">
            <h3 className="font-medium">
              {index + 1}. {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
