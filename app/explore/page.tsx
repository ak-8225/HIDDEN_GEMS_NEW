"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Sparkles } from "lucide-react"
import { getDestinations, type Destination } from "@/lib/destinations"

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([])

  useEffect(() => {
    setDestinations(getDestinations())
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-primary/5 to-background">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Curated by Travelers
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">Featured Hidden Gems</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of lesser-known destinations shared by travelers around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-background/95 backdrop-blur-sm text-foreground shadow-lg">
                      {destination.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {destination.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" />
                    {destination.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-muted-foreground leading-relaxed">{destination.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/destination/${destination.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Details →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <section className="mt-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-12 md:p-16 border-2 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold text-foreground">Recommended for You</h2>
            </div>
            <p className="text-muted-foreground mb-10 leading-relaxed text-lg">
              Personalized recommendations based on your interests and travel preferences
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.slice(0, 4).map((destination) => (
                <Link key={destination.id} href={`/destination/${destination.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {destination.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {destination.location}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
