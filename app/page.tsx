import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Shield, Users, QrCode, MapPin, FlaskConical } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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
              Trust, Transparency & Traceability for Ayurveda. Track your herbs from farm to consumer with blockchain
              technology.
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

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/30">
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
      <section id="how-it-works" className="py-20 px-4">
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
          <div className="flex justify-center">
            <Link href="/blockchain" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Blockchain Explorer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
