export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <p className="text-muted-foreground">
        Enhance your artistic skills with our curated courses.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Placeholder for course cards */}
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 flex flex-col"
            >
              <div className="w-full aspect-video bg-neutral-300 dark:bg-neutral-600 rounded mb-4"></div>
              <h3 className="font-medium">Course {i + 1}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Learn about traditional art techniques
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-neutral-300 dark:bg-neutral-600 rounded">
                  6 weeks
                </span>
                <span className="text-xs px-2 py-1 bg-neutral-300 dark:bg-neutral-600 rounded">
                  Beginner
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
