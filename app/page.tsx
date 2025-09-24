"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf, CheckCircle, XCircle } from "lucide-react"

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

export default function LabsPage() {
  const [herbs, setHerbs] = useState<HerbEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // fetch herbs
  useEffect(() => {
    fetchHerbs()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <header className="flex items-center gap-2 mb-8">
        <Leaf className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Lab Verification Portal</h1>
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
}
