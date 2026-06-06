"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Building2,
  Home,
  Palette,
  Hammer,
  Users,
  Leaf,
  Zap,
  Shield,
  Bot,
  Cpu,
  Star,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react"
import AIHouseDesigner from "@/components/AIHouseDesigner"
import MaterialsDirectory from "@/components/MaterialsDirectory"
import WorkforceDirectory from "@/components/WorkforceDirectory"
import VastuEcoCompliance from "@/components/VastuEcoCompliance"
import DIYUniverse from "@/components/diy/DIYUniverse"
import BudgetInputScreen from "@/components/BudgetInputScreen"

export default function DashboardPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState("dashboard")
  const [showDesignerMenu, setShowDesignerMenu] = useState(false)
  const [showBudgetSummary, setShowBudgetSummary] = useState(false)
  const [showDetailedPlan, setShowDetailedPlan] = useState(false)
  const [budgetData, setBudgetData] = useState({
    budget: "₹25,00,000",
    area: "1,200 sq ft",
    rooms: "3 BHK",
  })
  const [detailedBudgetData, setDetailedBudgetData] = useState<any>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (currentView === "ai-designer") {
    return <AIHouseDesigner onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "materials") {
    return <MaterialsDirectory onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "workforce") {
    return <WorkforceDirectory onBack={() => setCurrentView("dashboard")} />
  }
  if (currentView === "vastu") {
    return <VastuEcoCompliance onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "budget") {
    return (
      <BudgetInputScreen
        onBack={(data) => {
          if (data) {
            setBudgetData(data)
            setShowBudgetSummary(true)
          }
          setCurrentView("dashboard")
        }}
        onDetailedData={(detailedData) => {
          setDetailedBudgetData(detailedData)
        }}
      />
    )
  }

  // new: diy view branch
  if (currentView === "diy") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-semibold">EasyConstruct — DIY Projects</span>
            </div>
            {mounted && (
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setCurrentView("dashboard")} className="mb-4">
            ← Back to Dashboard
          </Button>

          {/* DIY Universe - integrated DIY projects finder with AI search */}
          <DIYUniverse />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between overflow-visible">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-semibold">EasyConstruct</span>
            </div>

            <nav className="flex items-center gap-2 overflow-visible">
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                onClick={() => setCurrentView("dashboard")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <div className="relative group">
                <Button
                  variant={currentView === "ai-designer" ? "default" : "ghost"}
                  className="gap-2"
                  onClick={() => setShowDesignerMenu(!showDesignerMenu)}
                >
                  <Bot className="h-4 w-4" />
                  AI Designer
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showDesignerMenu && (
                  <div className="absolute left-0 mt-0 w-56 bg-popover border rounded-md shadow-lg z-50">
                    <div className="px-2 py-1.5 text-sm font-semibold text-popover-foreground">Designer Options</div>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => {
                        window.open("/AR_VR/index.html", "_blank", "noopener,noreferrer")
                        setShowDesignerMenu(false)
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                    >
                      Option 1: House Designer
                    </button>
                    <button
                      onClick={() => {
                        router.push("/style-generator")
                        setShowDesignerMenu(false)
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                    >
                      Option 2: Style Generator
                    </button>
                  </div>
                )}
              </div>
              <Button
                variant={currentView === "materials" ? "default" : "ghost"}
                onClick={() => setCurrentView("materials")}
                className="gap-2"
              >
                <Cpu className="h-4 w-4" />
                AI Materials
              </Button>
              <Button
                variant={currentView === "workforce" ? "default" : "ghost"}
                onClick={() => setCurrentView("workforce")}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                AI Workforce
              </Button>
              <Button
                variant={currentView === "vastu" ? "default" : "ghost"}
                onClick={() => setCurrentView("vastu")}
                className="gap-2"
              >
                <Leaf className="h-4 w-4" />
                AI Vastu & Eco
              </Button>

              {/* new nav button to open the DIY mini-app */}
              <Button
                variant={currentView === "diy" ? "default" : "ghost"}
                onClick={() => setCurrentView("diy")}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                DIY Projects
              </Button>
            </nav>

            {mounted && (
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance mb-2">Welcome to Your Construction Hub</h2>
          <p className="text-muted-foreground">Your central place to manage and visualize your project.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with these essential features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  className="h-20 flex-col gap-2 bg-transparent"
                  variant="outline"
                    onClick={() => {
                    // Open the AR app served from the Next `public` folder in a new tab
                    window.open("/AR_VR/index.html", "_blank", "noopener,noreferrer")
                  }}
                >
                  <Palette className="h-6 w-6" />
                  <span>AI House Designer</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-2 bg-transparent"
                  variant="outline"
                  onClick={() => setCurrentView("budget")}
                >
                  <Zap className="h-6 w-6" />
                  <span>Budget Estimation</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-2 bg-transparent"
                  variant="outline"
                  onClick={() => setCurrentView("materials")}
                >
                  <Hammer className="h-6 w-6" />
                  <span>Browse Materials</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-2 bg-transparent"
                  variant="outline"
                  onClick={() => setCurrentView("workforce")}
                >
                  <Users className="h-6 w-6" />
                  <span>Find Workforce</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-2 bg-transparent"
                  variant="outline"
                  onClick={() => setCurrentView("vastu")}
                >
                  <Leaf className="h-6 w-6" />
                  <span>Vastu & Eco Guide</span>
                </Button>

              </div>
            </CardContent>
          </Card>

          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showBudgetSummary ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-semibold">{budgetData.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area</span>
                    <span className="font-semibold">{budgetData.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rooms</span>
                    <span className="font-semibold">{budgetData.rooms}</span>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button className="flex-1" onClick={() => setShowDetailedPlan(true)}>
                      View Detailed Plan
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowBudgetSummary(false)}>
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No project data available</p>
                  <Button onClick={() => setShowBudgetSummary(true)} className="w-full">
                    Load Budget Estimation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Pricing</h3>
              <p className="text-sm text-muted-foreground">Get live material costs across 200+ Indian cities</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Verified Vendors</h3>
              <p className="text-sm text-muted-foreground">Connect with trusted suppliers and contractors</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">3D Visualization</h3>
              <p className="text-sm text-muted-foreground">See your home in AR/VR before construction</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-sm text-muted-foreground">Sustainable materials and green certifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Plan Dialog */}
        <Dialog open={showDetailedPlan} onOpenChange={setShowDetailedPlan}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Project Detailed Plan</DialogTitle>
              <DialogDescription>Complete information about your construction project</DialogDescription>
            </DialogHeader>
            {detailedBudgetData && (
              <div className="space-y-6">
                {/* Budget Section */}
                <div>
                  <h3 className="font-semibold mb-3">Budget Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="font-semibold">₹{Number.parseInt(detailedBudgetData.budget || "0").toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Quality Level</p>
                      <p className="font-semibold">{detailedBudgetData.qualityLevel || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Construction Details */}
                <div>
                  <h3 className="font-semibold mb-3">Construction Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Built-up Area</p>
                      <p className="font-semibold">{detailedBudgetData.sqft || "N/A"} sq ft</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Plot Size</p>
                      <p className="font-semibold">{detailedBudgetData.plotSize || "N/A"} sq ft</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Number of Floors</p>
                      <p className="font-semibold">{detailedBudgetData.floors || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Construction Type</p>
                      <p className="font-semibold">{detailedBudgetData.constructionType || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Room Configuration */}
                <div>
                  <h3 className="font-semibold mb-3">Room Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-semibold">{detailedBudgetData.bedrooms || "N/A"} BHK</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-semibold">{detailedBudgetData.bathrooms || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold mb-3">Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-semibold">{detailedBudgetData.state || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-semibold">{detailedBudgetData.city || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div>
                  <h3 className="font-semibold mb-3">Additional Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <input
                        type="checkbox"
                        checked={detailedBudgetData.hasKitchen}
                        disabled
                        className="rounded"
                      />
                      <span>Modular Kitchen</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <input type="checkbox" checked={detailedBudgetData.hasBalcony} disabled className="rounded" />
                      <span>Balcony</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <input type="checkbox" checked={detailedBudgetData.hasGarden} disabled className="rounded" />
                      <span>Garden/Terrace</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setShowDetailedPlan(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

