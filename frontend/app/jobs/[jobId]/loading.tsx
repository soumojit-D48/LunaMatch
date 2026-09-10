export default function Loading() {
  return (
    <div className="min-h-screen bg-void text-bone">
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-10 sm:px-8">
        <div className="h-4 w-24 rounded bg-panel" />
        <div className="mt-4 h-10 w-2/3 rounded bg-panel" />
        <div className="mt-2 h-4 w-1/3 rounded bg-panel" />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="aspect-square rounded-xl bg-panel" />
          <div className="aspect-square rounded-xl bg-panel" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-panel" />
          ))}
        </div>
      </div>
    </div>
  );
}
