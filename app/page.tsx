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
import { ArrowLeft, FlaskConical, CheckCircle, XCircle, Clock, Search, Eye, Leaf } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabaseClient"

interface HerbEntry {
  id: string
  herb_name: string
  geo_tag: {
    location: string
  }
  farmer_id: string
  description: string
  created_at: string
  batch_id: string
  status: "pending" | "verified" | "rejected"
  lab_notes?: string
  verification_date?: string
  lab_id?: string
  harvest_date?: string
}

interface VerificationForm {
  status: "verified" | "rejected"
  lab_notes: string
  lab_id: string
}

export default function LabPage() {
  const [herbEntries, setHerbEntries] = useState<HerbEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<HerbEntry | null>(null)
  const [verificationForm, setVerificationForm] = useState<VerificationForm>({
    status: "verified",
    lab_notes: "",
    lab_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch herbs from Supabase
  useEffect(() => {
    fetchHerbs()
  }, [])

  const fetchHerbs = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("Herbs").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching herbs:", error)
    } else {
      // Transform the data to match your interface
      const transformedData: HerbEntry[] = data.map((herb: any) => ({
        id: herb.id,
        herb_name: herb.herb_name,
        geo_tag: herb.geo_tag || { location: "" },
        farmer_id: herb.farmer_id,
        description: herb.description || "",
        created_at: herb.created_at,
        batch_id: herb.batch_id || `BATCH-${herb.id.slice(0, 8)}`,
        status: (herb.status || "pending") as "pending" | "verified" | "rejected",
        lab_notes: herb.lab_notes,
        verification_date: herb.verification_date,
        lab_id: herb.lab_id,
        harvest_date: herb.harvest_date
      }))
      setHerbEntries(transformedData)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: "verified" | "rejected", lab_notes: string, lab_id: string) => {
    const updateData = {
      status,
      lab_notes,
      lab_id,
      verification_date: new Date().toISOString()
    }

    const { error } = await supabase.from("Herbs").update(updateData).eq("id", id)
    if (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status: " + error.message)
      return false
    } else {
      // Update local state
      setHerbEntries(prev =>
        prev.map(herb =>
          herb.id === id ? { ...herb, ...updateData } : herb
        )
      )
      return true
    }
  }

  const filteredEntries = herbEntries.filter(
    (entry) =>
      entry.herb_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.farmer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const pendingEntries = filteredEntries.filter((entry) => entry.status === "pending")
  const verifiedEntries = filteredEntries.filter((entry) => entry.status === "verified")
  const rejectedEntries = filteredEntries.filter((entry) => entry.status === "rejected")

  const handleVerification = async (entry: HerbEntry) => {
    if (!verificationForm.lab_id || !verificationForm.lab_notes) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    const success = await updateStatus(
      entry.id,
      verificationForm.status,
      verificationForm.lab_notes,
      verificationForm.lab_id
    )

    if (success) {
      setSelectedEntry(null)
      setVerificationForm({ status: "verified", lab_notes: "", lab_id: "" })
    }

    setIsSubmitting(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading && herbEntries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading herb entries...</p>
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
              <Leaf className="h-6 w-6 text-secondary" />
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

        {/* Search and Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by herb name, batch ID, farmer ID, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingEntries.length}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{verifiedEntries.length}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Entries Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Verification ({pendingEntries.length})
            </CardTitle>
            <CardDescription>Herb entries awaiting lab verification and quality assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending entries found. All herbs have been processed.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Herb Name</TableHead>
                    <TableHead>Farmer ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.batch_id}</TableCell>
                      <TableCell className="font-medium">{entry.herb_name}</TableCell>
                      <TableCell>{entry.farmer_id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.geo_tag?.location || "N/A"}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedEntry(entry)} className="mr-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verify Herb Entry</DialogTitle>
                              <DialogDescription>
                                Review the herb details and provide your verification decision
                              </DialogDescription>
                            </DialogHeader>

                            {selectedEntry && (
                              <div className="space-y-6">
                                {/* Herb Details */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Herb Name</Label>
                                    <p className="font-medium">{selectedEntry.herb_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Batch ID</Label>
                                    <p className="font-mono text-sm">{selectedEntry.batch_id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Farmer ID</Label>
                                    <p className="font-medium">{selectedEntry.farmer_id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Submitted</Label>
                                    <p>{new Date(selectedEntry.created_at).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Harvest Date</Label>
                                    <p>{selectedEntry.harvest_date || "Not provided"}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm text-muted-foreground">Location</Label>
                                    <p>{selectedEntry.geo_tag?.location || "N/A"}</p>
                                  </div>
                                  {selectedEntry.description && (
                                    <div className="col-span-2">
                                      <Label className="text-sm text-muted-foreground">Additional Details</Label>
                                      <p className="text-sm">{selectedEntry.description}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Verification Form */}
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="lab_id">Lab ID *</Label>
                                    <Input
                                      id="lab_id"
                                      placeholder="e.g., LAB001, Your Lab Registration"
                                      value={verificationForm.lab_id}
                                      onChange={(e) =>
                                        setVerificationForm((prev) => ({
                                          ...prev,
                                          lab_id: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="status">Verification Status *</Label>
                                    <Select
                                      value={verificationForm.status}
                                      onValueChange={(value: "verified" | "rejected") =>
                                        setVerificationForm((prev) => ({ ...prev, status: value }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="verified">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            Verified - Quality Approved
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                          <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            Rejected - Quality Issues
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="lab_notes">Lab Notes & Test Results *</Label>
                                    <Textarea
                                      id="lab_notes"
                                      placeholder="Enter detailed test results, quality assessment, purity levels, contamination checks, etc."
                                      value={verificationForm.lab_notes}
                                      onChange={(e) =>
                                        setVerificationForm((prev) => ({
                                          ...prev,
                                          lab_notes: e.target.value,
                                        }))
                                      }
                                      rows={4}
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedEntry(null)
                                  setVerificationForm({ status: "verified", lab_notes: "", lab_id: "" })
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => selectedEntry && handleVerification(selectedEntry)}
                                disabled={isSubmitting || !verificationForm.lab_id || !verificationForm.lab_notes}
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <FlaskConical className="h-4 w-4 mr-2" />
                                    Submit Verification
                                  </>
                                )}
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

        {/* Verification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Verification History ({verifiedEntries.length + rejectedEntries.length})
            </CardTitle>
            <CardDescription>Previously processed herb entries with verification results</CardDescription>
          </CardHeader>
          <CardContent>
            {verifiedEntries.length + rejectedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No verification history available yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Herb Name</TableHead>
                    <TableHead>Farmer ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lab ID</TableHead>
                    <TableHead>Verified Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...verifiedEntries, ...rejectedEntries]
                    .sort(
                      (a, b) =>
                        new Date(b.verification_date || 0).getTime() - new Date(a.verification_date || 0).getTime(),
                    )
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">{entry.batch_id}</TableCell>
                        <TableCell className="font-medium">{entry.herb_name}</TableCell>
                        <TableCell>{entry.farmer_id}</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>{entry.lab_id || "-"}</TableCell>
                        <TableCell>
                          {entry.verification_date ? new Date(entry.verification_date).toLocaleDateString() : "-"}
                        </TableCell>
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