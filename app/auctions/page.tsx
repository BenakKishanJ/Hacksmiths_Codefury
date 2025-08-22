export default function AuctionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Auctions</h1>
      <p className="text-muted-foreground">
        Participate in exclusive art auctions and acquire unique pieces.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Placeholder for auction items */}
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden flex flex-col"
            >
              <div className="w-full aspect-[4/3] bg-neutral-300 dark:bg-neutral-600 relative">
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {i % 2 === 0 ? "Live Now" : "Starts in 2 days"}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-medium">Auction Item {i + 1}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  By Artist {i + 1}
                </p>
                <div className="mt-4 flex justify-between items-end flex-1">
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Current Bid
                    </p>
                    <p className="font-semibold">₹{(i + 1) * 15000}</p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 text-sm rounded">
                    Place Bid
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
