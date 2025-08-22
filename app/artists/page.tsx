export default function ArtistsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Artists</h1>
      <p className="text-muted-foreground">
        Discover talented artists from across India and around the world.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Placeholder for artist cards */}
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-neutral-300 dark:bg-neutral-600 relative">
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20"></div>
              </div>
              <div className="p-4">
                <h3 className="font-medium">Artist Name {i + 1}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {i % 3 === 0
                    ? "Painter"
                    : i % 3 === 1
                      ? "Sculptor"
                      : "Photographer"}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs">
                    <span>{i * 12 + 24} artworks</span>
                  </div>
                  <button className="text-xs px-2 py-1 bg-neutral-300 dark:bg-neutral-600 rounded">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
