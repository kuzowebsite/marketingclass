export default function Loading() {
  return (
    <div className="container py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4">Захиалгууд ачааллаж байна...</p>
      </div>
    </div>
  )
}
