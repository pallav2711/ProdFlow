const PageHeader = ({ title, subtitle, meta, rightContent, className = 'mb-6 sm:mb-8' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-responsive-sm ${className}`}>
      <div className="flex-1 min-w-0">
        <h1 className="text-responsive-3xl font-bold text-gray-900 truncate-responsive">{title}</h1>
        {subtitle && <p className="text-gray-600 text-responsive-base mt-1 line-clamp-2">{subtitle}</p>}
        {meta && <div className="mt-2 text-responsive-sm">{meta}</div>}
      </div>
      {rightContent && (
        <div className="flex flex-wrap items-center gap-responsive-sm flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  )
}

export default PageHeader
