"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Upload, CheckCircle } from "lucide-react"
import { addDestination } from "@/lib/destinations"

export default function AddDestinationPage() {
  const router = useRouter()
  const [fileName, setFileName] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    category: "",
    description: "",
    image: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileName(file.name)

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Add the destination
      addDestination({
        name: formData.name,
        location: formData.location,
        category: formData.category,
        description: formData.description,
        image: formData.image || "/diverse-travel-destinations.png",
      })

      // Show success and redirect
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/explore")
    } catch (error) {
      console.error("Error adding destination:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-secondary/5 to-background">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">Share a Hidden Gem</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Help fellow travelers discover amazing places by sharing your favorite hidden destinations
            </p>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-2xl">Destination Details</CardTitle>
              <CardDescription className="text-base">
                Fill in the information about the destination you'd like to share
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Destination Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Secret Beach Cove"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Algarve, Portugal"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-semibold">
                    Category / Tags
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category" className="h-12 text-base">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Culture">Culture</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Historical">Historical</SelectItem>
                      <SelectItem value="Urban">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Share what makes this place special, including tips for visitors..."
                    rows={6}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="text-base resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="image" className="text-base font-semibold">
                    Image Upload
                  </Label>
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImagePreview("")
                          setFileName("")
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }}
                        className="w-full"
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center hover:border-primary/60 hover:bg-primary/5 transition-all">
                      <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
                      <div className="space-y-3">
                        <Label
                          htmlFor="image"
                          className="cursor-pointer text-primary hover:text-primary/80 font-semibold text-base"
                        >
                          Choose a file
                        </Label>
                        <p className="text-muted-foreground">or drag and drop an image here</p>
                        {fileName && <p className="text-foreground font-medium mt-2">Selected: {fileName}</p>}
                      </div>
                      <Input id="image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-semibold" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5 animate-spin" />
                      Adding Destination...
                    </>
                  ) : (
                    "Add Destination"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
