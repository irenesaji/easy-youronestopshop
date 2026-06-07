"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Languages,
  Calculator,
  Hammer,
  HelpCircle,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  language?: string
}

const welcomeMessages: Record<string, string> = {
  en: "Hello! I'm your AI Construction Assistant. I can help you with construction costs, materials, workforce, Vastu compliance, and more. How can I help you today?",
  hi: "नमस्ते! मैं आपका AI निर्माण सहायक हूं। मैं निर्माण लागत, सामग्री, कार्यबल, वास्तु अनुपालन और बहुत कुछ में आपकी मदद कर सकता हूं।",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ನಿರ್ಮಾಣ ಸಹಾಯಕ. ನಿರ್ಮಾಣ ವೆಚ್ಚ, ಸಾಮಗ್ರಿಗಳು, ಕಾರ್ಮಿಕ ಬಲ ಮತ್ತು ಹೆಚ್ಚಿನ ವಿಷಯಗಳಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
  ta: "வணக்கம்! நான் உங்கள் AI கட்டுமான உதவியாளர். கட்டுமான செலவுகள், பொருட்கள், பணியாளர்கள் மற்றும் வாஸ்து இணக்கம் பற்றி உதவ முடியும்.",
  te: "నమస్కారం! నేను మీ AI నిర్మాణ సహాయకుడిని. నిర్మాణ ఖర్చులు, సామగ్రి, కార్మికులు మరియు వాస్తు అనుగుణతలో సహాయం చేయగలను.",
  ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI നിർമ്മാണ സഹായകനാണ്. നിർമ്മാണ ചെലവ്, സാമഗ്രികൾ, തൊഴിൽ ശക്തി, വാസ്തു അനുപാലനം എന്നിവയിൽ ഞാൻ സഹായിക്കാം. ഇന്ന് എനിക്ക് എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
}

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
]

// Speech synthesis BCP-47 language tag map
const speechLangMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  ta: "ta-IN",
  te: "te-IN",
}

const quickActions = [
  { key: "cost", text: "Cost Estimate", icon: Calculator },
  { key: "materials", text: "Materials", icon: Hammer },
  { key: "help", text: "Help", icon: HelpCircle },
]

type ResponseKey = "cost" | "materials" | "help" | "default"

const aiResponsesByLang: Record<string, Record<ResponseKey, string>> = {
  en: {
    cost: "For a standard 1000 sq ft home in India, construction costs typically range:\n• Basic: ₹12–16 lakhs\n• Standard: ₹16–22 lakhs\n• Premium: ₹22–30 lakhs\n\nCosts vary by city. Mumbai and Delhi are 30–40% higher than tier-2 cities.",
    materials: "Key construction materials and approximate costs:\n• Cement: ₹350–400/bag (50kg)\n• Steel: ₹55–65/kg\n• Bricks: ₹7–10 each\n• Sand: ₹40–60/cubic ft\n• Aggregate: ₹35–55/cubic ft\n\nPrices vary by region and quality.",
    help: "I can help you with:\n• 📊 Budget estimation for your project\n• 🏗️ Material recommendations\n• 👷 Workforce & contractor guidance\n• 🌿 Vastu & eco-compliance tips\n• 📍 Regional pricing across India\n\nJust ask me anything!",
    default: "Thank you for your question! For accurate construction advice, I recommend:\n1. Consulting with a local contractor\n2. Getting multiple quotes for materials\n3. Checking our Materials Directory for current prices\n4. Using the Budget Planner for detailed estimates\n\nIs there something specific I can help you with?",
  },
  hi: {
    cost: "भारत में 1000 वर्ग फुट के मानक घर के लिए निर्माण लागत आमतौर पर:\n• बेसिक: ₹12–16 लाख\n• स्टैंडर्ड: ₹16–22 लाख\n• प्रीमियम: ₹22–30 लाख\n\nलागत शहर के अनुसार भिन्न होती है। मुंबई और दिल्ली टियर-2 शहरों से 30–40% अधिक हैं।",
    materials: "मुख्य निर्माण सामग्री और अनुमानित लागत:\n• सीमेंट: ₹350–400/बैग (50 किग्रा)\n• स्टील: ₹55–65/किग्रा\n• ईंटें: ₹7–10 प्रति ईंट\n• रेत: ₹40–60/घन फुट\n• गिट्टी: ₹35–55/घन फुट\n\nकीमतें क्षेत्र और गुणवत्ता के अनुसार अलग होती हैं।",
    help: "मैं इनमें आपकी सहायता कर सकता हूं:\n• 📊 बजट अनुमान\n• 🏗️ सामग्री अनुशंसाएं\n• 👷 कार्यबल और ठेकेदार मार्गदर्शन\n• 🌿 वास्तु और पर्यावरण-अनुपालन\n• 📍 भारत भर में क्षेत्रीय मूल्य निर्धारण\n\nकोई भी प्रश्न पूछें!",
    default: "आपके प्रश्न के लिए धन्यवाद! सटीक निर्माण सलाह के लिए:\n1. स्थानीय ठेकेदार से परामर्श करें\n2. सामग्री के लिए कई कोटेशन लें\n3. मौजूदा कीमतों के लिए हमारी सामग्री निर्देशिका देखें\n4. विस्तृत अनुमान के लिए बजट प्लानर उपयोग करें\n\nक्या कोई विशेष प्रश्न है?",
  },
  kn: {
    cost: "ಭಾರತದಲ್ಲಿ 1000 ಚದರ ಅಡಿ ಮನೆಗೆ ನಿರ್ಮಾಣ ವೆಚ್ಚ:\n• ಬೇಸಿಕ್: ₹12–16 ಲಕ್ಷ\n• ಸ್ಟ್ಯಾಂಡರ್ಡ್: ₹16–22 ಲಕ್ಷ\n• ಪ್ರೀಮಿಯಂ: ₹22–30 ಲಕ್ಷ\n\nವೆಚ್ಚ ನಗರದ ಪ್ರಕಾರ ಭಿನ್ನವಾಗಿರುತ್ತದೆ.",
    materials: "ಪ್ರಮುಖ ನಿರ್ಮಾಣ ಸಾಮಗ್ರಿಗಳ ಅಂದಾಜು ಬೆಲೆ:\n• ಸಿಮೆಂಟ್: ₹350–400/ಚೀಲ\n• ಉಕ್ಕು: ₹55–65/ಕಿಗ್ರಾ\n• ಇಟ್ಟಿಗೆ: ₹7–10 ಪ್ರತಿ ಇಟ್ಟಿಗೆ\n• ಮರಳು: ₹40–60/ಘನ ಅಡಿ\n• ಜಲ್ಲಿ: ₹35–55/ಘನ ಅಡಿ",
    help: "ನಾನು ಇವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• 📊 ಬಜೆಟ್ ಅಂದಾಜು\n• 🏗️ ಸಾಮಗ್ರಿ ಶಿಫಾರಸುಗಳು\n• 👷 ಕಾರ್ಮಿಕ ಮತ್ತು ಗುತ್ತಿಗೆದಾರ ಮಾರ್ಗದರ್ಶನ\n• 🌿 ವಾಸ್ತು ಮತ್ತು ಪರಿಸರ ಅನುಪಾಲನೆ\n• 📍 ಭಾರತದಾದ್ಯಂತ ಪ್ರಾದೇಶಿಕ ಬೆಲೆಗಳು",
    default: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದ! ನಿಖರ ನಿರ್ಮಾಣ ಸಲಹೆಗಾಗಿ:\n1. ಸ್ಥಳೀಯ ಗುತ್ತಿಗೆದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ\n2. ಸಾಮಗ್ರಿಗಳಿಗೆ ಅನೇಕ ಉದ್ಧರಣ ಪಡೆಯಿರಿ\n3. ನಮ್ಮ ಸಾಮಗ್ರಿ ಡೈರೆಕ್ಟರಿ ಪರೀಕ್ಷಿಸಿ\n4. ಬಜೆಟ್ ಪ್ಲಾನರ್ ಬಳಸಿ",
  },
  ml: {
    cost: "ഇന്ത്യയിൽ 1000 ചതുരശ്ര അടി വീടിന്റെ നിർമ്മാണ ചെലവ്:\n• ബേസിക്: ₹12–16 ലക്ഷം\n• സ്റ്റാൻഡേർഡ്: ₹16–22 ലക്ഷം\n• പ്രീമിയം: ₹22–30 ലക്ഷം\n\nചെലവ് നഗരം അനുസരിച്ച് വ്യത്യാസപ്പെടുന്നു. മുംബൈ, ഡൽഹി എന്നിവ ടയർ-2 നഗരങ്ങളേക്കാൾ 30–40% കൂടുതൽ ആണ്.",
    materials: "പ്രധാന നിർമ്മാണ സാമഗ്രികളുടെ ഏകദേശ വില:\n• സിമന്റ്: ₹350–400/ബാഗ് (50 കിലോ)\n• സ്റ്റീൽ: ₹55–65/കിലോ\n• ഇഷ്ടിക: ₹7–10 ഓരോന്നും\n• മണൽ: ₹40–60/ക്യൂബിക് അടി\n• ചരൽ: ₹35–55/ക്യൂബിക് അടി\n\nവില പ്രദേശവും ഗുണനിലവാരവും അനുസരിച്ച് മാറുന്നു.",
    help: "ഞാൻ ഇനിപ്പറയുന്നവയിൽ സഹായിക്കാം:\n• 📊 ബജറ്റ് കണക്കാക്കൽ\n• 🏗️ സാമഗ്രി ശുപാർശകൾ\n• 👷 തൊഴിൽ ശക്തി & കോൺട്രാക്ടർ മാർഗനിർദ്ദേശം\n• 🌿 വാസ്തു & പരിസ്ഥിതി അനുപാലനം\n• 📍 ഇന്ത്യ മുഴുവൻ പ്രാദേശിക വിലകൾ\n\nഏതു ചോദ്യവും ചോദിക്കൂ!",
    default: "നിങ്ങളുടെ ചോദ്യത്തിന് നന്ദി! കൃത്യമായ നിർമ്മാണ ഉപദേശത്തിനായി:\n1. ഒരു പ്രാദേശിക കോൺട്രാക്ടറുമായി ആലോചിക്കുക\n2. സാമഗ്രികൾക്ക് ഒന്നിലധികം ക്വോട്ടേഷൻ വാങ്ങുക\n3. നിലവിലെ വിലകൾക്ക് ഞങ്ങളുടെ സാമഗ്രി ഡയറക്ടറി നോക്കുക\n4. വിശദമായ കണക്കിന് ബജറ്റ് പ്ലാനർ ഉപയോഗിക്കുക\n\nവേറെ എന്തെങ്കിലും ഉണ്ടോ?",
  },
  ta: {
    cost: "இந்தியாவில் 1000 சதுர அடி வீட்டிற்கான கட்டுமான செலவு:\n• அடிப்படை: ₹12–16 லட்சம்\n• நிலையான: ₹16–22 லட்சம்\n• பிரீமியம்: ₹22–30 லட்சம்\n\nசெலவு நகரத்தை பொறுத்து மாறுபடும்.",
    materials: "முக்கிய கட்டுமான பொருட்களின் தோராயமான விலை:\n• சிமெண்ட்: ₹350–400/பை\n• எஃகு: ₹55–65/கிலோ\n• செங்கல்: ₹7–10 ஒவ்வொன்றும்\n• மணல்: ₹40–60/கன அடி\n• கருங்கல்: ₹35–55/கன அடி",
    help: "நான் இவற்றில் உதவ முடியும்:\n• 📊 பட்ஜெட் மதிப்பீடு\n• 🏗️ பொருள் பரிந்துரைகள்\n• 👷 தொழிலாளர் & ஒப்பந்தகாரர் வழிகாட்டுதல்\n• 🌿 வாஸ்து & சுற்றுச்சூழல் இணக்கம்\n• 📍 இந்தியா முழுவதும் பிராந்திய விலைகள்",
    default: "உங்கள் கேள்விக்கு நன்றி! துல்லியமான கட்டுமான ஆலோசனைக்கு:\n1. உள்ளூர் ஒப்பந்தகாரரிடம் ஆலோசிக்கவும்\n2. பொருட்களுக்கு பல மேற்கோள்கள் பெறவும்\n3. நடப்பு விலைகளுக்கு எங்கள் பொருட்கள் அடைவை பாருங்கள்\n4. விரிவான மதிப்பீட்டிற்கு பட்ஜெட் திட்டமிடுபவரை பயன்படுத்துங்கள்",
  },
  te: {
    cost: "భారతదేశంలో 1000 చదరపు అడుగుల ఇంటికి నిర్మాణ ఖర్చులు:\n• బేసిక్: ₹12–16 లక్షలు\n• స్టాండర్డ్: ₹16–22 లక్షలు\n• ప్రీమియం: ₹22–30 లక్షలు\n\nఖర్చులు నగరాన్ని బట్టి మారుతాయి.",
    materials: "ముఖ్యమైన నిర్మాణ సామగ్రి అంచనా ధరలు:\n• సిమెంట్: ₹350–400/బ్యాగ్\n• స్టీల్: ₹55–65/కిలో\n• ఇటుకలు: ₹7–10 చొప్పున\n• ఇసుక: ₹40–60/క్యూబిక్ అడుగు\n• మెటల్: ₹35–55/క్యూబిక్ అడుగు",
    help: "నేను ఈ విషయాలలో సహాయపడగలను:\n• 📊 బడ్జెట్ అంచనా\n• 🏗️ సామగ్రి సిఫార్సులు\n• 👷 కార్మికులు & కాంట్రాక్టర్ మార్గదర్శకత్వం\n• 🌿 వాస్తు & పర్యావరణ అనుగుణత\n• 📍 భారతదేశంలో ప్రాంతీయ ధరలు",
    default: "మీ ప్రశ్నకు ధన్యవాదాలు! ఖచ్చితమైన నిర్మాణ సలహా కోసం:\n1. స్థానిక కాంట్రాక్టర్‌ను సంప్రదించండి\n2. సామగ్రికి బహుళ కోటేషన్లు పొందండి\n3. మా సామగ్రి డైరెక్టరీని చూడండి\n4. వివరణాత్మక అంచనా కోసం బడ్జెట్ ప్లానర్ ఉపయోగించండి",
  },
}

export default function AIConstructionChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: welcomeMessages.en,
      timestamp: new Date(),
      language: "en",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Always resolve the active language
  const activeLang = selectedLanguage

  const getLangResponse = (key: ResponseKey, lang: string): string =>
    (aiResponsesByLang[lang] ?? aiResponsesByLang.en)[key]

  const detectKey = (text: string): ResponseKey => {
    const t = text.toLowerCase()
    if (t.includes("cost") || t.includes("price") || t.includes("budget") || t.includes("estimate") ||
        t.includes("lakh") || t.includes("rupee") || t.includes("₹") ||
        t.includes("ചെലവ") || t.includes("വില") || t.includes("ബജ") ||
        t.includes("लागत") || t.includes("बजट") || t.includes("कीमत") ||
        t.includes("ವೆಚ್ಚ") || t.includes("ಬೆಲೆ") || t.includes("ಬಜೆಟ್") ||
        t.includes("செலவ") || t.includes("விலை") || t.includes("பட்ஜெட்") ||
        t.includes("ఖర్చ") || t.includes("ధర") || t.includes("బడ్జెట్")) return "cost"
    if (t.includes("material") || t.includes("cement") || t.includes("steel") || t.includes("brick") ||
        t.includes("sand") || t.includes("iron") ||
        t.includes("സാമഗ്") || t.includes("സിമ") || t.includes("ഇഷ്ട") ||
        t.includes("सामग") || t.includes("सीमेंट") || t.includes("ईंट") ||
        t.includes("ಸಾಮಗ್ರಿ") || t.includes("ಸಿಮೆಂಟ್") || t.includes("ಇಟ್ಟಿಗೆ") ||
        t.includes("பொருட்") || t.includes("சிமெண்") ||
        t.includes("సామగ్రి") || t.includes("సిమెంట్")) return "materials"
    if (t.includes("help") || t.includes("what can") || t.includes("assist") ||
        t.includes("സഹായ") || t.includes("सहाय") || t.includes("ಸಹಾಯ") ||
        t.includes("உதவ") || t.includes("సహాయ")) return "help"
    return "default"
  }

  const speakText = (text: string, lang: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLangMap[lang] ?? "en-IN"
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false) }
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setIsPaused(false)
  }

  const langNameMap: Record<string, string> = {
    en: "English", hi: "Hindi", kn: "Kannada", ml: "Malayalam", ta: "Tamil", te: "Telugu",
  }

  const askGroq = async (userText: string, lang: string): Promise<string> => {
    const langName = langNameMap[lang] ?? "English"
    const systemPrompt = `You are an expert AI Construction Assistant specializing in Indian construction industry.

You provide accurate, detailed answers about:
- Construction costs and budget estimation (region-wise rates in India)
- Building materials (cement, steel, bricks, sand, aggregate, tiles, etc.) with current Indian market prices
- Workforce and contractors (daily wages, hiring tips, contractor rates in India)
- Vastu Shastra compliance for homes and buildings
- Eco-friendly and sustainable construction practices
- Building permits, approvals, and legal requirements in India
- Structural engineering basics (foundation, RCC, load-bearing walls)
- Interior finishing, plumbing, electrical work estimates

RULES:
1. You MUST respond ONLY in ${langName} language. Every single word must be in ${langName}. Do NOT mix languages.
2. Give specific, accurate, practical answers with numbers and facts.
3. Use ₹ for all prices. Reference Indian cities/regions when relevant.
4. Keep responses clear and concise (under 200 words).
5. If the question is not related to construction, politely say so in ${langName}.`

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
        max_tokens: 512,
        temperature: 0.4,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? "Groq API error")
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ""
  }

  const sendAIReply = async (userText: string, lang: string) => {
    let responseText: string
    try {
      responseText = await askGroq(userText, lang)
      if (!responseText) throw new Error("empty")
    } catch {
      // fallback to hardcoded localized responses
      const key = detectKey(userText)
      responseText = getLangResponse(key, lang)
    }
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: "ai",
      content: responseText,
      timestamp: new Date(),
      language: lang,
    }])
    setIsTyping(false)
    speakText(responseText, lang)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    const lang = activeLang
    const captured = inputMessage
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content: captured,
      timestamp: new Date(),
    }])
    setInputMessage("")
    setIsTyping(true)
    sendAIReply(captured, lang)
  }

  const handleQuickAction = (key: string) => {
    const lang = activeLang
    const labels: Record<string, string> = { cost: "Cost Estimate", materials: "Materials Info", help: "Help" }
    const userText = labels[key] || key
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content: userText,
      timestamp: new Date(),
    }])
    setIsTyping(true)
    sendAIReply(userText, lang)
  }

  const toggleSpeak = (text: string, lang?: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    } else if (isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      speakText(text, lang ?? activeLang)
    }
  }

  const startListening = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = speechLangMap[activeLang] ?? "en-IN"
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (e: any) => setInputMessage(e.results[0][0].transcript)
    recognition.start()
  }

  const startRecording = () => setIsRecording(true)
  const stopRecording = () => setIsRecording(false)

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
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
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? "h-14" : "h-[600px]"} w-96`}>
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
              <Select
                value={selectedLanguage}
                onValueChange={(value) => {
                  setSelectedLanguage(value)
                  const lang = value === "auto" ? "en" : value
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === "1"
                        ? { ...m, content: welcomeMessages[lang] || welcomeMessages.en, language: lang }
                        : m
                    )
                  )
                }}
              >
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
                      onClick={() => handleQuickAction(action.key)}
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
              <div className="space-y-4 py-4">
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
                                onClick={() => toggleSpeak(message.content, message.language)}
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
                </div>
                <Button size="sm" onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  Send
                </Button>
              </div>
              {isRecording && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  Recording...
                  <Button variant="ghost" size="sm" className="h-5 text-xs p-1" onClick={stopRecording}>
                    Stop
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
