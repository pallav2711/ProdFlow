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
    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-responsive-sm">
      <button
        onClick={onPrevious}
        disabled={!canPrevious}
        className="btn-responsive text-responsive-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 touch-target w-full sm:w-auto"
      >
        <svg className="icon-responsive-sm mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      <span className="text-responsive-sm text-gray-600 font-medium order-first sm:order-none">
        {label} {currentPage} / {resolvedTotal}
      </span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="btn-responsive text-responsive-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 touch-target w-full sm:w-auto"
      >
        Next
        <svg className="icon-responsive-sm ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default PaginationControls
