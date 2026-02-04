export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">Test Page</h1>
      <p className="text-lg text-foreground mb-8">
        If you can see this text, the page rendering is working correctly.
      </p>
      
      <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-6">
        <h2 className="text-2xl font-bold mb-4">Card Component Test</h2>
        <p className="mb-4">This is a test card to verify styling works.</p>
        <p className="text-muted-foreground">Muted text color</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Color Tests:</h3>
        <p className="text-foreground">Foreground color (should be visible)</p>
        <p className="text-muted-foreground">Muted foreground (gray text)</p>
        <p className="text-fac-orange-500">FAC Orange (brand color)</p>
      </div>
    </div>
  );
}
