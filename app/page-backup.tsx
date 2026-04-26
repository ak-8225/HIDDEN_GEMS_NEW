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
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Why Join Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 rounded-lg border border-primary/10 bg-primary/5 hover:border-primary/30 transition-colors">
              <Map className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover Authentic Gems</h3>
              <p className="text-muted-foreground">
                Find travel destinations recommended by real explorers, not just mainstream tourist guides.
              </p>
            </div>
            <div className="p-8 rounded-lg border border-primary/10 bg-primary/5 hover:border-primary/30 transition-colors">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect with Travelers</h3>
              <p className="text-muted-foreground">
                Join a community of like-minded explorers and share your travel experiences and tips.
              </p>
            </div>
            <div className="p-8 rounded-lg border border-primary/10 bg-primary/5 hover:border-primary/30 transition-colors">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Support Sustainable Tourism</h3>
              <p className="text-muted-foreground">
                Help promote responsible travel that supports local communities and preserves nature.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
