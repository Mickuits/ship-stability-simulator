export default function App(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <section className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Ship Stability Simulator</h1>
        <p className="text-muted-foreground">
          V2 Web 3D — bootstrap en cours. Les 17 modules CMP arrivent dès la Phase 3.
        </p>
        <p className="text-sm text-muted-foreground" data-testid="bootstrap-marker">
          Phase 0 — repo initialisé
        </p>
      </section>
    </main>
  );
}
