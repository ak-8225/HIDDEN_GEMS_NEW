import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Compass, Users, Heart, Map, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/5 py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-primary/30">
              <Sparkles className="h-4 w-4" />
              Discover the Undiscovered
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 text-balance leading-tight">
              Discover Hidden Travel Destinations Beyond the Usual
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Join our community of explorers to uncover unexplored gems around the world. Share authentic experiences,
              support sustainable tourism, and venture off the beaten path.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Explore Hidden Gems →
                </Button>
              </Link>
              <Link href="/add-destination">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-2 hover:bg-primary/5 bg-transparent"
                >
                  Share a Destination
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Why Choose Hidden Gems?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover and share authentic travel experiences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl hover:bg-card transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-primary/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 group-hover:scale-110 transition-transform">
                <Compass className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Discover Unexplored</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Find destinations that aren't on every tourist map
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-card transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-secondary/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Community Driven</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Learn from fellow travelers and share your experiences
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-card transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-accent/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Sustainable Tourism</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Support local communities and eco-friendly travel
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-card transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-primary/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 group-hover:scale-110 transition-transform">
                <Map className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Authentic Experiences</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Experience culture beyond tourist attractions
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
