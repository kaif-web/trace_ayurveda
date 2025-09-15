"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Database, Shield, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface BlockchainInfo {
  length: number
  latestBlock: any
  isValid: boolean
  difficulty: number
  network: string
  consensus: string
  description: string
}

interface HerbEntry {
  id: string
  herbName: string
  location: string
  farmerId: string
  batchId: string
  status: string
  timestamp: string
  blockHash?: string
}

export default function BlockchainPage() {
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null)
  const [herbs, setHerbs] = useState<HerbEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBlockchainData = async () => {
    setIsLoading(true)
    try {
      // Fetch blockchain info
      const infoResponse = await fetch("/api/blockchain/info")
      const infoData = await infoResponse.json()

      // Fetch all herbs
      const herbsResponse = await fetch("/api/herbs")
      const herbsData = await herbsResponse.json()

      if (infoData.success) {
        setBlockchainInfo(infoData.blockchain)
      }

      if (herbsData.success) {
        setHerbs(herbsData.data)
      }
    } catch (error) {
      console.error("Failed to fetch blockchain data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockchainData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "verified":
        return <Badge variant="default">Verified</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
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
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">AyurTrace - Blockchain Explorer</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Blockchain Network Status</h2>
              <p className="text-lg text-muted-foreground">
                Real-time view of the AyurTrace blockchain network and all recorded transactions.
              </p>
            </div>
            <Button onClick={fetchBlockchainData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Blockchain Info */}
        {blockchainInfo && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{blockchainInfo.length}</div>
                  <div className="text-sm text-muted-foreground">Total Blocks</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{herbs.length}</div>
                  <div className="text-sm text-muted-foreground">Herb Entries</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{blockchainInfo.difficulty}</div>
                  <div className="text-sm text-muted-foreground">Mining Difficulty</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center flex items-center justify-center">
                  {blockchainInfo.isValid ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      <div>
                        <div className="font-bold">Valid</div>
                        <div className="text-xs text-muted-foreground">Chain Integrity</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-6 w-6" />
                      <div>
                        <div className="font-bold">Invalid</div>
                        <div className="text-xs text-muted-foreground">Chain Integrity</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Network Information */}
        {blockchainInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Network Information
              </CardTitle>
              <CardDescription>Details about the AyurTrace blockchain network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Network</p>
                    <p className="text-sm text-muted-foreground">{blockchainInfo.network}</p>
                  </div>
                  <div>
                    <p className="font-medium">Consensus Algorithm</p>
                    <p className="text-sm text-muted-foreground">{blockchainInfo.consensus}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Latest Block Hash</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {blockchainInfo.latestBlock?.hash || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{blockchainInfo.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Herb Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Transactions</CardTitle>
            <CardDescription>All herb entries recorded on the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading blockchain data...</p>
              </div>
            ) : herbs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No herb entries found on the blockchain.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Herb Name</TableHead>
                    <TableHead>Farmer ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Block Hash</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {herbs.map((herb) => (
                    <TableRow key={herb.id}>
                      <TableCell className="font-mono text-sm">{herb.batchId}</TableCell>
                      <TableCell className="font-medium">{herb.herbName}</TableCell>
                      <TableCell>{herb.farmerId}</TableCell>
                      <TableCell>{getStatusBadge(herb.status)}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate">
                        {herb.blockHash || "N/A"}
                      </TableCell>
                      <TableCell>{new Date(herb.timestamp).toLocaleString()}</TableCell>
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
