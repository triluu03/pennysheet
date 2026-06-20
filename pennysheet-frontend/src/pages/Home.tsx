/**
 * Homepage.
 */
export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between pb-6">
        <div className="flex flex-col bg-white">
          <div>Some header text</div>
          <h1 className="text-2xl font-medium">Transactions Overview</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-gray-300 bg-stone-300">
            <button className="p-2">Last 4 weeks</button>
            <button className="p-2">Last 2 months</button>
            <button className="p-2">Last 3 months</button>
          </div>
          <button className="px-4 py-2 rounded-lg bg-stone-300">Fetch Transactions</button>
        </div>
      </div>
      <div className="flex-1 rounded-lg bg-white">Plot</div>
    </div>
  );
}
