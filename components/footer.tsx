export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Hidden Gems</p>
          <p>Academic Major Project – Product-Oriented Development</p>
          <p className="mt-2">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}
