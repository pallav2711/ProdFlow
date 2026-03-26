const PageSkeleton = ({ cards = 4, rows = 5, variant = 'cards' }) => {
  const rowClass =
    variant === 'table'
      ? 'h-10 bg-gray-100 rounded-md'
      : variant === 'dense'
      ? 'h-9 bg-gray-100 rounded-lg'
      : 'h-12 bg-gray-100 rounded-lg'

  const containerClass =
    variant === 'table'
      ? 'bg-white rounded-xl border border-gray-200 p-6 overflow-hidden'
      : 'bg-white rounded-xl border border-gray-200 p-6'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-64 bg-gray-200 rounded-lg" />
        <div className="h-4 w-96 bg-gray-200 rounded mt-3" />
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: cards }).map((_, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className={containerClass}>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className={rowClass} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PageSkeleton
