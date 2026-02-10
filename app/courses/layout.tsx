interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background max-atuo px-6 pt-4">
      <div className="w-full max-w-7xl">
        {children}
      </div>
    </div>
  )
}
