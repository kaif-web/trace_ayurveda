"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FlaskConical, CheckCircle, XCircle, Clock, Search, Eye } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabaseClient"  // import your supabase client

interface HerbEntry {
  id: string
  herb_name: string
  farmer_id: string
  geo_tag?: { location: string }
  description?: string
  created_at: string
  harvest_date?: string | null
  status: string
  lab_notes?: string
  lab_id?: string
  verification_date?: string
}

export default function LabPage() {
  const [herbEntries, setHerbEntries] = useState<HerbEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<HerbEntry | null>(null)
  const [labNotes, setLabNotes] = useState("")
  const [labId, setLabId] = useState("")
  const [statusChoice, setStatusChoice] = useState<"Verified" | "Rejected">("Verified")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data, error } = await supabase.from("Herbs").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching herbs:", error)
    } else {
      const normalized = (data || []).map((d: any) => ({
        ...d,
        status: d.status || "Pending Verification",
      }))
      setHerbEntries(normalized)
    }
    setLoading(false)
  }

  async function handleVerification(entry: HerbEntry) {
    setIsSubmitting(true)
    const { error } = await supabase
      .from("Herbs")
      .update({
        status: statusChoice,
        lab_notes: labNotes,
        lab_id: labId,
        verification_date: new Date().toISOString(),
      })
      .eq("id", entry.id)

    if (error) {
      console.error("Error updating herb:", error)
      alert("Failed to update: " + error.message)
    } else {
      await fetchEntries()
      setSelectedEntry(null)
      setLabNotes("")
      setLabId("")
      setStatusChoice("Verified")
    }
    setIsSubmitting(false)
  }

  const filteredEntries = herbEntries.filter((entry) => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return (
      (entry.herb_name || "").toLowerCase().includes(q) ||
      (entry.farmer_id || "").toLowerCase().includes(q) ||
      (entry.description || "").toLowerCase().includes(q)
    )
  })

  const pendingEntries = filteredEntries.filter((e) => e.status === "Pending Verification")
  const verifiedEntries = filteredEntries.filter((e) => e.status === "Verified")
  const rejectedEntries = filteredEntries.filter((e) => e.status === "Rejected")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Verification":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600 flex gap-1"><Clock className="h-3 w-3"/>Pending</Badge>
      case "Verified":
        return <Badge variant="default" className="bg-green-600 flex gap-1"><CheckCircle className="h-3 w-3"/>Verified</Badge>
      case "Rejected":
        return <Badge variant="destructive" className="flex gap-1"><XCircle className="h-3 w-3"/>Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" /> Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-secondary" />
              <h1 className="text-xl font-semibold">AyurTrace - Lab Verification Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Herb Verification Dashboard</h2>
          <p className="text-lg text-muted-foreground">
            Review and verify Ayurvedic herb entries from farmers to ensure quality and authenticity.
          </p>
        </div>

        {/* Search and stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by herb name, batch ID, or farmer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingEntries.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{verifiedEntries.length}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Entries Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-600" /> Pending Verification ({pendingEntries.length})</CardTitle>
            <CardDescription>Herb entries awaiting lab verification</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending entries found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Herb Name</TableHead>
                    <TableHead>Farmer ID</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.herb_name}</TableCell>
                      <TableCell>{entry.farmer_id}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedEntry(entry)}>
                              <Eye className="h-4 w-4 mr-1" /> Verify
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verify Herb Entry</DialogTitle>
                              <DialogDescription>Review and decide verification</DialogDescription>
                            </DialogHeader>
                            {selectedEntry && (
                              <div className="space-y-4">
                                <p><strong>Herb:</strong> {selectedEntry.herb_name}</p>
                                <p><strong>Farmer ID:</strong> {selectedEntry.farmer_id}</p>
                                <p><strong>Submitted:</strong> {new Date(selectedEntry.created_at).toLocaleString()}</p>

                                <Label>Lab ID *</Label>
                                <Input value={labId} onChange={(e) => setLabId(e.target.value)} required />

                                <Label>Status *</Label>
                                <Select value={statusChoice} onValueChange={(v: any) => setStatusChoice(v)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Verified">
                                      <CheckCircle className="h-4 w-4 text-green-600" /> Verified
                                    </SelectItem>
                                    <SelectItem value="Rejected">
                                      <XCircle className="h-4 w-4 text-red-600" /> Rejected
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                <Label>Lab Notes *</Label>
                                <Textarea value={labNotes} onChange={(e) => setLabNotes(e.target.value)} required />
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedEntry(null)}>Cancel</Button>
                              <Button
                                onClick={() => selectedEntry && handleVerification(selectedEntry)}
                                disabled={isSubmitting || !labId || !labNotes}
                              >
                                {isSubmitting ? "Submitting..." : "Submit"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Verified Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Verification History ({verifiedEntries.length + rejectedEntries.length})</CardTitle>
            <CardDescription>Processed herb entries with verification results</CardDescription>
          </CardHeader>
          <CardContent>
            {verifiedEntries.length + rejectedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No history available.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Herb</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...verifiedEntries, ...rejectedEntries].map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.herb_name}</TableCell>
                      <TableCell>{entry.farmer_id}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>{entry.lab_id || "-"}</TableCell>
                      <TableCell>{entry.verification_date ? new Date(entry.verification_date).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
