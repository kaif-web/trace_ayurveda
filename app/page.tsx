'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, Shield, Users, QrCode, MapPin, FlaskConical, Calendar, User, AlertCircle } from "lucide-react"
import Link from "next/link"
import supabase from '@/lib/supabaseClient'

interface HerbData {
  id: string // UUID
  farmer_id: number | null
  herb_name: string | null
  geo_tag: any // JSON field
  harvest_date: string | null // Format: YYYY-MM-DD
  status: string | null
  description?: string | null
  created_at: string
}

export default function HomePage() {
  const [herbs, setHerbs] = useState<HerbData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      
      return `${day}-${month}-${year}`
    } catch {
      return 'Invalid date'
    }
  }

  // Format timestamp
  const formatDateTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return 'Invalid date'
    }
  }

  // Safely extract location from geo_tag JSON
  const getLocation = (geoTag: any): string => {
    if (!geoTag) return 'Location not specified'
    
    try {
      // If geo_tag is a string, try to parse it as JSON
      if (typeof geoTag === 'string') {
        const parsed = JSON.parse(geoTag)
        return parsed.location || parsed.address || 'Location not specified'
      }
      
      // If geo_tag is already an object
      if (typeof geoTag === 'object') {
        return geoTag.location || geoTag.address || geoTag.coordinates || 'Location not specified'
      }
      
      return 'Location not specified'
    } catch {
      return 'Location not specified'
    }
  }

  // Fetch herbs from Supabase
  useEffect(() => {
    const fetchHerbs = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔍 Fetching herbs from Supabase...')

        const { data, error } = await supabase
          .from('Herbs') // Note: Table name is "Herbs" with capital H
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Supabase error:', error)
          setError(`Database error: ${error.message}`)
          setHerbs([])
          return
        }

        console.log('✅ Fetched herbs:', data)
        setHerbs(data || [])
        
      } catch (err: any) {
        console.error('💥 Unexpected error:', err)
        setError(`Failed to load herbs: ${err.message}`)
        setHerbs([])
      } finally {
        setLoading(false)
      }
    }

    fetchHerbs()
  }, [])

  // Realtime subscription
  useEffect(() => {
    console.log('📡 Setting up realtime subscription...')

    const channel = supabase
      .channel('herbs-realtime-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'Herbs' // Capital H
        },
        (payload) => {
          console.log('🆕 New herb inserted:', payload.new)
          setHerbs((prev) => [payload.new as HerbData, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'Herbs' // Capital H
        },
        (payload) => {
          console.log('✏️ Herb updated:', payload.new)
          setHerbs((prev) => prev.map(herb => 
            herb.id === payload.new.id ? payload.new as HerbData : herb
          ))
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'Herbs' // Capital H
        },
        (payload) => {
          console.log('🗑️ Herb deleted:', payload.old)
          setHerbs((prev) => prev.filter(herb => herb.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        console.log('📊 Realtime subscription status:', status)
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription failed')
          setError('Realtime updates disabled - using static data')
        }
      })

    return () => {
      console.log('🧹 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'pending verification':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getStatusText = (status: string | null) => {
    if (!status) return 'Not Set'
    return status
  }

  return (
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
              <Link href="#herbs" className="text-muted-foreground hover:text-foreground transition-colors">
                Herbs Database
              </Link>
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
              Trust, Transparency & Traceability for Ayurveda. Track your herbs from farm to consumer with blockchain technology.
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
                  <Link href="/lab">
                    <Button variant="secondary" className="w-full" size="lg">
                      Verify Herbs
                    </Button>
                  </Link>
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

      {/* Herbs Database Section */}
      <section id="herbs" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Live Herbs Database</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time view of all registered herbs in our blockchain system with their verification status.
            </p>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-8">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-700 font-medium">{error}</p>
              <p className="text-yellow-600 text-sm mt-2">
                Data will refresh automatically when connection is restored
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading herbs data from Supabase...</p>
            </div>
          ) : herbs.length === 0 ? (
            <div className="text-center">
              <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No herbs registered yet.</p>
              <Button asChild>
                <Link href="/farmer">Be the first farmer to add herbs!</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Badge variant="secondary" className="text-sm">
                  {herbs.length} herb{herbs.length !== 1 ? 's' : ''} registered
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Updates in real-time • Last refresh: {new Date().toLocaleTimeString()}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {herbs.map((herb) => (
                  <Card key={herb.id} className="hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-primary" />
                            {herb.herb_name || 'Unnamed Herb'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            Farmer ID: {herb.farmer_id || 'Not specified'}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(herb.status)}>
                          {getStatusText(herb.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {getLocation(herb.geo_tag)}
                        </span>
                      </div>
                      
                      {herb.harvest_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            Harvested: {formatDate(herb.harvest_date)}
                          </span>
                        </div>
                      )}
                      
                      {herb.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {herb.description}
                        </p>
                      )}
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Registered: {formatDateTime(herb.created_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
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
      <section id="how-it-works" className="py-20 px-4 bg-card/30">
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
          <div className="flex justify-center gap-4">
            <Link href="/blockchain" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Blockchain Explorer
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/farmer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Add New Herb
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}