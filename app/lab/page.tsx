"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf, FlaskConical } from "lucide-react"
import Link from "next/link"

// ✅ Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface HerbEntry {
  id: string
  herb_name: string
  farmer_id: string
  status: string
  harvest_date: string | null
  description?: string
  created_at: string
}

export default function LabPage() {
  const [herbs, setHerbs] = useState<HerbEntry[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchHerbs()
  }, [])

  async function fetchHerbs() {
    const { data, error } = await supabase
      .from("Herbs")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) console.error(error)
    else setHerbs(data as HerbEntry[])
  }

  // ✅ update herb status
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("Herbs").update({ status }).eq("id", id)

    if (error) console.error(error)
    else {
      setHerbs((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)))
    }
  }

  // ✅ filter herbs by search
  const filteredHerbs = herbs.filter(
    (h) =>
      h.herb_name.toLowerCase().includes(search.toLowerCase()) ||
      h.farmer_id.toLowerCase().includes(search.toLowerCase()) ||
      (h.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

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
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
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
              Lab Verification Dashboard
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Search, approve or reject Ayurvedic herbs submitted by farmers.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-10">
              <Input
                placeholder="Search by herb name, farmer ID, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Herbs List */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredHerbs.length === 0 ? (
                <p className="text-muted-foreground">No herbs found.</p>
              ) : (
                filteredHerbs.map((herb) => (
                  <Card key={herb.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                        <FlaskConical className="h-8 w-8 text-secondary" />
                      </div>
                      <CardTitle className="text-xl">{herb.herb_name}</CardTitle>
                      <CardDescription>Status: {herb.status}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-left space-y-2">
                      <p><strong>Farmer ID:</strong> {herb.farmer_id}</p>
                      <p><strong>Harvest Date:</strong> {herb.harvest_date || "Not provided"}</p>
                      <p><strong>Description:</strong> {herb.description || "—"}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(herb.created_at).toLocaleString()}
                      </p>

                      {/* Approve / Reject buttons */}
                      <div className="flex gap-3 mt-4 justify-center">
                        <Button
                          onClick={() => updateStatus(herb.id, "Verified")}
                          disabled={herb.status === "Verified"}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => updateStatus(herb.id, "Rejected")}
                          disabled={herb.status === "Rejected"}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
