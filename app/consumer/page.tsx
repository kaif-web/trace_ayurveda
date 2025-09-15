"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  QrCode,
  Search,
  MapPin,
  User,
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock,
  Leaf,
  Calendar,
  FileText,
} from "lucide-react"
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

interface TrackingResult {
  found: boolean
  entry?: HerbEntry
  journey?: {
    step: string
    title: string
    description: string
    date: string
    status: "completed" | "current" | "pending"
    icon: React.ReactNode
  }[]
}

export default function ConsumerPage() {
  const [batchId, setBatchId] = useState("")
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleTrackHerb = async () => {
    if (!batchId.trim()) return

    setIsSearching(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Search in localStorage
    const entries: HerbEntry[] = JSON.parse(localStorage.getItem("herbEntries") || "[]")
    const foundEntry = entries.find((entry) => entry.batchId.toLowerCase() === batchId.toLowerCase().trim())

    if (foundEntry) {
      // Create journey steps
      const journey = [
        {
          step: "1",
          title: "Farm Registration",
          description: `Registered by farmer ${foundEntry.farmerId} at ${foundEntry.location}`,
          date: foundEntry.timestamp,
          status: "completed" as const,
          icon: <User className="h-5 w-5 text-primary" />,
        },
        {
          step: "2",
          title: "Lab Verification",
          description:
            foundEntry.status === "pending"
              ? "Awaiting lab verification and quality testing"
              : foundEntry.status === "verified"
                ? `Verified by lab ${foundEntry.labId || "Unknown"} - Quality approved`
                : `Rejected by lab ${foundEntry.labId || "Unknown"} - Quality issues found`,
          date: foundEntry.verificationDate || "",
          status: foundEntry.status === "pending" ? "current" : "completed",
          icon: <FlaskConical className="h-5 w-5 text-secondary" />,
        },
        {
          step: "3",
          title: "Consumer Ready",
          description:
            foundEntry.status === "verified"
              ? "Herb is verified and ready for consumption"
              : foundEntry.status === "rejected"
                ? "Herb failed verification - not recommended for consumption"
                : "Pending lab verification completion",
          date: foundEntry.status === "verified" ? foundEntry.verificationDate || "" : "",
          status: foundEntry.status === "verified" ? "completed" : "pending",
          icon: <Leaf className="h-5 w-5 text-accent" />,
        },
      ]

      setTrackingResult({
        found: true,
        entry: foundEntry,
        journey,
      })
    } else {
      setTrackingResult({
        found: false,
      })
    }

    setIsSearching(false)
  }

  const handleQRScan = () => {
    // In a real app, this would open camera for QR scanning
    // For demo, we'll simulate with a sample batch ID
    const sampleBatchIds = JSON.parse(localStorage.getItem("herbEntries") || "[]").map(
      (entry: HerbEntry) => entry.batchId,
    )

    if (sampleBatchIds.length > 0) {
      setBatchId(sampleBatchIds[0])
    } else {
      setBatchId("AYU-1234567890-SAMPLE")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3" />
            Pending Verification
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Verified & Safe
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3" />
            Not Recommended
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "current":
        return <Clock className="h-6 w-6 text-yellow-600" />
      case "pending":
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
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
              <QrCode className="h-6 w-6 text-accent" />
              <h1 className="text-xl font-semibold">AyurTrace - Consumer Tracking</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Track Your Ayurvedic Herbs</h2>
            <p className="text-lg text-muted-foreground">
              Enter a batch ID or scan a QR code to view the complete journey of your herbs from farm to consumer.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Track Herb Journey
              </CardTitle>
              <CardDescription>
                Enter the batch ID from your herb package or QR code to view its complete traceability record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="batchId"
                    placeholder="e.g., AYU-1234567890-ABC123"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && handleTrackHerb()}
                  />
                  <Button onClick={handleQRScan} variant="outline" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Find the batch ID on your herb package or scan the QR code
                </p>
              </div>

              <Button onClick={handleTrackHerb} className="w-full" size="lg" disabled={isSearching || !batchId.trim()}>
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Searching Blockchain...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Track Herb Journey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {trackingResult && (
            <div className="space-y-6">
              {trackingResult.found && trackingResult.entry ? (
                <>
                  {/* Herb Information */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-primary" />
                          {trackingResult.entry.herbName}
                        </CardTitle>
                        {getStatusBadge(trackingResult.entry.status)}
                      </div>
                      <CardDescription>Batch ID: {trackingResult.entry.batchId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Farmer Information</p>
                              <p className="text-sm text-muted-foreground">ID: {trackingResult.entry.farmerId}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Farm Location</p>
                              <p className="text-sm text-muted-foreground">{trackingResult.entry.location}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Registration Date</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(trackingResult.entry.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {trackingResult.entry.verificationDate && (
                            <div className="flex items-start gap-3">
                              <FlaskConical className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Verification Date</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(trackingResult.entry.verificationDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {trackingResult.entry.description && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Additional Details</p>
                              <p className="text-sm text-muted-foreground">{trackingResult.entry.description}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {trackingResult.entry.labNotes && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex items-start gap-3">
                            <FlaskConical className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Lab Test Results</p>
                              <p className="text-sm text-muted-foreground">{trackingResult.entry.labNotes}</p>
                              {trackingResult.entry.labId && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Verified by: {trackingResult.entry.labId}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Journey Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Traceability Journey</CardTitle>
                      <CardDescription>Complete journey of your herb from farm to consumer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {trackingResult.journey?.map((step, index) => (
                          <div key={step.step} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              {getStepIcon(step.status)}
                              {index < trackingResult.journey!.length - 1 && (
                                <div className="w-px h-12 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <div className="flex items-center gap-2 mb-1">
                                {step.icon}
                                <h3 className="font-semibold">{step.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                              {step.date && (
                                <p className="text-xs text-muted-foreground">{new Date(step.date).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Safety Information */}
                  <Card
                    className={`border-l-4 ${
                      trackingResult.entry.status === "verified"
                        ? "border-l-green-500 bg-green-50/50"
                        : trackingResult.entry.status === "rejected"
                          ? "border-l-red-500 bg-red-50/50"
                          : "border-l-yellow-500 bg-yellow-50/50"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {trackingResult.entry.status === "verified" ? (
                          <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                        ) : trackingResult.entry.status === "rejected" ? (
                          <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-semibold mb-2">
                            {trackingResult.entry.status === "verified"
                              ? "Safe for Consumption"
                              : trackingResult.entry.status === "rejected"
                                ? "Not Recommended for Use"
                                : "Verification Pending"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {trackingResult.entry.status === "verified"
                              ? "This herb has passed all quality tests and is verified safe for consumption. The complete supply chain has been validated."
                              : trackingResult.entry.status === "rejected"
                                ? "This herb has failed quality verification tests. We recommend not using this product and contacting the supplier."
                                : "This herb is currently undergoing lab verification. Please check back later for updated results."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* Not Found */
                <Card className="border-l-4 border-l-red-500 bg-red-50/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-2">Batch ID Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          The batch ID "{batchId}" was not found in our blockchain records. This could mean:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• The batch ID was entered incorrectly</li>
                          <li>• The herb is not registered in our traceability system</li>
                          <li>• The QR code may be damaged or from a different system</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-4">
                          Please double-check the batch ID or contact your supplier for assistance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                How to Use This System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Finding Your Batch ID</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Look for a QR code on your herb package</li>
                    <li>• Check for a printed batch ID starting with "AYU-"</li>
                    <li>• The batch ID is usually on the product label</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Understanding Results</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <span className="text-green-600">Verified</span>: Safe for consumption
                    </li>
                    <li>
                      • <span className="text-yellow-600">Pending</span>: Under lab review
                    </li>
                    <li>
                      • <span className="text-red-600">Rejected</span>: Quality issues found
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
