import { createContext, useContext, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface PwaUpdateContextValue {
  needRefresh: boolean
  checkForUpdates: () => void
  applyUpdate: () => void
}

const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null)

export function PwaUpdateProvider({ children }: { children: ReactNode }) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log('SW registered:', registration)
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error:', error)
    },
  })

  const applyUpdate = () => {
    updateServiceWorker(true)
  }

  const checkForUpdates = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update()
      })
    }
  }

  return (
    <PwaUpdateContext.Provider value={{ needRefresh, checkForUpdates, applyUpdate }}>
      {children}
    </PwaUpdateContext.Provider>
  )
}

export function usePwaUpdate(): PwaUpdateContextValue {
  const context = useContext(PwaUpdateContext)
  if (!context) {
    throw new Error('usePwaUpdate must be used within PwaUpdateProvider')
  }
  return context
}
