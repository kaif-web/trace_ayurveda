"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf, Shield, Users, QrCode, MapPin, FlaskConical, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabaseClient"

interface HerbEntry {
  id: string
  farmer_id: string
  herb_name: string
  geo_tag: { location: string }
  harvest_date: string | null
  status: string
  description?: string
  created_at: string
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<'home' | 'lab'>('home')
  const [herbs, setHerbs] = useState<HerbEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  // fetch herbs when lab view is active
  useEffect(() => {
    if (activeView === 'lab') {
      fetchHerbs()
    }
  }, [activeView])

  const fetchHerbs = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("Herbs").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching herbs:", error)
    } else {
      setHerbs(data as HerbEntry[])
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("Herbs").update({ status }).eq("id", id)
    if (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status: " + error.message)
    } else {
      setHerbs((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status } : h))
      )
    }
  }

  // filter herbs by search input
  const filteredHerbs = herbs.filter(
    (h) =>
      h.herb_name.toLowerCase().includes(search.toLowerCase()) ||
      h.farmer_id.toLowerCase().includes(search.toLowerCase()) ||
      (h.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  // Lab View Component
  const LabView = () => (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <header className="flex items-center gap-2 mb-8">
        <Leaf className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Lab Verification Portal</h1>
        <Button 
          onClick={() => setActiveView('home')} 
          variant="outline" 
          className="ml-auto"
        >
          Back to Home
        </Button>
      </header>

      {/* Search bar */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search by herb name, farmer ID, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading herbs...</p>
      ) : filteredHerbs.length === 0 ? (
        <p>No herbs found.</p>
      ) : (
        <div className="grid gap-6">
          {filteredHerbs.map((herb) => (
            <Card key={herb.id} className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{herb.herb_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(herb.created_at).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><b>Farmer ID:</b> {herb.farmer_id}</p>
                <p><b>Location:</b> {herb.geo_tag.location}</p>
                <p><b>Harvest Date:</b> {herb.harvest_date || "Not provided"}</p>
                <p><b>Description:</b> {herb.description || "—"}</p>
                <p><b>Status:</b> {herb.status}</p>

                <div className="flex gap-3 mt-4">
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => updateStatus(herb.id, "Verified")}
                    disabled={herb.status === "Verified"}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => updateStatus(herb.id, "Rejected")}
                    disabled={herb.status === "Rejected"}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // Home View Component
  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">AyurTrace</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
              Blockchain Traceability for Ayurvedic Herbs
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Trust, Transparency & Traceability for Ayurveda. Track your herbs from farm to consumer with blockchain
              technology.
            </p>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">For Farmers</CardTitle>
                  <CardDescription>Register your herbs and get blockchain verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/farmer">
                    <Button className="w-full" size="lg">
                      Enter Herb Data
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <FlaskConical className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">For Labs</CardTitle>
                  <CardDescription>Verify and authenticate herb quality and origin</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    size="lg"
                    onClick={() => setActiveView('lab')}
                  >
                    Verify Herbs
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <QrCode className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-xl">For Consumers</CardTitle>
                  <CardDescription>Track your herbs' complete journey and authenticity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/consumer">
                    <Button variant="outline" className="w-full bg-transparent" size="lg">
                      Track Herbs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why Choose AyurTrace?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our blockchain-based system ensures complete transparency and trust in the Ayurvedic herb supply chain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-4">Blockchain Security</h4>
              <p className="text-muted-foreground">
                Immutable records ensure data integrity and prevent tampering throughout the supply chain.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold mb-4">Complete Traceability</h4>
              <p className="text-muted-foreground">
                Track herbs from farm location to final consumer with GPS coordinates and timestamps.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <QrCode className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-4">QR Code Verification</h4>
              <p className="text-muted-foreground">
                Instant verification through QR codes linking to complete herb journey and lab results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">How It Works</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple three-step process ensuring transparency from farm to consumer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 text-xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-4">Farmer Registration</h4>
              <p className="text-muted-foreground">
                Farmers register herbs with location data and receive unique batch IDs with QR codes.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mb-6 text-xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-4">Lab Verification</h4>
              <p className="text-muted-foreground">
                Certified labs verify herb quality and authenticity, updating blockchain records.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center mb-6 text-xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-4">Consumer Tracking</h4>
              <p className="text-muted-foreground">
                Consumers scan QR codes to view complete herb journey and verification status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">AyurTrace</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Ensuring trust and transparency in Ayurvedic herb supply chains through blockchain technology.
          </p>
          <div className="flex justify-center">
            <Link href="/blockchain" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Blockchain Explorer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )

  // Conditional rendering based on active view
  return activeView === 'home' ? <HomeView /> : <LabView />
}

