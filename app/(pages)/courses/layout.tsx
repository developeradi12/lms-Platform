interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full px-6 py-6">
        {children}
      </div>
    </div>
  )
}
