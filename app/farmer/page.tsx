"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Leaf, MapPin, User, QrCode, CheckCircle } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import supabase from "@/lib/supabaseClient"

// This interface matches the data structure of your form state
interface FormDataType {
  herbName: string
  location: string
  farmerId: string
  description: string
}

// This interface matches the data structure you get back from Supabase
interface HerbEntry {
  id: string
  herbName: string
  location: string
  farmerId: string
  description: string
  timestamp: string
  batchId: string
  status: string
}

// This interface perfectly matches the object we send to Supabase for insertion
interface DatabaseInsertType {
  batchId: string
  herbName: string
  location: string
  farmerId: string
  description: string
  timestamp: string
  status: string
}

export default function FarmerPage() {
  const [formData, setFormData] = useState<FormDataType>({
    herbName: "",
    location: "",
    farmerId: "",
    description: "",
  })
  const [submittedEntry, setSubmittedEntry] = useState<HerbEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const generateBatchId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    // Fixed: Using template literal properly
    return 'AYU-${timestamp}-${random}'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const batchId = generateBatchId()

      const newEntry: DatabaseInsertType = {
        batchId,
        herbName: formData.herbName,
        location: formData.location,
        farmerId: formData.farmerId,
        description: formData.description,
        timestamp: new Date().toISOString(),
        status: "Pending Verification",
      }

      // Save to Supabase table "herb_entries"
      const { data, error } = await supabase
        .from("herb_entries")
        .insert([newEntry])
        .select() as { data: HerbEntry[] | null, error: any }

      if (error) {
        console.error("Supabase insert error:", error.message)
        alert("Failed to save to Supabase: " + error.message)
      } else {
        console.log("Inserted into Supabase:", data)
        const [insertedItem] = data || []
        if (insertedItem) {
          setSubmittedEntry(insertedItem)
          
          const existingEntries = JSON.parse(localStorage.getItem("herbEntries") || "[]")
          existingEntries.push(newEntry)
          localStorage.setItem("herbEntries", JSON.stringify(existingEntries))
        } else {
          alert("Data was inserted but could not be retrieved.")
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred while submitting the form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewEntry = () => {
    setSubmittedEntry(null)
    setFormData({
      herbName: "",
      location: "",
      farmerId: "",
      description: "",
    })
  }

  if (submittedEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Home
              </Link>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">AyurTrace - Farmer Portal</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Entry Successful!</CardTitle>
                <CardDescription>Your herb has been registered on the blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Herb Name</Label>
                    <p className="font-medium">{submittedEntry.herbName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Farmer ID</Label>
                    <p className="font-medium">{submittedEntry.farmerId}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">{submittedEntry.location}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Batch ID</Label>
                    <p className="font-mono text-lg font-bold text-primary">{submittedEntry.batchId}</p>
                  </div>
                </div>

                <div className="text-center">
                  <Label className="text-muted-foreground mb-4 block">QR Code for Tracking</Label>
                  <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG
                      value={JSON.stringify({
                        batchId: submittedEntry.batchId,
                        herbName: submittedEntry.herbName,
                        farmerId: submittedEntry.farmerId,
                        timestamp: submittedEntry.timestamp,
                      })}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share this QR code with labs and consumers for tracking
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleNewEntry} className="flex-1">
                    Register Another Herb
                  </Button>
                  <Button variant="outline" onClick={() => window.print()} className="flex-1">
                    Print QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">AyurTrace - Farmer Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Register Your Ayurvedic Herbs</h2>
            <p className="text-lg text-muted-foreground">
              Enter your herb details to create a blockchain record and receive a unique tracking QR code.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Herb Registration Form
              </CardTitle>
              <CardDescription>All fields are required to create a complete blockchain record</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="herbName">Herb Name *</Label>
                  <Input
                    id="herbName"
                    name="herbName"
                    placeholder="e.g., Tulsi, Ashwagandha, Turmeric"
                    value={formData.herbName}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Farm Location (GPS Coordinates) *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., 28.6139° N, 77.2090° E or Village Name, District, State"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter GPS coordinates or detailed address for precise tracking
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmerId">Farmer ID *</Label>
                  <Input
                    id="farmerId"
                    name="farmerId"
                    placeholder="e.g., FARM001, Your Registration Number"
                    value={formData.farmerId}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Organic certification, harvest date, growing conditions, etc."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !formData.herbName || !formData.location || !formData.farmerId}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5 mr-2" />
                      Register Herb & Generate QR Code
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              What happens next?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your herb data will be stored on the blockchain</li>
              <li>• You'll receive a unique Batch ID and QR code</li>
              <li>• Labs can verify your herbs using the Batch ID</li>
              <li>• Consumers can track the complete journey</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}