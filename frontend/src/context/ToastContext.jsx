import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 3200) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => dismissToast(id), duration)
  }, [dismissToast])

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-20 right-4 z-[70] space-y-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/95 transition-all duration-200 ${
              toast.type === 'success'
                ? 'border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'border-red-200 text-red-800'
                : 'border-indigo-200 text-gray-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 leading-none"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
