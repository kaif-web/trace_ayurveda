"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  lab_notes?: string
  lab_id?: string
  verification_date?: string
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<'home' | 'lab'>('home')
  const [herbs, setHerbs] = useState<HerbEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [labNotes, setLabNotes] = useState("")
  const [labId, setLabId] = useState("")

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
    const { error } = await supabase.from("Herbs").update({
      status,
      lab_notes: labNotes,
      lab_id: labId,
      verification_date: new Date().toISOString(),
    }).eq("id", id)

    if (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status: " + error.message)
    } else {
      setHerbs((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, status, lab_notes: labNotes, lab_id: labId, verification_date: new Date().toISOString() }
            : h
        )
      )
      setLabNotes("")
      setLabId("")
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
                {herb.lab_notes && <p><b>Lab Notes:</b> {herb.lab_notes}</p>}
                {herb.lab_id && <p><b>Lab ID:</b> {herb.lab_id}</p>}
                {herb.verification_date && (
                  <p><b>Verified On:</b> {new Date(herb.verification_date).toLocaleDateString()}</p>
                )}

                {/* Lab input fields */}
                <div className="mt-4 space-y-2">
                  <Input
                    placeholder="Enter Lab ID"
                    value={labId}
                    onChange={(e) => setLabId(e.target.value)}
                  />
                  <Textarea
                    placeholder="Enter Lab Notes"
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                  />
                </div>

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

  // ✅ Home View unchanged
  const HomeView = () => (
    // ... keep your full HomeView code same as before ...
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* (your entire home UI unchanged) */}
    </div>
  )

  return activeView === 'home' ? <HomeView /> : <LabView />
}