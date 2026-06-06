"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  Languages,
  Minimize2,
  Maximize2,
  Sparkles,
  Home,
  Calculator,
  Hammer,
  Users,
  Leaf,
  MapPin,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  language: string
}

export default function AIConstructionChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "नमस्ते! मैं आपका AI निर्माण सहायक हूं। मैं आपकी घर निर्माण यात्रा में मदद कर सकता हूं। आप मुझसे हिंदी, अंग्रेजी या कन्नड़ में बात कर सकते हैं।",
      timestamp: new Date(),
      language: "hi",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("auto")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "auto", name: "Auto Detect", flag: "🌐" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
  ]

  const quickActions = [
    { icon: Calculator, text: "Cost Estimate", query: "What's the estimated cost for my 3BHK house?" },
    { icon: Home, text: "Design Ideas", query: "Show me modern house design ideas for my budget" },
    { icon: Hammer, text: "Materials", query: "What materials do I need for construction?" },
    { icon: Users, text: "Find Contractors", query: "Help me find verified contractors in my area" },
    { icon: Leaf, text: "Vastu Tips", query: "Give me vastu tips for my house layout" },
    { icon: MapPin, text: "Local Vendors", query: "Find material vendors near my location" },
  ]

  const aiResponses = {
    cost: {
      en: "Based on your 3BHK house plan, the estimated cost would be ₹25-30 lakhs including materials, labor, and permits. This can vary by 15-20% based on your city and quality preferences.",
      hi: "आपके 3BHK घर की योजना के आधार पर, सामग्री, श्रम और परमिट सहित अनुमानित लागत ₹25-30 लाख होगी। यह आपके शहर और गुणवत्ता की प्राथमिकताओं के आधार पर 15-20% तक भिन्न हो सकती है।",
      kn: "ನಿಮ್ಮ 3BHK ಮನೆಯ ಯೋಜನೆಯ ಆಧಾರದ ಮೇಲೆ, ವಸ್ತುಗಳು, ಕಾರ್ಮಿಕರು ಮತ್ತು ಪರವಾನಗಿಗಳು ಸೇರಿದಂತೆ ಅಂದಾಜು ವೆಚ್ಚ ₹25-30 ಲಕ್ಷ ಆಗಿರುತ್ತದೆ।",
    },
    design: {
      en: "I can suggest modern designs with open layouts, large windows for natural light, and sustainable materials. Would you like to see 3D visualizations of contemporary Indian architecture styles?",
      hi: "मैं खुले लेआउट, प्राकृतिक प्रकाश के लिए बड़ी खिड़कियों और टिकाऊ सामग्री के साथ आधुनिक डिज़ाइन सुझा सकता हूं। क्या आप समकालीन भारतीय वास्तुकला शैलियों के 3D विज़ुअलाइज़ेशन देखना चाहेंगे?",
      kn: "ನಾನು ತೆರೆದ ವಿನ್ಯಾಸಗಳು, ನೈಸರ್ಗಿಕ ಬೆಳಕಿಗಾಗಿ ದೊಡ್ಡ ಕಿಟಕಿಗಳು ಮತ್ತು ಸುಸ್ಥಿರ ವಸ್ತುಗಳೊಂದಿಗೆ ಆಧುನಿಕ ವಿನ್ಯಾಸಗಳನ್ನು ಸೂಚಿಸಬಹುದು।",
    },
    materials: {
      en: "For your construction, you'll need: Cement (OPC 53 grade), Steel (TMT bars), Bricks (fly ash), Sand, Aggregates, Tiles, Paint, and Electrical/Plumbing materials. I can help you find the best prices in your city.",
      hi: "आपके निर्माण के लिए आपको चाहिए: सीमेंट (OPC 53 ग्रेड), स्टील (TMT बार), ईंटें (फ्लाई ऐश), रेत, एग्रीगेट्स, टाइलें, पेंट, और इलेक्ट्रिकल/प्लंबिंग सामग्री। मैं आपके शहर में सबसे अच्छी कीमतें खोजने में मदद कर सकता हूं।",
      kn: "ನಿಮ್ಮ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ನಿಮಗೆ ಬೇಕಾಗುವುದು: ಸಿಮೆಂಟ್ (OPC 53 ಗ್ರೇಡ್), ಉಕ್ಕು (TMT ಬಾರ್‌ಗಳು), ಇಟ್ಟಿಗೆಗಳು, ಮರಳು, ಕಲ್ಲುಗಳು, ಟೈಲ್ಸ್, ಬಣ್ಣ ಮತ್ತು ವಿದ್ಯುತ್/ಪ್ಲಂಬಿಂಗ್ ವಸ್ತುಗಳು।",
    },
    contractors: {
      en: "I can connect you with verified contractors in your area. Based on your location and project size, I'll show ratings, previous work, and cost estimates. Would you like me to search for contractors now?",
      hi: "मैं आपको आपके क्षेत्र में सत्यापित ठेकेदारों से जोड़ सकता हूं। आपके स्थान और परियोजना के आकार के आधार पर, मैं रेटिंग, पिछला काम और लागत अनुमान दिखाऊंगा। क्या आप चाहते हैं कि मैं अभी ठेकेदारों की खोज करूं?",
      kn: "ನಾನು ನಿಮ್ಮನ್ನು ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿನ ಪರಿಶೀಲಿತ ಗುತ್ತಿಗೆದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಬಹುದು। ನಿಮ್ಮ ಸ್ಥಳ ಮತ್ತು ಯೋಜನೆಯ ಗಾತ್ರದ ಆಧಾರದ ಮೇಲೆ ರೇಟಿಂಗ್‌ಗಳು ಮತ್ತು ವೆಚ್ಚದ ಅಂದಾಜುಗಳನ್ನು ತೋರಿಸುತ್ತೇನೆ।",
    },
    vastu: {
      en: "For good vastu: Main entrance should face North/East, Kitchen in Southeast, Master bedroom in Southwest, and Pooja room in Northeast. Avoid toilets in Northeast corner. Would you like detailed room-wise vastu guidance?",
      hi: "अच्छे वास्तु के लिए: मुख्य प्रवेश द्वार उत्तर/पूर्व की ओर, रसोई दक्षिण-पूर्व में, मुख्य शयनकक्ष दक्षिण-पश्चिम में, और पूजा कक्ष उत्तर-पूर्व में होना चाहिए। उत्तर-पूर्व कोने में शौचालय से बचें।",
      kn: "ಉತ್ತಮ ವಾಸ್ತುಗಾಗಿ: ಮುಖ್ಯ ಪ್ರವೇಶದ್ವಾರ ಉತ್ತರ/ಪೂರ್ವಕ್ಕೆ, ಅಡುಗೆಮನೆ ಆಗ್ನೇಯದಲ್ಲಿ, ಮುಖ್ಯ ಮಲಗುವ ಕೋಣೆ ನೈಋತ್ಯದಲ್ಲಿ, ಮತ್ತು ಪೂಜಾ ಕೋಣೆ ಈಶಾನ್ಯದಲ್ಲಿ ಇರಬೇಕು।",
    },
    vendors: {
      en: "I can help you find local material vendors with real-time pricing. Based on your location, I'll show nearby suppliers for cement, steel, bricks, and other materials with delivery options and bulk discounts.",
      hi: "मैं आपको वास्तविक समय की कीमतों के साथ स्थानीय सामग्री विक्रेताओं को खोजने में मदद कर सकता हूं। आपके स्थान के आधार पर, मैं डिलीवरी विकल्पों और थोक छूट के साथ सीमेंट, स्टील, ईंटों और अन्य सामग्री के लिए आस-पास के आपूर्तिकर्ताओं को दिखाऊंगा।",
      kn: "ನಾನು ನಿಮಗೆ ನೈಜ-ಸಮಯದ ಬೆಲೆಗಳೊಂದಿಗೆ ಸ್ಥಳೀಯ ವಸ್ತು ಮಾರಾಟಗಾರರನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಬಹುದು। ನಿಮ್ಮ ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ಸಿಮೆಂಟ್, ಉಕ್ಕು, ಇಟ್ಟಿಗೆಗಳಿಗಾಗಿ ಹತ್ತಿರದ ಪೂರೈಕೆದಾರರನ್ನು ತೋರಿಸುತ್ತೇನೆ।",
    },
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const detectLanguage = (text: string): string => {
    // Simple language detection based on script
    if (/[\u0900-\u097F]/.test(text)) return "hi" // Devanagari (Hindi)
    if (/[\u0C80-\u0CFF]/.test(text)) return "kn" // Kannada
    if (/[\u0B80-\u0BFF]/.test(text)) return "ta" // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return "te" // Telugu
    return "en" // Default to English
  }

  const getAIResponse = (message: string, language: string): string => {
    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes("cost") ||
      lowerMessage.includes("price") ||
      lowerMessage.includes("लागत") ||
      lowerMessage.includes("ವೆಚ್ಚ")
    ) {
      return aiResponses.cost[language as keyof typeof aiResponses.cost] || aiResponses.cost.en
    }
    if (lowerMessage.includes("design") || lowerMessage.includes("डिज़ाइन") || lowerMessage.includes("ವಿನ್ಯಾಸ")) {
      return aiResponses.design[language as keyof typeof aiResponses.design] || aiResponses.design.en
    }
    if (lowerMessage.includes("material") || lowerMessage.includes("सामग्री") || lowerMessage.includes("ವಸ್ತು")) {
      return aiResponses.materials[language as keyof typeof aiResponses.materials] || aiResponses.materials.en
    }
    if (lowerMessage.includes("contractor") || lowerMessage.includes("ठेकेदार") || lowerMessage.includes("ಗುತ್ತಿಗೆದಾರ")) {
      return aiResponses.contractors[language as keyof typeof aiResponses.contractors] || aiResponses.contractors.en
    }
    if (lowerMessage.includes("vastu") || lowerMessage.includes("वास्तु") || lowerMessage.includes("ವಾಸ್ತು")) {
      return aiResponses.vastu[language as keyof typeof aiResponses.vastu] || aiResponses.vastu.en
    }
    if (lowerMessage.includes("vendor") || lowerMessage.includes("विक्रेता") || lowerMessage.includes("ಮಾರಾಟಗಾರ")) {
      return aiResponses.vendors[language as keyof typeof aiResponses.vendors] || aiResponses.vendors.en
    }

    // Default responses in different languages
    const defaultResponses = {
      en: "I understand you're asking about construction. I can help with cost estimates, design ideas, materials, contractors, vastu guidance, and finding local vendors. What specific aspect would you like to know more about?",
      hi: "मैं समझता हूं कि आप निर्माण के बारे में पूछ रहे हैं। मैं लागत अनुमान, डिज़ाइन विचार, सामग्री, ठेकेदार, वास्तु मार्गदर्शन और स्थानीय विक्रेताओं को खोजने में मदद कर सकता हूं। आप किस विशिष्ट पहलू के बारे में और जानना चाहेंगे?",
      kn: "ನೀವು ನಿರ್ಮಾಣದ ಬಗ್ಗೆ ಕೇಳುತ್ತಿದ್ದೀರಿ ಎಂದು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ನಾನು ವೆಚ್ಚದ ಅಂದಾಜುಗಳು, ವಿನ್ಯಾಸ ಆಲೋಚನೆಗಳು, ವಸ್ತುಗಳು, ಗುತ್ತಿಗೆದಾರರು, ವಾಸ್ತು ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸ್ಥಳೀಯ ಮಾರಾಟಗಾರರನ್ನು ಹುಡುಕುವಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು।",
    }

    return defaultResponses[language as keyof typeof defaultResponses] || defaultResponses.en
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userLanguage = selectedLanguage === "auto" ? detectLanguage(inputMessage) : selectedLanguage
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      language: userLanguage,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      // Call the Flask backend API
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.reply || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
        language: data.detected_language || userLanguage,
      }

      setMessages((prev) => [...prev, aiMessage])
      // speak AI reply in selected language (supports pause/resume)
      try {
        toggleSpeak(aiMessage.content)
      } catch (e) {
        console.warn("TTS failed", e)
      }
    } catch (error) {
      console.error("Error communicating with AI backend:", error)
      
      // Fallback to local response if API fails
      const fallbackResponse = getAIResponse(currentMessage, userLanguage)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: fallbackResponse,
        timestamp: new Date(),
        language: userLanguage,
      }
      
      setMessages((prev) => [...prev, aiMessage])
      // speak offline fallback response (supports pause/resume)
      try {
        toggleSpeak(aiMessage.content)
      } catch (e) {
        console.warn("TTS failed", e)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (query: string) => {
    setInputMessage(query)
    setTimeout(() => handleSendMessage(), 100)
  }

  const startListening = () => {
    // Use Web Speech API for real recognition when available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      // Fallback simulated behavior
      setIsListening(true)
      setTimeout(() => {
        setIsListening(false)
        setInputMessage("What's the cost estimate for my house construction?")
      }, 2000)
      return
    }

    const recognition = new SpeechRecognition()
    const langCode = selectedLanguage === "auto" ? "en-IN" : selectedLanguage
    // map short codes to BCP-47 locales for speech recognition
    const localeMap: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      auto: "en-IN",
    }
    recognition.lang = localeMap[langCode as keyof typeof localeMap] || String(langCode)
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputMessage((prev) => (prev ? prev + " " + transcript : transcript))
    }
    recognition.onerror = (e) => {
      console.error("Speech recognition error", e)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const speakMessage = (text: string) => {
    if (!window.speechSynthesis) return

    setIsSpeaking(true)
    setIsPaused(false)
    const utter = new SpeechSynthesisUtterance(text)
    utterRef.current = utter

    // prefer a voice that matches the selected language
    const langToLocale: Record<string, string> = {
      auto: "en-IN",
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
    }
    const desired = langToLocale[selectedLanguage] || langToLocale.auto

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      let v = voices.find((v) => v.lang === desired)
      if (!v) v = voices.find((v) => v.lang && v.lang.startsWith(desired.split("-")[0]))
      if (v) utter.voice = v
      utter.lang = desired
      utter.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        utterRef.current = null
      }
      window.speechSynthesis.speak(utter)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => setVoice()
    } else {
      setVoice()
    }
  }

  const toggleSpeak = (text: string) => {
    if (!window.speechSynthesis) return

    // If currently speaking and not paused => pause
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      return
    }

    // If paused => resume
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    // Not speaking => start new utterance (cancel any existing)
    window.speechSynthesis.cancel()
    speakMessage(text)
  }

  // Recording handlers
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("MediaDevices API not available")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      setMediaRecorder(mr)
      setRecordedChunks([])
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data])
      }
      mr.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setRecordingUrl(url)
      }
      mr.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error starting recording", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (!recordingUrl) return
    const a = document.createElement("a")
    a.href = recordingUrl
    a.download = `chat-recording-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? "h-14" : "h-[600px]"} w-96`}
    >
      <Card className="h-full shadow-2xl border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">AI Construction Assistant</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            {/* Language Selector */}
            <div className="px-4 pb-3 border-b">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="h-8 text-xs">
                  <div className="flex items-center gap-2">
                    <Languages className="h-3 w-3" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-medium mb-2">Quick Actions</div>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-transparent"
                      onClick={() => handleQuickAction(action.query)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {action.text}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 overflow-hidden">
              <div className="space-y-4 py-4 h-full overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === "ai" && <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {message.type === "ai" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 opacity-70 hover:opacity-100"
                                onClick={() => toggleSpeak(message.content)}
                              >
                                {isSpeaking && !isPaused ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about construction, materials, costs..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                    onClick={startListening}
                  >
                    {isListening ? <MicOff className="h-3 w-3 text-red-500" /> : <Mic className="h-3 w-3" />}
                  </Button>
                  {/* Recording controls */}
                  <div className="absolute left-2 top-1 flex items-center gap-2">
                    {!isRecording ? (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={startRecording}>
                        <span className="block h-2 w-2 bg-red-500 rounded-full" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={stopRecording}>
                        <span className="text-xs">■</span>
                      </Button>
                    )}
                    {recordingUrl && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={downloadRecording}>
                        ⬇️
                      </Button>
                    )}
                  </div>
                </div>
                <Button onClick={handleSendMessage} size="sm" disabled={!inputMessage.trim()}>
                  <Send className="h-3 w-3" />
                </Button>
              </div>
              {isListening && (
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-1 w-1 bg-red-500 rounded-full animate-pulse" />
                    Listening... Speak now
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
