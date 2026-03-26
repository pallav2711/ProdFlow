const PageHeader = ({ title, subtitle, meta, rightContent, className = 'mb-8' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        {meta && <div className="mt-2">{meta}</div>}
      </div>
      {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
    </div>
  )
}

export default PageHeader
