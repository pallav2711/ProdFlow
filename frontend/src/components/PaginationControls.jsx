const PaginationControls = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canPrevious = true,
  canNext = true,
  label = 'Page'
}) => {
  const resolvedTotal = Math.max(totalPages || currentPage, 1)

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        onClick={onPrevious}
        disabled={!canPrevious}
        className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        {label} {currentPage} / {resolvedTotal}
      </span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  )
}

export default PaginationControls
