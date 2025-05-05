export default function Loading() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-purple-400 animate-pulse">Ачааллаж байна...</p>
      </div>
    </div>
  )
}
