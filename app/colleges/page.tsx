export default function CollegesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Colleges</h1>
      <p className="text-muted-foreground">
        Explore top art and design colleges across India.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Placeholder for college cards */}
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden"
            >
              <div className="w-full aspect-video bg-neutral-300 dark:bg-neutral-600"></div>
              <div className="p-4">
                <h3 className="font-medium">College {i + 1}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {i % 2 === 0 ? "New Delhi" : "Mumbai"}, India
                </p>
                <div className="mt-3 text-xs">
                  <span className="inline-block px-2 py-1 bg-neutral-300 dark:bg-neutral-600 rounded mr-2">
                    Fine Arts
                  </span>
                  <span className="inline-block px-2 py-1 bg-neutral-300 dark:bg-neutral-600 rounded">
                    Design
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
