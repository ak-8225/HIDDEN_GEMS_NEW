import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Heart, Star, Calendar } from "lucide-react"

export default function DestinationDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in real app this would be fetched based on params.id
  const destination = {
    id: params.id,
    name: "Sapa Rice Terraces",
    location: "Lào Cai, Vietnam",
    category: "Nature",
    description:
      "The Sapa Rice Terraces are a breathtaking sight that showcases centuries of agricultural ingenuity. Located in the mountainous region of northern Vietnam, these terraces cascade down the hillsides in stunning layers of green during the growing season and golden hues during harvest time.",
    image: "/vietnam-rice-terraces-panoramic-landscape.jpg",
    bestTime: "September to November",
    highlights: [
      "Witness the golden harvest season with terraces in full bloom",
      "Experience authentic hill tribe culture and homestays",
      "Trek through scenic mountain paths with panoramic views",
      "Visit local markets with traditional handicrafts and textiles",
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-muted">
          <img
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{destination.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{destination.location}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {destination.category}
                </Badge>
              </div>
              <Button className="gap-2">
                <Heart className="h-4 w-4" />
                Save to Favorites
              </Button>
            </div>

            {/* Description */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">About This Place</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{destination.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Best time to visit:</span>
                  <span>{destination.bestTime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Why This Place Is Special</h2>
                <ul className="space-y-3">
                  {destination.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="mt-8">
              <Link href="/explore">
                <Button variant="outline">← Back to Explore</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
