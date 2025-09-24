"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// ✅ Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Herb = {
  id: number
  name: string
  description: string
  status: "pending" | "verified" | "rejected"
  lab_notes?: string
  lab_id?: string
  verification_date?: string
}

export default function LabsPage() {
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<Herb | null>(null)
  const [verificationForm, setVerificationForm] = useState({
    status: "verified",
    labNotes: "",
    labId: "",
  })

  // ✅ Fetch herbs from Supabase
  useEffect(() => {
    fetchHerbs()
  }, [])

  async function fetchHerbs() {
    const { data, error } = await supabase.from("Herbs").select("*")
    if (error) console.error("Error fetching herbs:", error)
    else setHerbs(data as Herb[])
  }

  // ✅ Handle verification & update Supabase
  async function handleVerification() {
    if (!selectedEntry) return

    const { error } = await supabase
      .from("Herbs")
      .update({
        status: verificationForm.status,
        lab_notes: verificationForm.labNotes,
        lab_id: verificationForm.labId,
        verification_date: new Date().toISOString(),
      })
      .eq("id", selectedEntry.id)

    if (error) {
      console.error("Error updating herb:", error)
      return
    }

    setSelectedEntry(null)
    setVerificationForm({ status: "verified", labNotes: "", labId: "" })
    fetchHerbs()
  }

  const filteredHerbs = herbs.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = herbs.filter((h) => h.status === "pending").length
  const verifiedCount = herbs.filter((h) => h.status === "verified").length
  const rejectedCount = herbs.filter((h) => h.status === "rejected").length

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{verifiedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search herbs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {["pending", "verified", "rejected"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredHerbs
                .filter((h) => h.status === status)
                .map((entry) => (
                  <Card key={entry.id} className="cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                    <CardHeader>
                      <CardTitle>{entry.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{entry.description}</p>
                      {entry.lab_notes && <p className="mt-2 text-sm text-gray-600">Notes: {entry.lab_notes}</p>}
                      {entry.lab_id && <p className="text-sm text-gray-600">Lab ID: {entry.lab_id}</p>}
                      {entry.verification_date && (
                        <p className="text-sm text-gray-500">
                          Verified on {new Date(entry.verification_date).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog for verification */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Herb</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-medium">{selectedEntry?.name}</p>
            <p>{selectedEntry?.description}</p>

            <div>
              <Label>Status</Label>
              <select
                value={verificationForm.status}
                onChange={(e) => setVerificationForm({ ...verificationForm, status: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <Label>Lab Notes</Label>
              <Textarea
                value={verificationForm.labNotes}
                onChange={(e) => setVerificationForm({ ...verificationForm, labNotes: e.target.value })}
              />
            </div>

            <div>
              <Label>Lab ID</Label>
              <Input
                value={verificationForm.labId}
                onChange={(e) => setVerificationForm({ ...verificationForm, labId: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleVerification}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}