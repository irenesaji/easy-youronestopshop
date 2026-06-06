"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "next-themes"
import {
  Building2,
  Hammer,
  Home,
  Palette,
  Users,
  Zap,
  Shield,
  Leaf,
  MapPin,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  Award,
  Globe,
  Sun,
  Moon,
  Bot,
  Cpu,
} from "lucide-react"
import AIHouseDesigner from "@/components/AIHouseDesigner"
import MaterialsDirectory from "@/components/MaterialsDirectory"
import WorkforceDirectory from "@/components/WorkforceDirectory"
import VastuEcoCompliance from "@/components/VastuEcoCompliance"
import AIConstructionChatbot from "@/components/AIConstructionChatbot"
import DIYUniverse from "@/components/diy/DIYUniverse"

export default function EasyConstructLanding() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [animationStep, setAnimationStep] = useState(0)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError("")
    // Basic client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Login failed. Please check your credentials and try again.")
      } else {
        // Redirect to dashboard instead of showing form
        router.push("/dashboard")
      }
    } catch (e) {
      if ((e as any)?.name === 'AbortError') setError('Request timed out. Check your network and try again.')
      else setError("Network error. Please check your connection and retry.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup() {
    setLoading(true)
    setError("")
    // Basic client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Signup failed. Please try again.")
      } else {
        // Redirect to dashboard instead of showing form
        router.push("/dashboard")
      }
    } catch (e) {
      if ((e as any)?.name === 'AbortError') setError('Request timed out. Check your network and try again.')
      else setError("Network error. Please check your connection and retry.")
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return <BudgetInputScreen />
  }

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/modern-construction-site-with-cranes-and-blueprint.jpg')] bg-cover bg-center opacity-20 dark:opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-cyan-600/30 dark:from-blue-800/40 dark:to-cyan-800/40" />

        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 dark:bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EasyConstruct</h1>
                <p className="text-sm text-blue-200 dark:text-blue-300">AI-Powered Construction Website</p>
              </div>
            </div>

            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </header>

          {/* Hero Section */}
          <div className="text-center mb-16 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-blue-300 animate-pulse" />
                <span className="text-blue-200 font-medium">AI Construction Platform</span>
                <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white text-balance leading-tight">
                Build Your{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  Dream Home
                </span>{" "}
                with AI
              </h1>
            </div>
            <div className="space-y-4">
              <p className="text-2xl text-white text-balance max-w-3xl mx-auto font-medium">
                Your One Stop-Shop for Construction
              </p>
              <p className="text-lg text-slate-200 dark:text-slate-300 text-pretty max-w-2xl mx-auto">
                Check, Compare, Conclude your dream home with cutting-edge AI technology
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                <span className="text-white">Trusted by builders across India</span>
                <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: Bot,
                title: "AI House Designer",
                desc: "3D visualization & AR/VR",
                color: "from-blue-500 to-cyan-500",
                aiFeature: "Smart Design Generation",
              },
              {
                icon: Cpu,
                title: "AI Materials Hub",
                desc: "Real-time pricing & vendors",
                color: "from-orange-500 to-red-500",
                aiFeature: "Intelligent Recommendations",
              },
              {
                icon: Users,
                title: "AI Workforce",
                desc: "Verified contractors & labor",
                color: "from-green-500 to-emerald-500",
                aiFeature: "Smart Matching",
              },
              {
                icon: Leaf,
                title: "AI Vastu & Eco",
                desc: "Sustainable & compliant",
                color: "from-purple-500 to-pink-500",
                aiFeature: "Compliance Analysis",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-md hover:bg-slate-700/90 dark:hover:bg-slate-800/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                />
                <CardContent className="pt-8 pb-6 text-center relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-300 dark:text-slate-400 text-sm mb-3">{feature.desc}</p>
                  <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border-blue-400/30 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {feature.aiFeature}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Authentication Section */}
          <div id="get-started" className="max-w-md mx-auto">
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white">Get Started</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Join thousands of builders using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  {error && <div className="text-sm text-red-600 text-center">{error}</div>}

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full !bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? 'Signing in...' : (
                        <>
                          Login to EasyConstruct
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button
                      onClick={handleSignup}
                      disabled={loading}
                      className="w-full !bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? 'Creating account...' : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {[
                {
                  icon: Shield,
                  text: "AI-Verified Platform",
                  color: "bg-green-600/80 text-green-50 border-green-500/50",
                },
                { icon: Bot, text: "100% AI-Powered", color: "bg-blue-600/80 text-blue-50 border-blue-500/50" },
                { icon: Users, text: "Trusted Users", color: "bg-purple-600/80 text-purple-50 border-purple-500/50" },
                {
                  icon: Award,
                  text: "AI Industry Leader",
                  color: "bg-yellow-600/80 text-yellow-50 border-yellow-500/50",
                },
                { icon: Globe, text: "Pan-India AI", color: "bg-cyan-600/80 text-cyan-50 border-cyan-500/50" },
              ].map((badge, index) => (
                <Badge
                  key={index}
                  className={`gap-2 px-4 py-2 ${badge.color} hover:scale-105 transition-transform duration-300 animate-pulse`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <badge.icon className="h-4 w-4" />
                  {badge.text}
                </Badge>
              ))}
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-lg font-medium">
              AI-powered construction across Mangalore, Mumbai, Delhi, Bangalore, Chennai & 200+ cities
            </p>
            <div className="mt-8 flex justify-center">
              <footer className="w-full text-center mt-4">
                <div className="text-sm text-slate-200 dark:text-slate-400">
                  © {new Date().getFullYear()} EasyConstruct — Team GA11
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// It's better practice to define types/interfaces outside the component
interface CityData {
  name: string
  multiplier: number
  avgCost: number
}
interface StateData {
  districts: string[]
  cities: CityData[]
}
interface IndianStatesDistricts {
  [key: string]: StateData
}

function BudgetInputScreen() {
  const [budget, setBudget] = useState("")
  const [sqft, setSqft] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [hasKitchen, setHasKitchen] = useState(true)
  const [hasBalcony, setHasBalcony] = useState(false)
  const [hasGarden, setHasGarden] = useState(false)
  const [state, setState] = useState("")
  const [district, setDistrict] = useState("")
  const [city, setCity] = useState("")
  const [constructionType, setConstructionType] = useState("")
  const [qualityLevel, setQualityLevel] = useState("")
  const [floors, setFloors] = useState("")
  const [plotSize, setPlotSize] = useState("") // plot size in sqft as string

  // add: compute numeric sqft and convert to cents (1 cent ≈ 435.6 sqft)
  const plotSizeSqft = parseFloat(plotSize) || 0
  const plotSizeCents = plotSizeSqft ? +(plotSizeSqft / 435.6).toFixed(2) : 0

  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  const indianStatesDistricts: IndianStatesDistricts = {
    "Andhra Pradesh": {
      districts: [
        "Anantapur",
        "Chittoor",
        "East Godavari",
        "Guntur",
        "Krishna",
        "Kurnool",
        "Nellore",
        "Prakasam",
        "Srikakulam",
        "Visakhapatnam",
        "Vizianagaram",
        "West Godavari",
        "YSR Kadapa",
      ],
      cities: [
        { name: "Visakhapatnam", multiplier: 1.1, avgCost: 2200 },
        { name: "Vijayawada", multiplier: 1.0, avgCost: 2000 },
        { name: "Guntur", multiplier: 0.9, avgCost: 1800 },
        { name: "Nellore", multiplier: 0.8, avgCost: 1600 },
        { name: "Kurnool", multiplier: 0.7, avgCost: 1400 },
      ],
    },
    "Arunachal Pradesh": {
      districts: [
        "Anjaw",
        "Changlang",
        "Dibang Valley",
        "East Kameng",
        "East Siang",
        "Kamle",
        "Kra Daadi",
        "Kurung Kumey",
        "Lepa Rada",
        "Lohit",
        "Longding",
        "Lower Dibang Valley",
        "Lower Siang",
        "Lower Subansiri",
        "Namsai",
        "Pakke Kessang",
        "Papum Pare",
        "Shi Yomi",
        "Siang",
        "Tawang",
        "Tirap",
        "Upper Siang",
        "Upper Subansiri",
        "West Kameng",
        "West Siang",
      ],
      cities: [
        { name: "Itanagar", multiplier: 1.2, avgCost: 2400 },
        { name: "Naharlagun", multiplier: 1.1, avgCost: 2200 },
        { name: "Pasighat", multiplier: 1.0, avgCost: 2000 },
      ],
    },
    Assam: {
      districts: [
        "Baksa",
        "Barpeta",
        "Biswanath",
        "Bongaigaon",
        "Cachar",
        "Charaideo",
        "Chirang",
        "Darrang",
        "Dhemaji",
        "Dhubri",
        "Dibrugarh",
        "Goalpara",
        "Golaghat",
        "Hailakandi",
        "Hojai",
        "Jorhat",
        "Kamrup",
        "Kamrup Metropolitan",
        "Karbi Anglong",
        "Karimganj",
        "Kokrajhar",
        "Lakhimpur",
        "Majuli",
        "Morigaon",
        "Nagaon",
        "Nalbari",
        "Dima Hasao",
        "Sivasagar",
        "Sonitpur",
        "South Salmara-Mankachar",
        "Tinsukia",
        "Udalguri",
        "West Karbi Anglong",
      ],
      cities: [
        { name: "Guwahati", multiplier: 1.1, avgCost: 2200 },
        { name: "Dibrugarh", multiplier: 0.9, avgCost: 1800 },
        { name: "Jorhat", multiplier: 0.8, avgCost: 1600 },
        { name: "Silchar", multiplier: 0.8, avgCost: 1600 },
        { name: "Tezpur", multiplier: 0.7, avgCost: 1400 },
      ],
    },
    Bihar: {
      districts: [
        "Araria",
        "Arwal",
        "Aurangabad",
        "Banka",
        "Begusarai",
        "Bhagalpur",
        "Bhojpur",
        "Buxar",
        "Darbhanga",
        "East Champaran",
        "Gaya",
        "Gopalganj",
        "Jamui",
        "Jehanabad",
        "Kaimur",
        "Katihar",
        "Khagaria",
        "Kishanganj",
        "Lakhisarai",
        "Madhepura",
        "Madhubani",
        "Munger",
        "Muzaffarpur",
        "Nalanda",
        "Nawada",
        "Patna",
        "Purnia",
        "Rohtas",
        "Saharsa",
        "Samastipur",
        "Saran",
        "Sheikhpura",
        "Sheohar",
        "Sitamarhi",
        "Siwan",
        "Supaul",
        "Vaishali",
        "West Champaran",
      ],
      cities: [
        { name: "Patna", multiplier: 0.9, avgCost: 1800 },
        { name: "Gaya", multiplier: 0.7, avgCost: 1400 },
        { name: "Bhagalpur", multiplier: 0.7, avgCost: 1400 },
        { name: "Muzaffarpur", multiplier: 0.6, avgCost: 1200 },
        { name: "Darbhanga", multiplier: 0.6, avgCost: 1200 },
      ],
    },
    Chhattisgarh: {
      districts: [
        "Balod",
        "Baloda Bazar",
        "Balrampur",
        "Bastar",
        "Bemetara",
        "Bijapur",
        "Bilaspur",
        "Dantewada",
        "Dhamtari",
        "Durg",
        "Gariaband",
        "Gaurela Pendra Marwahi",
        "Janjgir Champa",
        "Jashpur",
        "Kabirdham",
        "Kanker",
        "Kondagaon",
        "Korba",
        "Koriya",
        "Mahasamund",
        "Mungeli",
        "Narayanpur",
        "Raigarh",
        "Raipur",
        "Rajnandgaon",
        "Sukma",
        "Surajpur",
        "Surguja",
      ],
      cities: [
        { name: "Raipur", multiplier: 0.9, avgCost: 1800 },
        { name: "Bhilai", multiplier: 0.8, avgCost: 1600 },
        { name: "Bilaspur", multiplier: 0.7, avgCost: 1400 },
        { name: "Korba", multiplier: 0.7, avgCost: 1400 },
        { name: "Durg", multiplier: 0.7, avgCost: 1400 },
      ],
    },
    Goa: {
      districts: ["North Goa", "South Goa"],
      cities: [
        { name: "Panaji", multiplier: 1.3, avgCost: 2600 },
        { name: "Margao", multiplier: 1.2, avgCost: 2400 },
        { name: "Vasco da Gama", multiplier: 1.1, avgCost: 2200 },
      ],
    },
    Gujarat: {
      districts: [
        "Ahmedabad",
        "Amreli",
        "Anand",
        "Aravalli",
        "Banaskantha",
        "Bharuch",
        "Bhavnagar",
        "Botad",
        "Chhota Udaipur",
        "Dahod",
        "Dang",
        "Devbhoomi Dwarka",
        "Gandhinagar",
        "Gir Somnath",
        "Jamnagar",
        "Junagadh",
        "Kheda",
        "Kutch",
        "Mahisagar",
        "Mehsana",
        "Morbi",
        "Narmada",
        "Navsari",
        "Panchmahal",
        "Patan",
        "Porbandar",
        "Rajkot",
        "Sabarkantha",
        "Surat",
        "Surendranagar",
        "Tapi",
        "Vadodara",
        "Valsad",
      ],
      cities: [
        { name: "Ahmedabad", multiplier: 0.9, avgCost: 1800 },
        { name: "Surat", multiplier: 0.9, avgCost: 1800 },
        { name: "Vadodara", multiplier: 0.8, avgCost: 1600 },
        { name: "Rajkot", multiplier: 0.8, avgCost: 1600 },
        { name: "Bhavnagar", multiplier: 0.7, avgCost: 1400 },
      ],
    },
    Haryana: {
      districts: [
        "Ambala",
        "Bhiwani",
        "Charkhi Dadri",
        "Faridabad",
        "Fatehabad",
        "Gurugram",
        "Hisar",
        "Jhajjar",
        "Jind",
        "Kaithal",
        "Karnal",
        "Kurukshetra",
        "Mahendragarh",
        "Nuh",
        "Palwal",
        "Panchkula",
        "Panipat",
        "Rewari",
        "Rohtak",
        "Sirsa",
        "Sonipat",
        "Yamunanagar",
      ],
      cities: [
        { name: "Gurugram", multiplier: 1.3, avgCost: 2600 },
        { name: "Faridabad", multiplier: 1.2, avgCost: 2400 },
        { name: "Panipat", multiplier: 1.0, avgCost: 2000 },
        { name: "Ambala", multiplier: 0.9, avgCost: 1800 },
        { name: "Karnal", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    "Himachal Pradesh": {
      districts: [
        "Bilaspur",
        "Chamba",
        "Hamirpur",
        "Kangra",
        "Kinnaur",
        "Kullu",
        "Lahaul and Spiti",
        "Mandi",
        "Shimla",
        "Sirmaur",
        "Solan",
        "Una",
      ],
      cities: [
        { name: "Shimla", multiplier: 1.2, avgCost: 2400 },
        { name: "Dharamshala", multiplier: 1.1, avgCost: 2200 },
        { name: "Solan", multiplier: 1.0, avgCost: 2000 },
        { name: "Mandi", multiplier: 0.9, avgCost: 1800 },
        { name: "Kullu", multiplier: 1.0, avgCost: 2000 },
      ],
    },
    Jharkhand: {
      districts: [
        "Bokaro",
        "Chatra",
        "Deoghar",
        "Dhanbad",
        "Dumka",
        "East Singhbhum",
        "Garhwa",
        "Giridih",
        "Godda",
        "Gumla",
        "Hazaribagh",
        "Jamtara",
        "Khunti",
        "Koderma",
        "Latehar",
        "Lohardaga",
        "Pakur",
        "Palamu",
        "Ramgarh",
        "Ranchi",
        "Sahibganj",
        "Seraikela Kharsawan",
        "Simdega",
        "West Singhbhum",
      ],
      cities: [
        { name: "Ranchi", multiplier: 0.8, avgCost: 1600 },
        { name: "Jamshedpur", multiplier: 0.8, avgCost: 1600 },
        { name: "Dhanbad", multiplier: 0.7, avgCost: 1400 },
        { name: "Bokaro", multiplier: 0.7, avgCost: 1400 },
        { name: "Deoghar", multiplier: 0.6, avgCost: 1200 },
      ],
    },
    Karnataka: {
      districts: [
        "Bagalkot",
        "Ballari",
        "Belagavi",
        "Bengaluru Rural",
        "Bengaluru Urban",
        "Bidar",
        "Chamarajanagar",
        "Chikballapur",
        "Chikkamagaluru",
        "Chitradurga",
        "Dakshina Kannada",
        "Davanagere",
        "Dharwad",
        "Gadag",
        "Hassan",
        "Haveri",
        "Kalaburagi",
        "Kodagu",
        "Kolar",
        "Koppal",
        "Mandya",
        "Mysuru",
        "Raichur",
        "Ramanagara",
        "Shivamogga",
        "Tumakuru",
        "Udupi",
        "Uttara Kannada",
        "Vijayapura",
        "Yadgir",
      ],
      cities: [
        { name: "Bangalore", multiplier: 1.1, avgCost: 2200 },
        { name: "Mysore", multiplier: 0.9, avgCost: 1800 },
        { name: "Hubli", multiplier: 0.8, avgCost: 1600 },
        { name: "Mangalore", multiplier: 0.9, avgCost: 1800 },
        { name: "Belgaum", multiplier: 0.8, avgCost: 1600 },
        { name: "Manipal", multiplier: 0.9, avgCost: 2000 },
        { name: "Bramhavara", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    Kerala: {
      districts: [
        "Alappuzha",
        "Ernakulam",
        "Idukki",
        "Kannur",
        "Kasaragod",
        "Kollam",
        "Kottayam",
        "Kozhikode",
        "Malappuram",
        "Palakkad",
        "Pathanamthitta",
        "Thiruvananthapuram",
        "Thrissur",
        "Wayanad",
      ],
      cities: [
        { name: "Kochi", multiplier: 1.1, avgCost: 2200 },
        { name: "Thiruvananthapuram", multiplier: 1.0, avgCost: 2000 },
        { name: "Kozhikode", multiplier: 0.9, avgCost: 1800 },
        { name: "Thrissur", multiplier: 0.9, avgCost: 1800 },
        { name: "Kollam", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    "Madhya Pradesh": {
      districts: [
        "Agar Malwa",
        "Alirajpur",
        "Anuppur",
        "Ashoknagar",
        "Balaghat",
        "Barwani",
        "Betul",
        "Bhind",
        "Bhopal",
        "Burhanpur",
        "Chachaura",
        "Chhatarpur",
        "Chhindwara",
        "Damoh",
        "Datia",
        "Dewas",
        "Dhar",
        "Dindori",
        "Guna",
        "Gwalior",
        "Harda",
        "Hoshangabad",
        "Indore",
        "Jabalpur",
        "Jhabua",
        "Katni",
        "Khandwa",
        "Khargone",
        "Mandla",
        "Mandsaur",
        "Morena",
        "Narsinghpur",
        "Neemuch",
        "Niwari",
        "Panna",
        "Raisen",
        "Rajgarh",
        "Ratlam",
        "Rewa",
        "Sagar",
        "Satna",
        "Sehore",
        "Seoni",
        "Shahdol",
        "Shajapur",
        "Sheopur",
        "Shivpuri",
        "Sidhi",
        "Singrauli",
        "Tikamgarh",
        "Ujjain",
        "Umaria",
        "Vidisha",
      ],
      cities: [
        { name: "Indore", multiplier: 0.8, avgCost: 1600 },
        { name: "Bhopal", multiplier: 0.8, avgCost: 1600 },
        { name: "Jabalpur", multiplier: 0.7, avgCost: 1400 },
        { name: "Gwalior", multiplier: 0.7, avgCost: 1400 },
        { name: "Ujjain", multiplier: 0.6, avgCost: 1200 },
      ],
    },
    Maharashtra: {
      districts: [
        "Ahmednagar",
        "Akola",
        "Amravati",
        "Aurangabad",
        "Beed",
        "Bhandara",
        "Buldhana",
        "Chandrapur",
        "Dhule",
        "Gadchiroli",
        "Gondia",
        "Hingoli",
        "Jalgaon",
        "Jalna",
        "Kolhapur",
        "Latur",
        "Mumbai City",
        "Mumbai Suburban",
        "Nagpur",
        "Nanded",
        "Nandurbar",
        "Nashik",
        "Osmanabad",
        "Palghar",
        "Parbhani",
        "Pune",
        "Raigad",
        "Ratnagiri",
        "Sangli",
        "Satara",
        "Sindhudurg",
        "Solapur",
        "Thane",
        "Wardha",
        "Washim",
        "Yavatmal",
      ],
      cities: [
        { name: "Mumbai", multiplier: 1.4, avgCost: 2800 },
        { name: "Pune", multiplier: 1.1, avgCost: 2200 },
        { name: "Nagpur", multiplier: 0.9, avgCost: 1800 },
        { name: "Nashik", multiplier: 0.9, avgCost: 1800 },
        { name: "Aurangabad", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    Manipur: {
      districts: [
        "Bishnupur",
        "Chandel",
        "Churachandpur",
        "Imphal East",
        "Imphal West",
        "Jiribam",
        "Kakching",
        "Kamjong",
        "Kangpokpi",
        "Noney",
        "Pherzawl",
        "Senapati",
        "Tamenglong",
        "Tengnoupal",
        "Thoubal",
        "Ukhrul",
      ],
      cities: [
        { name: "Imphal", multiplier: 1.0, avgCost: 2000 },
        { name: "Thoubal", multiplier: 0.9, avgCost: 1800 },
      ],
    },
    Meghalaya: {
      districts: [
        "East Garo Hills",
        "East Jaintia Hills",
        "East Khasi Hills",
        "North Garo Hills",
        "Ri Bhoi",
        "South Garo Hills",
        "South West Garo Hills",
        "South West Khasi Hills",
        "West Garo Hills",
        "West Jaintia Hills",
        "West Khasi Hills",
      ],
      cities: [
        { name: "Shillong", multiplier: 1.1, avgCost: 2200 },
        { name: "Tura", multiplier: 1.0, avgCost: 2000 },
      ],
    },
    Mizoram: {
      districts: [
        "Aizawl",
        "Champhai",
        "Hnahthial",
        "Kolasib",
        "Khawzawl",
        "Lawngtlai",
        "Lunglei",
        "Mamit",
        "Saiha",
        "Saitual",
        "Serchhip",
      ],
      cities: [
        { name: "Aizawl", multiplier: 1.2, avgCost: 2400 },
        { name: "Lunglei", multiplier: 1.1, avgCost: 2200 },
      ],
    },
    Nagaland: {
      districts: [
        "Dimapur",
        "Kiphire",
        "Kohima",
        "Longleng",
        "Mokokchung",
        "Mon",
        "Noklak",
        "Peren",
        "Phek",
        "Tuensang",
        "Wokha",
        "Zunheboto",
      ],
      cities: [
        { name: "Dimapur", multiplier: 1.1, avgCost: 2200 },
        { name: "Kohima", multiplier: 1.0, avgCost: 2000 },
      ],
    },
    Odisha: {
      districts: [
        "Angul",
        "Balangir",
        "Balasore",
        "Bargarh",
        "Bhadrak",
        "Boudh",
        "Cuttack",
        "Deogarh",
        "Dhenkanal",
        "Gajapati",
        "Ganjam",
        "Jagatsinghpur",
        "Jajpur",
        "Jharsuguda",
        "Kalahandi",
        "Kandhamal",
        "Kendrapara",
        "Kendujhar",
        "Khordha",
        "Koraput",
        "Malkangiri",
        "Mayurbhanj",
        "Nabarangpur",
        "Nayagarh",
        "Nuapada",
        "Puri",
        "Rayagada",
        "Sambalpur",
        "Subarnapur",
        "Sundargarh",
      ],
      cities: [
        { name: "Bhubaneswar", multiplier: 0.9, avgCost: 1800 },
        { name: "Cuttack", multiplier: 0.8, avgCost: 1600 },
        { name: "Rourkela", multiplier: 0.8, avgCost: 1600 },
        { name: "Berhampur", multiplier: 0.7, avgCost: 1400 },
        { name: "Sambalpur", multiplier: 0.7, avgCost: 1400 },
      ],
    },
    Punjab: {
      districts: [
        "Amritsar",
        "Barnala",
        "Bathinda",
        "Faridkot",
        "Fatehgarh Sahib",
        "Fazilka",
        "Ferozepur",
        "Gurdaspur",
        "Hoshiarpur",
        "Jalandhar",
        "Kapurthala",
        "Ludhiana",
        "Mansa",
        "Moga",
        "Muktsar",
        "Nawanshahr",
        "Pathankot",
        "Patiala",
        "Rupnagar",
        "Sahibzada Ajit Singh Nagar",
        "Sangrur",
        "Tarn Taran",
      ],
      cities: [
        { name: "Ludhiana", multiplier: 1.0, avgCost: 2000 },
        { name: "Amritsar", multiplier: 0.9, avgCost: 1800 },
        { name: "Jalandhar", multiplier: 0.9, avgCost: 1800 },
        { name: "Patiala", multiplier: 0.8, avgCost: 1600 },
        { name: "Bathinda", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    Rajasthan: {
      districts: [
        "Ajmer",
        "Alwar",
        "Banswara",
        "Baran",
        "Barmer",
        "Bharatpur",
        "Bhilwara",
        "Bikaner",
        "Bundi",
        "Chittorgarh",
        "Churu",
        "Dausa",
        "Dholpur",
        "Dungarpur",
        "Hanumangarh",
        "Jaipur",
        "Jaisalmer",
        "Jalore",
        "Jhalawar",
        "Jhunjhunu",
        "Jodhpur",
        "Karauli",
        "Kota",
        "Nagaur",
        "Pali",
        "Pratapgarh",
        "Rajsamand",
        "Sawai Madhoper",
        "Sikar",
        "Sirohi",
        "Sri Ganganagar",
        "Tonk",
        "Udaipur",
      ],
      cities: [
        { name: "Jaipur", multiplier: 0.7, avgCost: 1400 },
        { name: "Jodhpur", multiplier: 0.6, avgCost: 1200 },
        { name: "Udaipur", multiplier: 0.7, avgCost: 1400 },
        { name: "Kota", multiplier: 0.6, avgCost: 1200 },
        { name: "Ajmer", multiplier: 0.6, avgCost: 1200 },
      ],
    },
    Sikkim: {
      districts: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
      cities: [
        { name: "Gangtok", multiplier: 1.2, avgCost: 2400 },
        { name: "Namchi", multiplier: 1.1, avgCost: 2200 },
      ],
    },
    "Tamil Nadu": {
      districts: [
        "Ariyalur",
        "Chengalpattu",
        "Chennai",
        "Coimbatore",
        "Cuddalore",
        "Dharmapuri",
        "Dindigul",
        "Erode",
        "Kallakurichi",
        "Kanchipuram",
        "Kanyakumari",
        "Karur",
        "Krishnagiri",
        "Madurai",
        "Mayiladuthurai",
        "Nagapattinam",
        "Namakkal",
        "Nilgiris",
        "Perambalur",
        "Pudukkottai",
        "Ramanathapuram",
        "Ranipet",
        "Salem",
        "Sivaganga",
        "Tenkasi",
        "Thanjavur",
        "Theni",
        "Thoothukudi",
        "Tiruchirappalli",
        "Tirunelveli",
        "Tirupathur",
        "Tiruppur",
        "Tiruvallur",
        "Tiruvannamalai",
        "Tiruvarur",
        "Vellore",
        "Viluppuram",
        "Virudhunagar",
      ],
      cities: [
        { name: "Chennai", multiplier: 1.0, avgCost: 2000 },
        { name: "Coimbatore", multiplier: 0.9, avgCost: 1800 },
        { name: "Madurai", multiplier: 0.8, avgCost: 1600 },
        { name: "Salem", multiplier: 0.8, avgCost: 1600 },
        { name: "Tiruchirappalli", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    Telangana: {
      districts: [
        "Adilabad",
        "Bhadradri Kothagudem",
        "Hyderabad",
        "Jagtial",
        "Jangaon",
        "Jayashankar Bhupalpally",
        "Jogulamba Gadwal",
        "Kamareddy",
        "Karimnagar",
        "Khammam",
        "Komaram Bheem Asifabad",
        "Mahabubabad",
        "Mahabubnagar",
        "Mancherial",
        "Medak",
        "Medchal Malkajgiri",
        "Mulugu",
        "Nagarkurnool",
        "Nalgonda",
        "Narayanpet",
        "Nirmal",
        "Nizamabad",
        "Peddapalli",
        "Rajanna Sircilla",
        "Rangareddy",
        "Sangareddy",
        "Siddipet",
        "Suryapet",
        "Vikarabad",
        "Wanaparthy",
        "Warangal Rural",
        "Warangal Urban",
        "Yadadri Bhuvanagiri",
      ],
      cities: [
        { name: "Hyderabad", multiplier: 0.9, avgCost: 1800 },
        { name: "Warangal", multiplier: 0.7, avgCost: 1400 },
        { name: "Nizamabad", multiplier: 0.6, avgCost: 1200 },
        { name: "Karimnagar", multiplier: 0.6, avgCost: 1200 },
        { name: "Khammam", multiplier: 0.6, avgCost: 1200 },
      ],
    },
    Tripura: {
      districts: [
        "Dhalai",
        "Gomati",
        "Khowai",
        "North Tripura",
        "Sepahijala",
        "South Tripura",
        "Unakoti",
        "West Tripura",
      ],
      cities: [
        { name: "Agartala", multiplier: 0.9, avgCost: 1800 },
        { name: "Dharmanagar", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    "Uttar Pradesh": {
      districts: [
        "Agra",
        "Aligarh",
        "Ambedkar Nagar",
        "Amethi",
        "Amroha",
        "Auraiya",
        "Ayodhya",
        "Azamgarh",
        "Baghpat",
        "Bahraich",
        "Ballia",
        "Balrampur",
        "Banda",
        "Barabanki",
        "Bareilly",
        "Basti",
        "Bhadohi",
        "Bijnor",
        "Budaun",
        "Bulandshahr",
        "Chandauli",
        "Chitrakoot",
        "Deoria",
        "Etah",
        "Etawah",
        "Farrukhabad",
        "Fatehpur",
        "Firozabad",
        "Gautam Buddha Nagar",
        "Ghaziabad",
        "Ghazipur",
        "Gonda",
        "Gorakhpur",
        "Hamirpur",
        "Hapur",
        "Hardoi",
        "Hathras",
        "Jalaun",
        "Jaunpur",
        "Jhansi",
        "Kannauj",
        "Kanpur Dehat",
        "Kanpur Nagar",
        "Kasganj",
        "Kaushambi",
        "Kheri",
        "Kushinagar",
        "Lalitpur",
        "Lucknow",
        "Maharajganj",
        "Mahoba",
        "Mainpuri",
        "Mathura",
        "Mau",
        "Meerut",
        "Mirzapur",
        "Moradabad",
        "Muzaffarnagar",
        "Pilibhit",
        "Pratapgarh",
        "Prayagraj",
        "Raebareli",
        "Rampur",
        "Saharanpur",
        "Sambhal",
        "Sant Kabir Nagar",
        "Shahjahanpur",
        "Shamli",
        "Shrawasti",
        "Siddharthnagar",
        "Sitapur",
        "Sonbhadra",
        "Sultanpur",
        "Unnao",
        "Varanasi",
      ],
      cities: [
        { name: "Lucknow", multiplier: 0.6, avgCost: 1200 },
        { name: "Kanpur", multiplier: 0.6, avgCost: 1200 },
        { name: "Ghaziabad", multiplier: 1.0, avgCost: 2000 },
        { name: "Agra", multiplier: 0.7, avgCost: 1400 },
        { name: "Varanasi", multiplier: 0.6, avgCost: 1200 },
      ],
    },
    Uttarakhand: {
      districts: [
        "Almora",
        "Bageshwar",
        "Chamoli",
        "Champawat",
        "Dehradun",
        "Haridwar",
        "Nainital",
        "Pauri Garhwal",
        "Pithoragarh",
        "Rudraprayag",
        "Tehri Garhwal",
        "Udham Singh Nagar",
        "Uttarkashi",
      ],
      cities: [
        { name: "Dehradun", multiplier: 1.0, avgCost: 2000 },
        { name: "Haridwar", multiplier: 0.9, avgCost: 1800 },
        { name: "Nainital", multiplier: 1.1, avgCost: 2200 },
        { name: "Roorkee", multiplier: 0.8, avgCost: 1600 },
        { name: "Haldwani", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    "West Bengal": {
      districts: [
        "Alipurduar",
        "Bankura",
        "Birbhum",
        "Cooch Behar",
        "Dakshin Dinajpur",
        "Darjeeling",
        "Hooghly",
        "Howrah",
        "Jalpaiguri",
        "Jhargram",
        "Kalimpong",
        "Kolkata",
        "Malda",
        "Murshidabad",
        "Nadia",
        "North 24 Parganas",
        "Paschim Bardhaman",
        "Paschim Medinipur",
        "Purba Bardhaman",
        "Purba Medinipur",
        "Purulia",
        "South 24 Parganas",
        "Uttar Dinajpur",
      ],
      cities: [
        { name: "Kolkata", multiplier: 0.8, avgCost: 1600 },
        { name: "Howrah", multiplier: 0.8, avgCost: 1600 },
        { name: "Durgapur", multiplier: 0.7, avgCost: 1400 },
        { name: "Asansol", multiplier: 0.7, avgCost: 1400 },
        { name: "Siliguri", multiplier: 0.7, avgCost: 1400 },
      ],
    },
    Delhi: {
      districts: [
        "Central Delhi",
        "East Delhi",
        "New Delhi",
        "North Delhi",
        "North East Delhi",
        "North West Delhi",
        "Shahdara",
        "South Delhi",
        "South East Delhi",
        "South West Delhi",
        "West Delhi",
      ],
      cities: [
        { name: "Delhi", multiplier: 1.2, avgCost: 2400 },
        { name: "New Delhi", multiplier: 1.3, avgCost: 2600 },
        { name: "Gurgaon", multiplier: 1.3, avgCost: 2600 },
        { name: "Noida", multiplier: 1.1, avgCost: 2200 },
        { name: "Faridabad", multiplier: 1.0, avgCost: 2000 },
      ],
    },
    "Jammu and Kashmir": {
      districts: [
        "Anantnag",
        "Bandipora",
        "Baramulla",
        "Budgam",
        "Doda",
        "Ganderbal",
        "Jammu",
        "Kathua",
        "Kishtwar",
        "Kulgam",
        "Kupwara",
        "Poonch",
        "Pulwama",
        "Rajouri",
        "Ramban",
        "Reasi",
        "Samba",
        "Shopian",
        "Srinagar",
        "Udhampur",
      ],
      cities: [
        { name: "Srinagar", multiplier: 1.0, avgCost: 2000 },
        { name: "Jammu", multiplier: 0.9, avgCost: 1800 },
        { name: "Anantnag", multiplier: 0.8, avgCost: 1600 },
      ],
    },
    Ladakh: {
      districts: ["Kargil", "Leh"],
      cities: [
        { name: "Leh", multiplier: 1.3, avgCost: 2600 },
        { name: "Kargil", multiplier: 1.2, avgCost: 2400 },
      ],
    },
  }

  const availableDistricts = state ? indianStatesDistricts[state]?.districts || [] : []
  const availableCities = state ? indianStatesDistricts[state]?.cities || [] : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowAnalysis(true)
  }

  const handleProceedToDashboard = () => {
    setShowDashboard(true)
  }

  if (showDashboard) {
    return <ConstructionDashboard />
  }

  const selectedCityData = availableCities.find((c) => c.name === city)
  const estimatedCost = selectedCityData && sqft ? Number.parseInt(sqft) * selectedCityData.avgCost : 0
  const budgetGap = budget ? Number.parseInt(budget) - estimatedCost : 0
  const budgetStatus = budgetGap >= 0 ? "sufficient" : "insufficient"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">EasyConstruct</h1>
          </div>
          <h2 className="text-3xl font-bold text-balance mb-2">Smart Budget & Project Planner</h2>
          <p className="text-muted-foreground text-pretty">
            Get AI-powered Budget Estimation  with real-time regional pricing across India
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Project Details
              </CardTitle>
              <CardDescription>Enter comprehensive details for accurate Budget estimation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Construction Location
                  </Label>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={state}
                        onValueChange={(value) => {
                          setState(value)
                          setDistrict("")
                          setCity("")
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(indianStatesDistricts).map((stateName) => (
                            <SelectItem key={stateName} value={stateName}>
                              {stateName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Select value={district} onValueChange={setDistrict} disabled={!state} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((districtName) => (
                            <SelectItem key={districtName} value={districtName}>
                              {districtName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select value={city} onValueChange={setCity} disabled={!state} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((cityData) => (
                            <SelectItem key={cityData.name} value={cityData.name}>
                              {cityData.name} - ₹{cityData.avgCost}/sq ft
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Budget and Area */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Total Budget (₹)</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., 2500000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sqft">Built-up Area (sq ft)</Label>
                    <Input
                      id="sqft"
                      placeholder="e.g., 1200"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Plot and Construction Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plotSize">Plot Size</Label>
                    <Input
                      id="plotSize"
                      placeholder="e.g., 2400"
                      value={plotSize}
                      onChange={(e) => setPlotSize(e.target.value)}
                      required
                    />
                    {plotSizeSqft > 0 && (
                      <div className="text-xs text-muted-foreground">
                        = {plotSizeSqft.toLocaleString()} sq ft ≈ {plotSizeCents} cents
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floors">Number of Floors</Label>
                    <Select value={floors} onValueChange={setFloors} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select floors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ground Floor (G)</SelectItem>
                        <SelectItem value="2">Ground + 1 (G+1)</SelectItem>
                        <SelectItem value="3">Ground + 2 (G+2)</SelectItem>
                        <SelectItem value="4">Ground + 3 (G+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Construction Type and Quality */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constructionType">Construction Type</Label>
                    <Select value={constructionType} onValueChange={setConstructionType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Construction</SelectItem>
                        <SelectItem value="renovation">Renovation</SelectItem>
                        <SelectItem value="extension">Extension</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualityLevel">Quality Level</Label>
                    <Select value={qualityLevel} onValueChange={setQualityLevel} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (₹1200-1600/sq ft)</SelectItem>
                        <SelectItem value="standard">Standard (₹1600-2200/sq ft)</SelectItem>
                        <SelectItem value="premium">Premium (₹2200-3000/sq ft)</SelectItem>
                        <SelectItem value="luxury">Luxury (₹3000+/sq ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Room Configuration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select value={bedrooms} onValueChange={setBedrooms} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 BHK</SelectItem>
                        <SelectItem value="2">2 BHK</SelectItem>
                        <SelectItem value="3">3 BHK</SelectItem>
                        <SelectItem value="4">4 BHK</SelectItem>
                        <SelectItem value="5">5+ BHK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Select value={bathrooms} onValueChange={setBathrooms} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="3">3 Bathrooms</SelectItem>
                        <SelectItem value="4">4+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <Label>Additional Features</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="kitchen"
                        checked={hasKitchen}
                        onChange={(e) => setHasKitchen(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="kitchen">Modular Kitchen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="balcony"
                        checked={hasBalcony}
                        onChange={(e) => setHasBalcony(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="balcony">Balcony</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="garden"
                        checked={hasGarden}
                        onChange={(e) => setHasGarden(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="garden">Garden/Terrace</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze Budget & Generate Plan
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Real-time Cost Analysis */}
          {showAnalysis && selectedCityData && (
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Smart Cost Analysis
                </CardTitle>
                <CardDescription>AI-powered budget breakdown for {city}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Budget Status</span>
                    {budgetStatus === "sufficient" ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Sufficient
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Needs Review
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Your Budget</span>
                      <span className="font-semibold">₹{Number.parseInt(budget || "0").toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Estimated Cost</span>
                      <span className="font-semibold">₹{estimatedCost.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className={budgetGap >= 0 ? "text-green-600" : "text-red-600"}>
                        {budgetGap >= 0 ? "Surplus" : "Shortfall"}
                      </span>
                      <span className={`font-semibold ${budgetGap >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ₹{Math.abs(budgetGap).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={budget && estimatedCost ? Math.min((Number.parseInt(budget) / estimatedCost) * 100, 100) : 0}
                    className="h-2"
                  />
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Estimated Cost Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Materials (45%)</span>
                      <span className="font-medium">₹{Math.round(estimatedCost * 0.45).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Labor (30%)</span>
                      <span className="font-medium">₹{Math.round(estimatedCost * 0.3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contractor (15%)</span>
                      <span className="font-medium">₹{Math.round(estimatedCost * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Permits & Misc (10%)</span>
                      <span className="font-medium">₹{Math.round(estimatedCost * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Regional Comparison */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Regional Price Comparison</h4>
                  <div className="space-y-2">
                    {availableCities.slice(0, 5).map((cityData) => (
                      <div key={cityData.name} className="flex justify-between items-center text-sm">
                        <span className={cityData.name === city ? "font-semibold text-primary" : ""}>
                          {cityData.name}
                        </span>
                        <span className={cityData.name === city ? "font-semibold text-primary" : ""}>
                          ₹{cityData.avgCost}/sq ft
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Smart Recommendations</h4>
                  <div className="space-y-2">
                    {budgetGap < 0 && selectedCityData && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Consider reducing area by {Math.ceil(Math.abs(budgetGap) / selectedCityData.avgCost)} sq ft or
                          opt for basic quality materials.
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Best construction season: October to March for optimal weather conditions in {state}.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleProceedToDashboard} className="w-full" size="lg">
                  Proceed to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ConstructionDashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
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
      <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-semibold">EasyConstruct</span>
            </div>

            <nav className="flex items-center gap-2">
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                onClick={() => setCurrentView("dashboard")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentView === "ai-designer" ? "default" : "ghost"}
                onClick={() => setCurrentView("ai-designer")}
                className="gap-2"
              >
                <Bot className="h-4 w-4" />
                AI Designer
              </Button>
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
                  onClick={() => setCurrentView("ai-designer")}
                >
                  <Palette className="h-6 w-6" />
                  <span>AI House Designer</span>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-semibold">₹25,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span className="font-semibold">1,200 sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rooms</span>
                <span className="font-semibold">3 BHK</span>
              </div>
              <div className="pt-4">
                <Button className="w-full">View Detailed Plan</Button>
              </div>
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
      </main>
    </div>
  )
}