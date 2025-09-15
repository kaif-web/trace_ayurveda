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

interface HerbEntry {
  id: string
  herbName: string
  location: string
  farmerId: string
  description: string
  timestamp: string
  batchId: string
  status: "pending" | "verified" | "rejected"
  labNotes?: string
  verificationDate?: string
  labId?: string
}

interface VerificationForm {
  status: "verified" | "rejected"
  labNotes: string
  labId: string
}

export default function LabPage() {
  const [herbEntries, setHerbEntries] = useState<HerbEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<HerbEntry | null>(null)
  const [verificationForm, setVerificationForm] = useState<VerificationForm>({
    status: "verified",
    labNotes: "",
    labId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load herb entries from localStorage
    const entries = JSON.parse(localStorage.getItem("herbEntries") || "[]")
    setHerbEntries(
      entries.map((entry: any) => ({
        ...entry,
        status: entry.status || "pending",
      })),
    )
  }, [])

  const filteredEntries = herbEntries.filter(
    (entry) =>
      entry.herbName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.farmerId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingEntries = filteredEntries.filter((entry) => entry.status === "pending")
  const verifiedEntries = filteredEntries.filter((entry) => entry.status === "verified")
  const rejectedEntries = filteredEntries.filter((entry) => entry.status === "rejected")

  const handleVerification = async (entry: HerbEntry) => {
    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedEntry: HerbEntry = {
      ...entry,
      status: verificationForm.status,
      labNotes: verificationForm.labNotes,
      labId: verificationForm.labId,
      verificationDate: new Date().toISOString(),
    }

    // Update localStorage
    const allEntries = JSON.parse(localStorage.getItem("herbEntries") || "[]")
    const updatedEntries = allEntries.map((e: HerbEntry) => (e.id === entry.id ? updatedEntry : e))
    localStorage.setItem("herbEntries", JSON.stringify(updatedEntries))

    // Update state
    setHerbEntries(updatedEntries)
    setSelectedEntry(null)
    setVerificationForm({ status: "verified", labNotes: "", labId: "" })
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

        {/* Search and Stats */}
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
                      <TableCell className="font-mono text-sm">{entry.batchId}</TableCell>
                      <TableCell className="font-medium">{entry.herbName}</TableCell>
                      <TableCell>{entry.farmerId}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.location}</TableCell>
                      <TableCell>{new Date(entry.timestamp).toLocaleDateString()}</TableCell>
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
                                    <p className="font-medium">{selectedEntry.herbName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Batch ID</Label>
                                    <p className="font-mono text-sm">{selectedEntry.batchId}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Farmer ID</Label>
                                    <p className="font-medium">{selectedEntry.farmerId}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Submitted</Label>
                                    <p>{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm text-muted-foreground">Location</Label>
                                    <p>{selectedEntry.location}</p>
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
                                    <Label htmlFor="labId">Lab ID *</Label>
                                    <Input
                                      id="labId"
                                      placeholder="e.g., LAB001, Your Lab Registration"
                                      value={verificationForm.labId}
                                      onChange={(e) =>
                                        setVerificationForm((prev) => ({
                                          ...prev,
                                          labId: e.target.value,
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
                                    <Label htmlFor="labNotes">Lab Notes & Test Results *</Label>
                                    <Textarea
                                      id="labNotes"
                                      placeholder="Enter detailed test results, quality assessment, purity levels, contamination checks, etc."
                                      value={verificationForm.labNotes}
                                      onChange={(e) =>
                                        setVerificationForm((prev) => ({
                                          ...prev,
                                          labNotes: e.target.value,
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
                                  setVerificationForm({ status: "verified", labNotes: "", labId: "" })
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => selectedEntry && handleVerification(selectedEntry)}
                                disabled={isSubmitting || !verificationForm.labId || !verificationForm.labNotes}
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

        {/* Verified Entries */}
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
                        new Date(b.verificationDate || 0).getTime() - new Date(a.verificationDate || 0).getTime(),
                    )
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">{entry.batchId}</TableCell>
                        <TableCell className="font-medium">{entry.herbName}</TableCell>
                        <TableCell>{entry.farmerId}</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>{entry.labId}</TableCell>
                        <TableCell>
                          {entry.verificationDate ? new Date(entry.verificationDate).toLocaleDateString() : "-"}
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
