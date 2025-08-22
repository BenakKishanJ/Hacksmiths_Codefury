export default function ArtworksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Artworks</h1>
      <p className="text-muted-foreground">
        Discover and explore beautiful artworks from talented artists.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Placeholder for artwork cards */}
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-neutral-200 dark:bg-neutral-700 rounded-lg aspect-square flex items-center justify-center"
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Artwork {i + 1}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
