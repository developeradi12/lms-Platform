import Link from "next/link"
import { GraduationCap } from "lucide-react"

const footerLinks = {
  Platform: [
    { label: "Browse Courses", href: "/courses" },
    { label: "Pricing", href: "#" },
    { label: "For Teams", href: "#" },
    { label: "Enterprise", href: "#" },
  ],
  Resources: [
    { label: "Blog", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "Community", href: "#" },
    { label: "Support", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="size-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-card-foreground font-[family-name:var(--font-heading)]">
                LearnHub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Empowering learners worldwide with high-quality courses taught by industry experts.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-card-foreground">{title}</h4>
              <nav className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            2026 LearnHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
