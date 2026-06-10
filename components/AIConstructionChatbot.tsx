"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
  Pencil,
  Briefcase,
  Store,
  Compass,
  RefreshCw,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  language?: string
  /** Whether this message has been read aloud (for speaker icon tracking) */
  spoken?: boolean
}

const welcomeMessages: Record<string, string> = {
  en: "Hello! I'm your AI Construction Assistant. I can help you with cost estimates, design ideas, materials, workforce, contractors, Vastu guidance, and local vendors. How can I help you today?",
  hi: "नमस्ते! मैं आपका AI निर्माण सहायक हूं। मैं लागत अनुमान, डिज़ाइन विचार, सामग्री, कार्यबल, ठेकेदार, वास्तु मार्गदर्शन और स्थानीय विक्रेताओं में आपकी मदद कर सकता हूं। कृपया अपना प्रश्न पूछें!",
  mr: "नमस्कार! मी तुमचा AI बांधकाम सहाय्यक आहे. मी खर्च अंदाज, डिझाइन कल्पना, साहित्य, कामगार, कंत्राटदार, वास्तु मार्गदर्शन आणि स्थानिक विक्रेते यांमध्ये मदत करू शकतो. कृपया तुमचा प्रश्न विचारा!",
  ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI നിർമ്മാണ സഹായകനാണ്. ചെലവ് കണക്കുകൾ, ഡിസൈൻ ആശയങ്ങൾ, സാമഗ്രികൾ, തൊഴിൽ ശക്തി, കോൺട്രാക്ടർമാർ, വാസ്തു മാർഗ്ഗനിർദ്ദേശം, പ്രാദേശിക വെണ്ടർമാർ എന്നിവയിൽ സഹായിക്കാം. ദയവായി നിങ്ങളുടെ ചോദ്യം ചോദിക്കൂ!",
  ta: "வணக்கம்! நான் உங்கள் AI கட்டுமான உதவியாளர். செலவு மதிப்பீடுகள், வடிவமைப்பு யோசனைகள், பொருட்கள், பணியாளர்கள், ஒப்பந்தக்காரர்கள், வாஸ்து வழிகாட்டுதல் மற்றும் உள்ளூர் விற்பனையாளர்களில் உதவ முடியும். தயவுசெய்து உங்கள் கேள்வியைக் கேளுங்கள்!",
  te: "నమస్కారం! నేను మీ AI నిర్మాణ సహాయకుడిని. ఖర్చు అంచనాలు, డిజైన్ ఆలోచనలు, సామగ్రి, కార్మికులు, కాంట్రాక్టర్లు, వాస్తు మార్గదర్శకత్వం మరియు స్థానిక విక్రేతలలో సహాయం చేయగలను. దయచేసి మీ ప్రశ్న అడగండి!",
}

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "mr", name: "Marathi (मराठी)", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam (മലയാളം)", flag: "🇮🇳" },
  { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "te", name: "Telugu (తెలుగు)", flag: "🇮🇳" },
]

const speechLangMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ml: "ml-IN",
  ta: "ta-IN",
  te: "te-IN",
}

// Map ISO language codes to full script names for the Groq system prompt
const langScriptMap: Record<string, string> = {
  en: "English (Latin script only)",
  hi: "Hindi (देवनागरी लिपि में ही - ONLY Devanagari script, NOT Romanized Hindi)",
  mr: "Marathi (देवनागरी लिपि में ही - ONLY Devanagari script, NOT Romanized Marathi)",
  ml: "Malayalam (മലയാളം ലിപിയിൽ മാത്രം - ONLY Malayalam script)",
  ta: "Tamil (தமிழ் எழுத்துக்களில் மட்டுமே - ONLY Tamil script)",
  te: "Telugu (తెలుగు లిపిలో మాత్రమే - ONLY Telugu script)",
}

interface QuickAction {
  key: string
  text: string
  icon: React.ElementType
  label: string
}

const quickActions: QuickAction[] = [
  { key: "cost", text: "Cost Estimate", icon: Calculator, label: "Cost Estimate" },
  { key: "materials", text: "Materials", icon: Hammer, label: "Materials Info" },
  { key: "design", text: "Design Ideas", icon: Pencil, label: "Design Ideas" },
  { key: "contractors", text: "Contractors", icon: Briefcase, label: "Verified Contractors" },
  { key: "vendors", text: "Local Vendors", icon: Store, label: "Local Vendors" },
  { key: "vastu", text: "Vastu Guide", icon: Compass, label: "Vastu Guidance" },
  { key: "help", text: "Help", icon: HelpCircle, label: "Help" },
]

type ResponseKey = "cost" | "materials" | "workforce" | "vastu" | "design" | "contractors" | "vendors" | "help" | "default"

const aiResponsesByLang: Record<string, Record<ResponseKey, string>> = {
  en: {
    cost: "Construction costs in India (per sq ft):\n• Basic: ₹1,200–1,600\n• Standard: ₹1,600–2,200\n• Premium: ₹2,200–3,000\n• Luxury: ₹3,000+\n\nFor 1000 sq ft: Basic ₹12–16L, Standard ₹16–22L, Premium ₹22–30L.\nMumbai/Delhi cost 30–40% more than tier-2 cities.",
    materials: "Current material prices (India):\n• Cement (OPC 53): ₹350–420/bag (50kg)\n• TMT Steel: ₹55–68/kg\n• Red Bricks: ₹7–12 each\n• River Sand: ₹50–80/cft\n• Aggregate (20mm): ₹40–60/cft\n• AAC Blocks: ₹45–55 each\n• Tiles (vitrified): ₹35–120/sq ft",
    workforce: "Labour rates in India (per day):\n• Mason: ₹700–1,200\n• Helper: ₹450–700\n• Carpenter: ₹700–1,100\n• Plumber: ₹600–1,000\n• Electrician: ₹600–1,000\n• Painter: ₹500–800\n• Welder: ₹800–1,200\n\nContractor rate: ₹150–300/sq ft (labour only).\nFor 1000 sq ft, labour cost typically ₹1.5–3 lakhs.",
    vastu: "Key Vastu principles for Indian homes:\n• Main door: East (most auspicious) or North facing\n• Kitchen: South-East corner (Agni corner)\n• Master bedroom: South-West\n• Pooja room: North-East (Ishanya corner)\n• Staircase: South, West or South-West\n• Guest room: North-West\n• Avoid toilet in North-East, centre, or near pooja room\n• Water sources: North-East or North\n• Septic tank: South-West or West\n• Plot shape: Square or rectangle ideal. Avoid triangular plots.\n\nAlways consult a Vastu expert before finalising plans.",
    design: "Popular home design styles in India:\n• Contemporary: Clean lines, large windows, open floor plans, flat/sloping roof\n• Traditional Indian: Jali work, courtyards (aangan), sloping Mangalore tile roofs\n• Modern Minimalist: Neutral tones, functional spaces, minimal ornamentation\n• Vastu-compliant: Room placement strictly per Vastu principles\n• Eco-friendly: Solar panels, rainwater harvesting, fly ash bricks, passive cooling\n• Duplex/Villa: Multiple floors with terrace garden\n\nConsider climate (hot/humid vs cold), plot size (30x40 vs 60x40), budget, and orientation.",
    contractors: "How to find & verify contractors in India:\n• Check local builder associations: CREDAI, BAI (Builders Association of India)\n• Ask for 3-5 recent project references and visit completed sites\n• Verify licenses, GST registration, PF/ESI registration, and insurance\n• Get at least 3 itemised quotes for comparison\n• Check online on: Housing.com, MagicBricks, BuildersMart, Sulekha\n\n⚠ Red flags: Demands >30% advance, no written contract, no portfolio, avoids site visits.\n✅ Green flags: Provides detailed BOQ, has own team, offers warranty, shares past client contacts.",
    vendors: "Finding local vendors for best material prices:\n• Cement/Steel: Check wholesale dealers or company depots directly\n• Bricks: Contact local brick kilns directly (skip middlemen)\n• Sand/Aggregate: Check with local crushers or PWD-approved suppliers\n• Tiles/Sanitaryware: Visit dedicated tile showrooms; bulk orders get 10-20% off\n• Paint: Direct from Asian Paints/Berger dealer for 15-25% off MRP\n• Hardware: Local hardware markets often beat online prices by 10-15%\n• Electrical: Visit local electrical markets (e.g., Lajpat Rai Delhi, Bhuleshwar Mumbai)\n\nAlways compare 3-4 vendors, ask for GST invoices, and negotiate for bulk orders.",
    help: "I can help you with:\n• 📊 Construction costs & budget planning\n• 🏗️ Building materials & current market prices\n• 👷 Workforce rates & contractor guidance\n• 🌿 Vastu Shastra compliance & tips\n• ✏️ Design ideas & architectural styles\n• ✅ How to find & verify contractors\n• 🏪 Local vendors & material sourcing tips\n• 🌱 Eco-friendly construction methods\n• 📋 Building permits & approval process\n• 🛠️ Structural, plumbing & electrical basics\n\nJust ask me anything about your construction project!",
    default: "Thank you for your question! I can provide accurate advice on:\n• Cost estimates & budget planning\n• Building materials & current prices\n• Workforce & contractor rates\n• Vastu Shastra guidance\n• Design ideas & architectural styles\n• Verified contractors & how to find them\n• Local vendors & material sourcing\n• Eco-friendly construction tips\n\nPlease ask your specific construction-related question!",
  },
  hi: {
    cost: "भारत में निर्माण लागत (प्रति वर्ग फुट):\n• बेसिक: ₹1,200–1,600\n• स्टैंडर्ड: ₹1,600–2,200\n• प्रीमियम: ₹2,200–3,000\n• लक्ज़री: ₹3,000+\n\n1000 वर्ग फुट घर के लिए: बेसिक ₹12–16 लाख, स्टैंडर्ड ₹16–22 लाख.\nमुंबई/दिल्ली में टियर-2 शहरों से 30–40% अधिक लागत।",
    materials: "वर्तमान सामग्री मूल्य (भारत):\n• सीमेंट (OPC 53): ₹350–420/बैग (50kg)\n• TMT स्टील: ₹55–68/kg\n• लाल ईंट: ₹7–12 प्रत्येक\n• रेत: ₹50–80/घन फुट\n• गिट्टी (20mm): ₹40–60/घन फुट\n• AAC ब्लॉक: ₹45–55 प्रति\n• टाइल्स: ₹35–120/वर्ग फुट",
    workforce: "मजदूरी दर (प्रतिदिन):\n• राजमिस्त्री: ₹700–1,200\n• हेल्पर: ₹450–700\n• बढ़ई: ₹700–1,100\n• प्लंबर: ₹600–1,000\n• इलेक्ट्रीशियन: ₹600–1,000\n• पेंटर: ₹500–800\n• वेल्डर: ₹800–1,200\n\nठेकेदार दर: ₹150–300/वर्ग फुट (श्रम मात्र)।\n1000 वर्ग फुट के लिए मजदूरी लगभग ₹1.5–3 लाख।",
    vastu: "प्रमुख वास्तु सिद्धांत:\n• मुख्य द्वार: पूर्व (सर्वश्रेष्ठ) या उत्तर दिशा\n• रसोई: दक्षिण-पूर्व (अग्नि कोण)\n• मास्टर बेडरूम: दक्षिण-पश्चिम\n• पूजा कक्ष: उत्तर-पूर्व (ईशान कोण)\n• सीढ़ियाँ: दक्षिण, पश्चिम या दक्षिण-पश्चिम\n• पानी की टंकी: उत्तर-पूर्व\n• सेप्टिक टैंक: दक्षिण-पश्चिम या पश्चिम\n• उत्तर-पूर्व, केंद्र या पूजा कक्ष के पास शौचालय न बनाएं\n\nयोजना अंतिम रूप देने से पहले वास्तु विशेषज्ञ से सलाह लें।",
    design: "लोकप्रिय घर डिज़ाइन शैलियाँ:\n• समकालीन: साफ लाइनें, बड़ी खिड़कियां, खुला फ्लोर प्लान\n• पारंपरिक भारतीय: जाली का काम, आंगन, मंगलौर टाइल छत\n• आधुनिक मिनिमलिस्ट: तटस्थ रंग, न्यूनतम सजावट\n• वास्तु-अनुरूप: वास्तु के अनुसार कमरे की व्यवस्था\n• इको-फ्रेंडली: सोलर पैनल, वर्षा जल संचयन, फ्लाई ऐश ईंट\n\nजलवायु, प्लॉट आकार (30x40 या 60x40), बजट और दिशा पर विचार करें।",
    contractors: "वेरिफाइड ठेकेदार कैसे खोजें:\n• स्थानीय बिल्डर्स एसोसिएशन (CREDAI, BAI) जांचें\n• 3-5 हालिया प्रोजेक्ट रेफरेंस मांगें और साइट विजिट करें\n• लाइसेंस, GST रजिस्ट्रेशन, PF/ESI और इंश्योरेंस जांचें\n• कम से कम 3 आइटमाइज्ड कोटेशन तुलना करें\n• Housing.com, MagicBricks, Sulekha पर जांचें\n\n⚠ सावधानी: 30% से अधिक एडवांस मांगना, कोई लिखित अनुबंध नहीं, कोई पोर्टफोलियो नहीं।\n✅ अच्छा संकेत: विस्तृत BOQ देता है, अपनी टीम है, वारंटी प्रदान करता है।",
    vendors: "स्थानीय विक्रेताओं से सर्वश्रेष्ठ दरें कैसे पाएं:\n• सीमेंट/स्टील: थोक विक्रेताओं या कंपनी डिपो से सीधे लें\n• ईंटें: स्थानीय भट्टों से सीधे संपर्क करें (बिचौलियों को हटाएं)\n• रेत/गिट्टी: स्थानीय क्रशर या PWD-अनुमोदित आपूर्तिकर्ताओं से लें\n• टाइल्स: टाइल शोरूम में बल्क ऑर्डर पर 10-20% छूट\n• पेंट: एशियन पेंट्स/बर्जर डीलर से सीधे 15-25% छूट\n• हार्डवेयर: स्थानीय हार्डवेयर बाजार 10-15% सस्ते\n• 3-4 विक्रेताओं से GST इनवॉइस लें और मोलभाव करें",
    help: "मैं इन विषयों में सहायता कर सकता हूं:\n• 📊 निर्माण लागत और बजट योजना\n• 🏗️ सामग्री और वर्तमान बाजार मूल्य\n• 👷 मजदूरी दर और ठेकेदार मार्गदर्शन\n• 🌿 वास्तु शास्त्र अनुपालन\n• ✏️ डिज़ाइन विचार और आर्किटेक्चरल शैलियाँ\n• ✅ वेरिफाइड ठेकेदार कैसे खोजें\n• 🏪 स्थानीय विक्रेता और सामग्री सोर्सिंग\n• 🌱 पर्यावरण-अनुकूल निर्माण\n\nअपना निर्माण-संबंधित प्रश्न पूछें!",
    default: "आपके प्रश्न के लिए धन्यवाद! मैं इन विषयों पर सटीक सलाह दे सकता हूं:\n• लागत अनुमान और बजट योजना\n• निर्माण सामग्री और मौजूदा कीमतें\n• कार्यबल और ठेकेदार दरें\n• वास्तु शास्त्र मार्गदर्शन\n• डिज़ाइन विचार और शैलियाँ\n• वेरिफाइड ठेकेदार\n• स्थानीय विक्रेता\n• इको-फ्रेंडली निर्माण\n\nकृपया अपना विशिष्ट प्रश्न पूछें!",
  },
  mr: {
    cost: "भारतात बांधकाम खर्च (प्रति चौरस फूट):\n• मूलभूत: ₹1,200–1,600\n• मानक: ₹1,600–2,200\n• प्रीमियम: ₹2,200–3,000\n• लक्झरी: ₹3,000+\n\n1000 चौरस फूट घरासाठी: मूलभूत ₹12–16 लाख, मानक ₹16–22 लाख.\nमुंबई/दिल्ली टियर-2 शहरांपेक्षा 30–40% अधिक खर्च.",
    materials: "सध्याचे साहित्य दर (भारत):\n• सिमेंट (OPC 53): ₹350–420/पिशवी (50kg)\n• TMT स्टील: ₹55–68/किलो\n• लाल विटा: ₹7–12 प्रति\n• वाळू: ₹50–80/घन फूट\n• मेटल (20mm): ₹40–60/घन फूट\n• AAC ब्लॉक: ₹45–55 प्रति\n• फरशा: ₹35–120/चौरस फूट",
    workforce: "मजुरी दर (प्रतिदिन):\n• राजमिस्त्री: ₹700–1,200\n• हेल्पर: ₹450–700\n• सुतार: ₹700–1,100\n• प्लंबर: ₹600–1,000\n• इलेक्ट्रिशियन: ₹600–1,000\n• पेंटर: ₹500–800\n• वेल्डर: ₹800–1,200\n\nकंत्राटदार दर: ₹150–300/चौरस फूट (कामगार मात्र).\n1000 चौरस फूटसाठी मजुरी खर्च ₹1.5–3 लाख.",
    vastu: "मुख्य वास्तु तत्त्वे:\n• मुख्य दरवाजा: पूर्व (सर्वोत्तम) किंवा उत्तर दिशा\n• स्वयंपाकघर: आग्नेय कोपरा (अग्नी कोण)\n• मास्टर बेडरूम: नैऋत्य\n• पूजा खोली: ईशान्य (ईशान कोण)\n• पायऱ्या: दक्षिण, पश्चिम किंवा नैऋत्य\n• पाण्याचे स्रोत: ईशान्य किंवा उत्तर\n• सेप्टिक टाकी: नैऋत्य किंवा पश्चिम\n• ईशान्य, मध्य किंवा पूजा खोलीजवळ शौचालय बांधू नका\n\nयोजना अंतिम करण्यापूर्वी वास्तु तज्ज्ञाचा सल्ला घ्या.",
    design: "लोकप्रिय घर रचना शैली:\n• समकालीन: स्वच्छ रेषा, मोठ्या खिडक्या, खुला मजला आराखडा\n• पारंपारिक भारतीय: जाळीकाम, अंगण, मंगलोर फरशीचे छप्पर\n• आधुनिक मिनिमलिस्ट: तटस्थ रंग, कार्यात्मक जागा\n• वास्तु-अनुरूप: वास्तुनुसार खोल्यांची मांडणी\n• पर्यावरणपूरक: सोलर पॅनेल, पावसाळी पाणी साठवण, फ्लाय आश विटा\n\nहवामान, प्लॉट आकार (30x40, 60x40), बजेट आणि दिशा विचारात घ्या.",
    contractors: "प्रमाणित कंत्राटदार कसे शोधावेत:\n• स्थानिक बिल्डर्स असोसिएशन (CREDAI, BAI) तपासा\n• 3-5 अलीकडील प्रकल्प संदर्भ विचारा आणि साइट भेट द्या\n• परवाना, GST नोंदणी, PF/ESI आणि विमा तपासा\n• किमान 3 तपशीलवार कोटेशनची तुलना करा\n• Housing.com, MagicBricks, Sulekha वर तपासा\n\n⚠ धोक्याचे संकेत: 30% पेक्षा जास्त अॅडव्हान्स मागणे, लेखी करार नाही, पोर्टफोलिओ नाही.\n✅ चांगले संकेत: तपशीलवार BOQ देतो, स्वतःची टीम आहे, वॉरंटी देतो.",
    vendors: "स्थानिक विक्रेत्यांकडून उत्तम दर:\n• सिमेंट/स्टील: घाऊक विक्रेते किंवा कंपनी डिपोतून थेट घ्या\n• विटा: स्थानिक विटभट्टीवरून थेट संपर्क करा\n• वाळू/मेटल: स्थानिक क्रशर किंवा PWD-मान्य पुरवठादार\n• फरशा: टाइल शोरूममध्ये मोठ्या ऑर्डरवर 10-20% सूट\n• पेंट: आशियान/बर्जर डीलरकडून 15-25% सूट\n• हार्डवेअर: स्थानिक हार्डवेअर बाजार 10-15% स्वस्त\n• 3-4 विक्रेत्यांची तुलना करा, GST बीजक घ्या आणि सौदा करा",
    help: "मी या विषयांमध्ये मदत करू शकतो:\n• 📊 बांधकाम खर्च आणि बजेट नियोजन\n• 🏗️ साहित्य आणि सध्याचे बाजारभाव\n• 👷 मजुरी दर आणि कंत्राटदार मार्गदर्शन\n• 🌿 वास्तु शास्त्र अनुपालन\n• ✏️ डिझाइन कल्पना आणि स्थापत्य शैली\n• ✅ प्रमाणित कंत्राटदार कसे शोधावेत\n• 🏪 स्थानिक विक्रेते\n• 🌱 पर्यावरणपूरक बांधकाम\n\nतुमचा बांधकाम प्रश्न विचारा!",
    default: "तुमच्या प्रश्नाबद्दल धन्यवाद! मी या विषयांमध्ये मदत करू शकतो:\n• खर्च अंदाज आणि बजेट नियोजन\n• बांधकाम साहित्य आणि सध्याचे दर\n• कामगार आणि कंत्राटदार दर\n• वास्तु शास्त्र मार्गदर्शन\n• डिझाइन कल्पना\n• प्रमाणित कंत्राटदार\n• स्थानिक विक्रेते\n\nकृपया तुमचा प्रश्न विचारा!",
  },
  ml: {
    cost: "ഇന്ത്യയിൽ നിർമ്മാണ ചെലവ് (പ്രതി ചതുരശ്ര അടി):\n• ബേസിക്: ₹1,200–1,600\n• സ്റ്റാൻഡേർഡ്: ₹1,600–2,200\n• പ്രീമിയം: ₹2,200–3,000\n\n1000 ചതുരശ്ര അടി വീടിന്: ബേസിക് ₹12–16 ലക്ഷം, സ്റ്റാൻഡേർഡ് ₹16–22 ലക്ഷം.\nമുംബൈ/ഡൽഹി ടയർ-2 നഗരങ്ങളേക്കാൾ 30–40% കൂടുതൽ ചെലവ്.",
    materials: "നിലവിലെ സാമഗ്രി വില (ഇന്ത്യ):\n• സിമന്റ് (OPC 53): ₹350–420/ബാഗ് (50kg)\n• TMT സ്റ്റീൽ: ₹55–68/കിലോ\n• ചുവന്ന ഇഷ്ടിക: ₹7–12 ഓരോന്നും\n• മണൽ: ₹50–80/ഘനഅടി\n• മെറ്റൽ (20mm): ₹40–60/ഘനഅടി\n• AAC ബ്ലോക്ക്: ₹45–55 ഓരോന്നും\n• ടൈൽസ്: ₹35–120/ചതുരശ്ര അടി",
    workforce: "തൊഴിലാളി നിരക്ക് (പ്രതിദിനം):\n• മേസ്ത്രി: ₹700–1,200\n• ഹെൽപ്പർ: ₹450–700\n• ആശാരി: ₹700–1,100\n• പ്ലംബർ: ₹600–1,000\n• ഇലക്ട്രീഷ്യൻ: ₹600–1,000\n• പെയിന്റർ: ₹500–800\n\nകോൺട്രാക്ടർ നിരക്ക്: ₹150–300/ചതുരശ്ര അടി (തൊഴിൽ മാത്രം).\n1000 ചതുരശ്ര അടിക്ക് തൊഴിൽ ചെലവ് ₹1.5–3 ലക്ഷം.",
    vastu: "പ്രധാന വാസ്തു തത്ത്വങ്ങൾ:\n• പ്രധാന വാതിൽ: കിഴക്ക് (ഏറ്റവും ശുഭ) അല്ലെങ്കിൽ വടക്ക്\n• അടുക്കള: തെക്ക്-കിഴക്ക് (അഗ്നി കോൺ)\n• മാസ്റ്റർ ബെഡ്‌റൂം: തെക്ക്-പടിഞ്ഞാറ്\n• പൂജാ മുറി: വടക്ക്-കിഴക്ക് (ഈശാന കോൺ)\n• ഗോവണി: തെക്ക്, പടിഞ്ഞാറ് അല്ലെങ്കിൽ തെക്ക്-പടിഞ്ഞാറ്\n• ജല സ്രോതസ്സ്: വടക്ക്-കിഴക്ക്\n• സെപ്റ്റിക് ടാങ്ക്: തെക്ക്-പടിഞ്ഞാറ്\n• വടക്ക്-കിഴക്കിലോ മധ്യത്തിലോ ടോയ്‌ലറ്റ് വേണ്ട\n\nവാസ്തു വിദഗ്ദ്ധനെ കൺസൾട്ട് ചെയ്യുക.",
    design: "ജനപ്രിയ ഭവന രൂപകൽപ്പന ശൈലികൾ:\n• ആധുനികം: വൃത്തിയുള്ള ലൈനുകൾ, വലിയ ജനാലകൾ, തുറന്ന ഫ്ലോർ പ്ലാൻ\n• പരമ്പരാഗത ഇന്ത്യൻ: ജാലി പണി, മുറ്റങ്ങൾ, മംഗലാപുരം ടൈൽ മേൽക്കൂര\n• മിനിമലിസ്റ്റ്: നിഷ്പക്ഷ നിറങ്ങൾ, കുറഞ്ഞ അലങ്കാരം\n• വാസ്തു അനുസൃതം: വാസ്തു പ്രകാരം മുറി ക്രമീകരണം\n• പരിസ്ഥിതി സൗഹൃദം: സോളാർ, മഴവെള്ള സംഭരണം, ഫ്ലൈ ആഷ് ഇഷ്ടിക\n\nകാലാവസ്ഥ, പ്ലോട്ട് വലുപ്പം (30x40, 60x40), ബഡ്ജറ്റ് എന്നിവ പരിഗണിക്കുക.",
    contractors: "വിശ്വസ്തരായ കോൺട്രാക്ടർമാരെ കണ്ടെത്താൻ:\n• പ്രാദേശിക ബിൽഡേഴ്സ് അസോസിയേഷൻ (CREDAI, BAI) പരിശോധിക്കുക\n• 3-5 സമീപകാല പ്രോജക്ട് റഫറൻസുകൾ ചോദിക്കുക, സൈറ്റ് സന്ദർശിക്കുക\n• ലൈസൻസ്, GST രജിസ്ട്രേഷൻ, PF/ESI, ഇൻഷുറൻസ് എന്നിവ പരിശോധിക്കുക\n• കുറഞ്ഞത് 3 വിശദമായ ഉദ്ധരണികൾ താരതമ്യം ചെയ്യുക\n• Housing.com, MagicBricks, Sulekha എന്നിവയിൽ പരിശോധിക്കുക\n\n⚠ അപകട സൂചന: 30% അഡ്വാൻസ് ആവശ്യപ്പെടുക, രേഖാമൂലമുള്ള കരാറില്ല, പോർട്ട്ഫോളിയോ ഇല്ല.\n✅ നല്ല സൂചന: വിശദമായ BOQ നൽകുന്നു, സ്വന്തം ടീം ഉണ്ട്, വാറന്റി നൽകുന്നു.",
    vendors: "പ്രാദേശിക വെണ്ടർമാരിൽ നിന്ന് മികച്ച വില നേടാൻ:\n• സിമന്റ്/സ്റ്റീൽ: മൊത്ത കച്ചവടക്കാർ അല്ലെങ്കിൽ കമ്പനി ഡിപ്പോയിൽ നിന്ന് നേരിട്ട്\n• ഇഷ്ടിക: പ്രാദേശിക ഇഷ്ടിക ഫാക്ടറിയിൽ നിന്ന് നേരിട്ട് (മധ്യസ്ഥരെ ഒഴിവാക്കുക)\n• മണൽ/ചരൽ: പ്രാദേശിക ക്രഷറിൽ നിന്ന്\n• ടൈലുകൾ: ടൈൽ ഷോറൂമിൽ ബൾക്ക് ഓർഡറിന് 10-20% കിഴിവ്\n• പെയിന്റ്: ആഷിയാൻ/ബെർജർ ഡീലറിൽ നിന്ന് നേരിട്ട് 15-25% കിഴിവ്\n• 3-4 വെണ്ടർമാരെ താരതമ്യം ചെയ്യുക, GST ഇൻവോയ്സ് വാങ്ങുക",
    help: "ഞാൻ ഇനിപ്പറയുന്നവയിൽ സഹായിക്കാം:\n• 📊 നിർമ്മാണ ചെലവ് & ബജറ്റ് ആസൂത്രണം\n• 🏗️ സാമഗ്രികൾ & നിലവിലെ വിലകൾ\n• 👷 തൊഴിൽ നിരക്കുകൾ & കോൺട്രാക്ടർ മാർഗനിർദ്ദേശം\n• 🌿 വാസ്തു ശാസ്ത്ര അനുപാലനം\n• ✏️ ഡിസൈൻ ആശയങ്ങൾ & ശൈലികൾ\n• ✅ വിശ്വസ്ത കോൺട്രാക്ടർമാരെ എങ്ങനെ കണ്ടെത്താം\n• 🏪 പ്രാദേശിക വെണ്ടർമാർ\n• 🌱 പരിസ്ഥിതി സൗഹൃദ നിർമ്മാണം\n\nനിങ്ങളുടെ നിർമ്മാണ ചോദ്യം ചോദിക്കൂ!",
    default: "നിങ്ങളുടെ ചോദ്യത്തിന് നന്ദി! ഞാൻ ഇവയിൽ കൃത്യമായ ഉപദേശം നൽകാം:\n• ചെലവ് കണക്കാക്കലും ബജറ്റ് ആസൂത്രണവും\n• നിർമ്മാണ സാമഗ്രികളും നിലവിലെ വിലകളും\n• തൊഴിലാളി, കോൺട്രാക്ടർ നിരക്കുകൾ\n• വാസ്തു ശാസ്ത്ര മാർഗ്ഗനിർദ്ദേശം\n• ഡിസൈൻ ആശയങ്ങൾ\n• വിശ്വസ്ത കോൺട്രാക്ടർമാർ\n• പ്രാദേശിക വെണ്ടർമാർ\n\nദയവായി നിങ്ങളുടെ ചോദ്യം ചോദിക്കൂ!",
  },
  ta: {
    cost: "இந்தியாவில் கட்டுமான செலவு (ஒரு சதுர அடிக்கு):\n• அடிப்படை: ₹1,200–1,600\n• நிலையான: ₹1,600–2,200\n• பிரீமியம்: ₹2,200–3,000\n\n1000 சதுர அடி வீட்டிற்கு: அடிப்படை ₹12–16 லட்சம், நிலையான ₹16–22 லட்சம்.\nமும்பை/டெல்லி டயர்-2 நகரங்களை விட 30–40% அதிக செலவு.",
    materials: "தற்போதைய பொருள் விலைகள் (இந்தியா):\n• சிமெண்ட் (OPC 53): ₹350–420/பை (50kg)\n• TMT எஃகு: ₹55–68/கிலோ\n• சிவப்பு செங்கல்: ₹7–12 ஒவ்வொன்று\n• மணல்: ₹50–80/கன அடி\n• சரளை (20mm): ₹40–60/கன அடி\n• AAC பிளாக்: ₹45–55 ஒவ்வொன்று\n• டைல்ஸ்: ₹35–120/சதுர அடி",
    workforce: "கூலி விகிதம் (தினசரி):\n• கொத்தனார்: ₹700–1,200\n• உதவியாளர்: ₹450–700\n• தச்சர்: ₹700–1,100\n• பிளம்பர்: ₹600–1,000\n• மின்சாரக்காரர்: ₹600–1,000\n• ஓவியர்: ₹500–800\n\nஒப்பந்தக்காரர் விகிதம்: ₹150–300/சதுர அடி (கூலி மட்டும்).\n1000 சதுர அடிக்கு கூலி செலவு ₹1.5–3 லட்சம்.",
    vastu: "முக்கிய வாஸ்து கொள்கைகள்:\n• பிரதான வாசல்: கிழக்கு (மிகவும் சுபம்) அல்லது வடக்கு\n• சமையலறை: தென்கிழக்கு மூலை (அக்னி கோணம்)\n• தலை படுக்கையறை: தென்மேற்கு\n• பூஜை அறை: வடகிழக்கு (ஈசான்ய கோணம்)\n• படிக்கட்டு: தெற்கு, மேற்கு அல்லது தென்மேற்கு\n• நீர் ஆதாரம்: வடகிழக்கு\n• கழிவுநீர் தொட்டி: தென்மேற்கு அல்லது மேற்கு\n• வடகிழக்கு, மையம் அல்லது பூஜை அறை அருகில் கழிவறை வேண்டாம்\n\nதிட்டத்தை இறுதி செய்வதற்கு முன் வாஸ்து நிபுணரை அணுகவும்.",
    design: "பிரபலமான வீட்டு வடிவமைப்பு பாணிகள்:\n• சமகால: சுத்தமான கோடுகள், பெரிய ஜன்னல்கள், திறந்த தள அமைப்பு\n• பாரம்பரிய இந்திய: ஜாலி வேலை, முற்றங்கள், மங்களூர் ஓடு கூரை\n• நவீன மினிமலிஸ்ட்: நடுநிலை வண்ணங்கள், குறைந்த அலங்காரம்\n• வாஸ்து இணக்கம்: வாஸ்து படி அறை அமைப்பு\n• சூழல் நட்பு: சோலார், மழைநீர் சேகரிப்பு, ஃபிளை ஆஷ் செங்கல்\n\nகாலநிலை, மனை அளவு (30x40, 60x40), பட்ஜெட் ஆகியவற்றை கருத்தில் கொள்ளுங்கள்.",
    contractors: "சரிபார்க்கப்பட்ட ஒப்பந்தக்காரர்களை கண்டுபிடிப்பது:\n• உள்ளூர் பில்டர்ஸ் அசோசியேஷன் (CREDAI, BAI) பார்க்கவும்\n• 3-5 சமீபத்திய திட்ட குறிப்புகளை கேட்கவும், தளத்தை பார்வையிடவும்\n• உரிமம், GST பதிவு, PF/ESI, காப்பீடு ஆகியவற்றை சரிபார்க்கவும்\n• குறைந்தது 3 விரிவான மேற்கோள்களை ஒப்பிடவும்\n• Housing.com, MagicBricks, Sulekha இல் சரிபார்க்கவும்\n\n⚠ எச்சரிக்கை: 30% முன்பணம் கேட்பது, எழுத்து ஒப்பந்தம் இல்லை, போர்ட்ஃபோலியோ இல்லை.\n✅ நல்ல அறிகுறி: விரிவான BOQ தருகிறார், சொந்த குழு உள்ளது, உத்தரவாதம் தருகிறார்.",
    vendors: "உள்ளூர் விற்பனையாளர்களிடம் சிறந்த விலை பெற:\n• சிமெண்ட்/எஃகு: மொத்த வியாபாரிகள் அல்லது கம்பெனி டிப்போவிலிருந்து நேரடியாக\n• செங்கல்: உள்ளூர் செங்கல் சூளைகளிலிருந்து நேரடியாக (இடைத்தரகர்களை தவிர்க்கவும்)\n• மணல்/சரளை: உள்ளூர் கிரஷர் அல்லது PWD அனுமதி பெற்ற சப்ளையர்கள்\n• ஓடுகள்: ஓடு காட்சியகங்களில் மொத்த ஆர்டருக்கு 10-20% தள்ளுபடி\n• பெயிண்ட்: ஆசியன்/பெர்ஜர் டீலரிடம் நேரடியாக 15-25% தள்ளுபடி\n• 3-4 விற்பனையாளர்களை ஒப்பிட்டு, GST இன்வாய்ஸ் வாங்கவும், பேரம் பேசவும்",
    help: "நான் இந்த தலைப்புகளில் உதவ முடியும்:\n• 📊 கட்டுமான செலவு & பட்ஜெட் திட்டமிடல்\n• 🏗️ பொருட்கள் & தற்போதைய விலைகள்\n• 👷 கூலி விகிதங்கள் & ஒப்பந்தக்காரர் வழிகாட்டுதல்\n• 🌿 வாஸ்து சாஸ்திர இணக்கம்\n• ✏️ வடிவமைப்பு யோசனைகள் & பாணிகள்\n• ✅ சரிபார்க்கப்பட்ட ஒப்பந்தக்காரர்களை எவ்வாறு கண்டுபிடிப்பது\n• 🏪 உள்ளூர் விற்பனையாளர்கள்\n• 🌱 சூழல் நட்பு கட்டுமானம்\n\nஉங்கள் கட்டுமான கேள்வியை கேளுங்கள்!",
    default: "உங்கள் கேள்விக்கு நன்றி! நான் இவற்றில் துல்லியமான ஆலோசனை வழங்க முடியும்:\n• செலவு மதிப்பீடு & பட்ஜெட் திட்டமிடல்\n• கட்டுமான பொருட்கள் & தற்போதைய விலைகள்\n• கூலி & ஒப்பந்தக்காரர் விகிதங்கள்\n• வாஸ்து சாஸ்திர வழிகாட்டுதல்\n• வடிவமைப்பு யோசனைகள்\n• சரிபார்க்கப்பட்ட ஒப்பந்தக்காரர்கள்\n• உள்ளூர் விற்பனையாளர்கள்\n\nஉங்கள் கட்டுமான கேள்வியை கேளுங்கள்!",
  },
  te: {
    cost: "భారతదేశంలో నిర్మాణ ఖర్చు (చదరపు అడుగుకు):\n• బేసిక్: ₹1,200–1,600\n• స్టాండర్డ్: ₹1,600–2,200\n• ప్రీమియం: ₹2,200–3,000\n\n1000 చదరపు అడుగుల ఇంటికి: బేసిక్ ₹12–16 లక్షలు, స్టాండర్డ్ ₹16–22 లక్షలు.\nముంబై/ఢిల్లీ టయర్-2 నగరాల కంటే 30–40% అధిక ఖర్చు.",
    materials: "ప్రస్తుత సామగ్రి ధరలు (భారతదేశం):\n• సిమెంట్ (OPC 53): ₹350–420/బ్యాగ్ (50kg)\n• TMT స్టీల్: ₹55–68/కిలో\n• ఎర్ర ఇటుక: ₹7–12 ఒక్కొక్కటి\n• ఇసుక: ₹50–80/క్యూబిక్ అడుగు\n• మెటల్ (20mm): ₹40–60/క్యూబిక్ అడుగు\n• AAC బ్లాక్: ₹45–55 ఒక్కొక్కటి\n• టైల్స్: ₹35–120/చదరపు అడుగు",
    workforce: "కూలీ రేటు (రోజుకు):\n• మేస్త్రి: ₹700–1,200\n• హెల్పర్: ₹450–700\n• వడ్రంగి: ₹700–1,100\n• ప్లంబర్: ₹600–1,000\n• ఎలక్ట్రీషియన్: ₹600–1,000\n• పెయింటర్: ₹500–800\n\nకాంట్రాక్టర్ రేటు: ₹150–300/చదరపు అడుగు (కూలీ మాత్రమే).\n1000 చదరపు అడుగులకు కూలీ ఖర్చు ₹1.5–3 లక్షలు.",
    vastu: "ముఖ్యమైన వాస్తు సూత్రాలు:\n• ప్రధాన తలుపు: తూర్పు (అత్యంత శుభకరం) లేదా ఉత్తరం\n• వంటగది: ఆగ్నేయ మూల (అగ్ని కోణం)\n• మాస్టర్ బెడ్ రూమ్: నైరుతి\n• పూజ గది: ఈశాన్యం (ఈశాన్య కోణం)\n• మెట్లు: దక్షిణం, పశ్చిమం లేదా నైరుతి\n• నీటి ట్యాంక్: ఈశాన్యం\n• సెప్టిక్ ట్యాంక్: నైరుతి లేదా పశ్చిమం\n• ఈశాన్యం, మధ్య లేదా పూజ గది దగ్గర మరుగుదొడ్డి వద్దు\n\nప్రణాళిక ఖరారు చేసే ముందు వాస్తు నిపుణుడిని సంప్రదించండి.",
    design: "ప్రసిద్ధ ఇల్లు డిజైన్ శైలులు:\n• సమకాలీన: శుభ్రమైన లైన్లు, పెద్ద కిటికీలు, ఓపెన్ ఫ్లోర్ ప్లాన్\n• సాంప్రదాయ భారతీయ: జాలీ పని, ఆవరణలు, మంగళూరు టైల్ పైకప్పు\n• ఆధునిక మినిమలిస్ట్: తటస్థ రంగులు, కనీస అలంకరణ\n• వాస్తు అనుసారం: వాస్తు ప్రకారం గది అమరిక\n• పర్యావరణ స్నేహపూర్వక: సోలార్, వర్షపు నీటి సేకరణ, ఫ్లై యాష్ ఇటుక\n\nవాతావరణం, ప్లాట్ సైజు (30x40, 60x40), బడ్జెట్ పరిగణించండి.",
    contractors: "ధృవీకరించబడిన కాంట్రాక్టర్లను కనుగొనడం:\n• స్థానిక బిల్డర్స్ అసోసియేషన్ (CREDAI, BAI) తనిఖీ చేయండి\n• 3-5 ఇటీవలి ప్రాజెక్ట్ రిఫరెన్స్‌లు అడగండి, సైట్ సందర్శించండి\n• లైసెన్స్, GST రిజిస్ట్రేషన్, PF/ESI, బీమా తనిఖీ చేయండి\n• కనీసం 3 వివరణాత్మక కోటేషన్లు పోల్చండి\n• Housing.com, MagicBricks, Sulekha లో తనిఖీ చేయండి\n\n⚠ హెచ్చరిక: 30% ముందస్తు డిమాండ్, లిఖిత ఒప్పందం లేదు, పోర్ట్ఫోలియో లేదు.\n✅ మంచి సంకేతం: వివరణాత్మక BOQ ఇస్తాడు, స్వంత టీమ్ ఉంది, వారంటీ ఇస్తాడు.",
    vendors: "స్థానిక విక్రేతల నుండి ఉత్తమ ధర పొందడం:\n• సిమెంట్/స్టీల్: హోల్సేల్ డీలర్లు లేదా కంపెనీ డిపో నుండి నేరుగా\n• ఇటుక: స్థానిక ఇటుక కొలిమి నుండి నేరుగా (మధ్యవర్తులను నివారించండి)\n• ఇసుక/మెటల్: స్థానిక క్రషర్ లేదా PWD-ఆమోదిత సరఫరాదారులు\n• టైల్స్: టైల్ షోరూమ్‌లలో బల్క్ ఆర్డర్‌కు 10-20% తగ్గింపు\n• పెయింట్: ఆసియన్/బెర్జర్ డీలర్ నుండి నేరుగా 15-25% తగ్గింపు\n• 3-4 విక్రేతలను పోల్చండి, GST ఇన్‌వాయిస్ తీసుకోండి, బేరం చేయండి",
    help: "నేను ఈ విషయాలలో సహాయపడగలను:\n• 📊 నిర్మాణ ఖర్చు & బడ్జెట్ ప్రణాళిక\n• 🏗️ సామగ్రి & ప్రస్తుత మార్కెట్ ధరలు\n• 👷 కూలీ రేట్లు & కాంట్రాక్టర్ మార్గదర్శకత్వం\n• 🌿 వాస్తు శాస్త్ర అనుగుణత\n• ✏️ డిజైన్ ఆలోచనలు & శైలులు\n• ✅ ధృవీకరించబడిన కాంట్రాక్టర్లను ఎలా కనుగొనాలి\n• 🏪 స్థానిక విక్రేతలు\n• 🌱 పర్యావరణ అనుకూల నిర్మాణం\n\nమీ నిర్మాణ ప్రశ్న అడగండి!",
    default: "మీ ప్రశ్నకు ధన్యవాదాలు! నేను ఈ విషయాలలో ఖచ్చితమైన సలహా ఇవ్వగలను:\n• ఖర్చు అంచనా & బడ్జెట్ ప్రణాళిక\n• నిర్మాణ సామగ్రి & ప్రస్తుత ధరలు\n• కూలీ & కాంట్రాక్టర్ రేట్లు\n• వాస్తు శాస్త్ర మార్గదర్శకత్వం\n• డిజైన్ ఆలోచనలు\n• ధృవీకరించబడిన కాంట్రాక్టర్లు\n• స్థానిక విక్రేతలు\n\nమీ నిర్మాణ ప్రశ్న అడగండి!",
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
  const [isVoiceMuted, setIsVoiceMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Use a ref to always have access to the latest language without stale closures
  const selectedLanguageRef = useRef(selectedLanguage)
  useEffect(() => { selectedLanguageRef.current = selectedLanguage }, [selectedLanguage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getLangResponse = (key: ResponseKey, lang: string): string =>
    (aiResponsesByLang[lang] ?? aiResponsesByLang.en)[key]

  const detectKey = (text: string): ResponseKey => {
    const t = text.toLowerCase()
    if (t.includes("cost") || t.includes("price") || t.includes("budget") || t.includes("estimate") ||
        t.includes("lakh") || t.includes("rupee") || t.includes("₹") ||
        t.includes("chelav") || t.includes("vilai") || t.includes("baj") ||
        t.includes("लागत") || t.includes("बजट") || t.includes("कीमत") ||
        t.includes("खर्च") || t.includes("बजेट") || t.includes("किंमत") ||
        t.includes("செலவ") || t.includes("விலை") || t.includes("பட்ஜெட்") ||
        t.includes("ఖర్చ") || t.includes("ధర") || t.includes("బడ్జెట్") ||
        t.includes("ചെലവ") || t.includes("വില") || t.includes("ബജ"))
      return "cost"
    if (t.includes("material") || t.includes("cement") || t.includes("steel") || t.includes("brick") ||
        t.includes("sand") || t.includes("iron") || t.includes("tile") || t.includes("aggregate") ||
        t.includes("sāmag") || t.includes("sima") || t.includes("ishṭ") ||
        t.includes("सामग") || t.includes("सीमेंट") || t.includes("ईंट") ||
        t.includes("साहित्य") || t.includes("सिमेंट") || t.includes("वीट") ||
        t.includes("பொருட்") || t.includes("சிமெண்") || t.includes("செங்க") ||
        t.includes("సామగ్రి") || t.includes("సిమెంట్") || t.includes("ఇటుక") ||
        t.includes("സാമഗ്") || t.includes("സിമ") || t.includes("ഇഷ്ട"))
      return "materials"
    if (t.includes("worker") || t.includes("labour") || t.includes("labor") || t.includes("mason") ||
        t.includes("workforce") || t.includes("helper") || t.includes("carpenter") || t.includes("plumber") ||
        t.includes("electrician") || t.includes("painter") ||
        t.includes("కూలీ") || t.includes("കൂലി") ||
        t.includes("मजदूर") || t.includes("मजूर") || t.includes("कार्मिक") ||
        t.includes("मजूर") || t.includes("कामगार") ||
        t.includes("தொழிலாள") || t.includes("കൂലി") ||
        t.includes("maistri") || t.includes("majdoor"))
      return "workforce"
    if (t.includes("vastu") || t.includes("vaastu") || t.includes("vāstu") ||
        t.includes("വാസ്") || t.includes("वास्तु") || t.includes("વાસ્તુ") ||
        t.includes("வாஸ்து") || t.includes("వాస్తు") ||
        t.includes("vaastu") || t.includes("vasthu"))
      return "vastu"
    if (t.includes("design") || t.includes("floor plan") || t.includes("elevation") ||
        t.includes("modern") || t.includes("contemporary") || t.includes("traditional") ||
        t.includes("architecture") || t.includes("style") || t.includes("layout") ||
        t.includes("ഡിസൈന") || t.includes("डिज़ाइन") || t.includes("डिझाइन") ||
        t.includes("विन्यास") || t.includes("रचना") ||
        t.includes("டிசைன்") || t.includes("வடிவமைப்ப") || t.includes("డిజైన్"))
      return "design"
    if (t.includes("contractor") || t.includes("builder") || t.includes("verified") ||
        t.includes("credai") || t.includes("bai") || t.includes("licence") || t.includes("license") ||
        t.includes("ഗുത്ത") || t.includes("ठेकेदार") || t.includes("ઠેકેદાર") ||
        t.includes("गुत्त") || t.includes("कंत्राट") ||
        t.includes("ஒப்பந்த") || t.includes("காந்திராக்") || t.includes("కాంట్రాక్ట") ||
        t.includes("building contractor"))
      return "contractors"
    if (t.includes("vendor") || t.includes("supplier") || t.includes("shop") || t.includes("market") ||
        t.includes("buy") || t.includes("purchase") || t.includes("wholesale") ||
        t.includes("വെണ്ട") || t.includes("विक्रे") || t.includes("मार्केट") ||
        t.includes("विक्रे") || t.includes("बाजार") ||
        t.includes("விற்ப") || t.includes("విక్ర") ||
        t.includes("dealer") || t.includes("store"))
      return "vendors"
    if (t.includes("help") || t.includes("what can") || t.includes("assist") || t.includes("capabilities") ||
        t.includes("what do you") || t.includes("can you") ||
        t.includes("സഹായ") || t.includes("सहाय") || t.includes("സഹായ") ||
        t.includes("உதவ") || t.includes("సహాయ"))
      return "help"
    return "default"
  }

  // Helper to find best matching SpeechSynthesis voice for a language
  const findBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null
    const voices = window.speechSynthesis.getVoices()
    
    // Try exact match first (e.g., "ml-IN" for Malayalam India)
    const exactLang = speechLangMap[lang] ?? "en-IN"
    let match = voices.find(v => v.lang === exactLang)
    if (match) return match

    // Try partial match (e.g., "ml" for Malayalam any region)
    const langPrefix = exactLang.split("-")[0]
    match = voices.find(v => v.lang.startsWith(langPrefix))
    if (match) return match

    // For Indian languages, try finding any Indian English voice as fallback
    if (lang !== "en") {
      match = voices.find(v => v.lang === "en-IN")
      if (match) return match
    }

    return null
  }, [])

  /**
   * Speak a given text in the specified language.
   * Attempts to find a matching native voice for the language.
   */
  const speakText = useCallback((text: string, lang: string, messageId?: string): SpeechSynthesisUtterance | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null
    // Cancel any previous speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    const langCode = speechLangMap[lang] ?? "en-IN"
    utterance.lang = langCode
    utterance.rate = 0.85
    utterance.pitch = 1.0

    // Try to find a matching native voice
    const voice = findBestVoice(lang)
    if (voice) {
      utterance.voice = voice
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
      if (messageId) setCurrentlySpeakingId(messageId)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      if (messageId) setCurrentlySpeakingId(null)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      if (messageId) setCurrentlySpeakingId(null)
    }
    window.speechSynthesis.speak(utterance)
    return utterance
  }, [findBestVoice])

  /**
   * Speak a specific message (for the speaker icon / replay button).
   */
  const speakMessage = useCallback((text: string, lang: string | undefined, messageId: string) => {
    if (isVoiceMuted) return
    speakText(text, lang ?? "en", messageId)
  }, [isVoiceMuted, speakText])

  /**
   * Stop speaking (mute).
   */
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentlySpeakingId(null)
  }, [])

  // Character ranges for Indian scripts
  const hasDevanagari = (text: string): boolean => /[\u0900-\u097F]/.test(text)
  const hasMalayalam = (text: string): boolean => /[\u0D00-\u0D7F]/.test(text)
  const hasTamil = (text: string): boolean => /[\u0B80-\u0BFF]/.test(text)
  const hasTelugu = (text: string): boolean => /[\u0C00-\u0C7F]/.test(text)

  // Detect if text has ANY Latin/English letters (used to catch transliteration)
  const hasLatinLetters = (text: string): boolean => /[a-zA-Z]/.test(text)

  // Check if response text matches the expected language script
  // Returns false if the text contains Latin alphabet letters (transliteration) or wrong script
  const textMatchesLanguage = (text: string, lang: string): boolean => {
    if (lang === "en") return true
    // Remove numbers, symbols, whitespace for script checking
    const cleaned = text.replace(/[0-9\s₹.,\-:%•\/()\[\]@#$^&*+={}|;:'"<>,?\/~`_\n₹₹%•°₹()]/g, "").trim()
    if (!cleaned) return true // Only numbers/symbols - accept as-is
    
    // CRITICAL: If ANY Latin letters exist and language is not English, reject
    // This catches Manglish, Tanglish, Hinglish, etc.
    if (hasLatinLetters(cleaned)) return false
    
    // Check that the correct native script characters are present
    switch (lang) {
      case "hi":
      case "mr":
        return hasDevanagari(cleaned)
      case "ml":
        return hasMalayalam(cleaned)
      case "ta":
        return hasTamil(cleaned)
      case "te":
        return hasTelugu(cleaned)
      default:
        return true
    }
  }

  // Validate if transcribed text matches the expected language script
  const textMatchesScript = (text: string, lang: string): boolean => {
    if (lang === "en") return true
    const cleaned = text.replace(/[\s\d₹.,\-:%•\/()\[\]@#$^&*+={}|;:'"<>,?\/~`_\n]/g, "").trim()
    if (!cleaned) return true
    
    // If Latin letters found in non-English, reject
    if (hasLatinLetters(cleaned)) return false
    
    switch (lang) {
      case "hi":
      case "mr":
        return /[\u0900-\u097F]/.test(cleaned)
      case "ml":
        return /[\u0D00-\u0D7F]/.test(cleaned)
      case "ta":
        return /[\u0B80-\u0BFF]/.test(cleaned)
      case "te":
        return /[\u0C00-\u0C7F]/.test(cleaned)
      default:
        return true
    }
  }

  const sendAIReply = useCallback(async (userText: string, lang: string) => {
    let responseText: string
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, lang }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      responseText = data.reply
      if (!responseText) throw new Error("empty")
      // Verify response matches expected language script - if not, use fallback
      if (!textMatchesLanguage(responseText, lang)) {
        console.warn(`API response language mismatch for ${lang}, using fallback`)
        throw new Error("language mismatch")
      }
    } catch {
      const key = detectKey(userText)
      responseText = getLangResponse(key, lang)
    }
    const newId = Date.now().toString()
    setMessages((prev) => [...prev, {
      id: newId,
      type: "ai",
      content: responseText,
      timestamp: new Date(),
      language: lang,
    }])
    setIsTyping(false)
    // Auto-speak new messages if not muted
    if (!isVoiceMuted) {
      speakText(responseText, lang, newId)
    }
  }, [isVoiceMuted, speakText])

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return
    const lang = selectedLanguageRef.current
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
  }, [inputMessage, sendAIReply])

  const handleQuickAction = useCallback((key: string) => {
    const lang = selectedLanguageRef.current
    const action = quickActions.find(a => a.key === key)
    const userText = action?.label || key
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content: userText,
      timestamp: new Date(),
    }])
    setIsTyping(true)
    sendAIReply(userText, lang)
  }, [sendAIReply])

  /**
   * Toggle global mute/unmute for voice output.
   */
  const toggleMute = useCallback(() => {
    if (isVoiceMuted) {
      setIsVoiceMuted(false)
    } else {
      // Mute: stop any ongoing speech
      stopSpeaking()
      setIsVoiceMuted(true)
    }
  }, [isVoiceMuted, stopSpeaking])

  // Check if browser supports SpeechRecognition
  const isSpeechRecognitionSupported = (): boolean => {
    if (typeof window === "undefined") return false
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    return !!SpeechRecognition
  }

  // Direct browser Speech Recognition - primary voice input method
  // Works on Chrome mobile, Chrome desktop, Edge, Safari
  const startVoiceInput = useCallback(async () => {
    console.log("[VoiceInput] Starting voice input...")
    
    // Check browser support first
    if (!isSpeechRecognitionSupported()) {
      console.error("[VoiceInput] SpeechRecognition not supported in this browser")
      setError("Voice input is not supported on this browser. Please use text input instead.")
      return
    }

    try {
      // Request microphone permission explicitly
      console.log("[VoiceInput] Requesting microphone permission...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Immediately stop the stream - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      console.log("[VoiceInput] Microphone permission granted")
    } catch (permErr) {
      console.error("[VoiceInput] Microphone permission denied:", permErr)
      setError("Microphone access is required for voice input. Please allow microphone access in your browser settings and try again.")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Set language from selected dropdown
    const lang = selectedLanguageRef.current
    const langCode = speechLangMap[lang] ?? "en-IN"
    recognition.lang = langCode
    console.log(`[VoiceInput] Language set to: ${langCode}`)
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log("[VoiceInput] Speech recognition started - speak now")
      setIsListening(true)
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("[VoiceInput] Recognized text:", transcript)
      setIsListening(false)
      setIsRecording(false)
      
      if (transcript && transcript.trim()) {
        // Add user message
        const lang = selectedLanguageRef.current
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          type: "user",
          content: transcript,
          timestamp: new Date(),
        }])
        // Trigger AI reply
        setIsTyping(true)
        sendAIReply(transcript, lang)
      } else {
        console.log("[VoiceInput] No speech detected")
      }
    }

    recognition.onerror = (event: any) => {
      console.error("[VoiceInput] Speech recognition error:", event.error)
      setIsListening(false)
      setIsRecording(false)
      
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          setError("Microphone access denied. Please allow microphone access in your browser settings.")
          break
        case "no-speech":
          setError("No speech detected. Please speak clearly and try again.")
          break
        case "audio-capture":
          setError("No microphone found. Please connect a microphone.")
          break
        case "network":
          setError("Network error occurred. Please check your connection and try again.")
          break
        case "aborted":
          console.log("[VoiceInput] Speech recognition aborted")
          break
        default:
          setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      console.log("[VoiceInput] Speech recognition ended")
      setIsListening(false)
      setIsRecording(false)
    }

    try {
      recognition.start()
      console.log("[VoiceInput] recognition.start() called successfully")
    } catch (startErr) {
      console.error("[VoiceInput] Failed to start recognition:", startErr)
      setIsListening(false)
      setIsRecording(false)
      setError("Failed to start voice input. Please try again.")
    }
  }, [sendAIReply])

  // File upload for audio
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("lang", selectedLanguageRef.current)

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Transcription failed")

      const data = await res.json()
      if (data.text && data.text.trim()) {
        setInputMessage(data.text)
      }
    } catch {
      // silent
    } finally {
      setIsTranscribing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

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
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? "h-14" : "h-[650px]"} w-[400px]`}>
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
              {/* Voice mute/unmute toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                title={isVoiceMuted ? "Unmute voice" : "Mute voice"}
                className={isVoiceMuted ? "text-muted-foreground" : "text-primary"}
              >
                {isVoiceMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
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
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-transparent px-2"
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
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === "ai" && <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <div className="flex items-center justify-between mt-1 gap-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {message.type === "ai" && (
                              <div className="flex items-center gap-1">
                                {/* Speaker / Replay button per message */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 opacity-70 hover:opacity-100"
                                  onClick={() => {
                                    if (currentlySpeakingId === message.id) {
                                      stopSpeaking()
                                    } else {
                                      speakMessage(message.content, message.language, message.id)
                                    }
                                  }}
                                  title={
                                    currentlySpeakingId === message.id
                                      ? "Stop"
                                      : "Play response aloud"
                                  }
                                >
                                  {currentlySpeakingId === message.id ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Volume2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
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
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="pr-10"
                  />
                </div>
                <Button
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? () => { setIsRecording(false); setIsListening(false); } : startVoiceInput}
                  title={isRecording ? "Stop recording" : "Record voice"}
                  disabled={!isSpeechRecognitionSupported() && !isRecording}
                  className="gap-1"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button size="sm" onClick={handleSendMessage} disabled={!inputMessage.trim() || isTranscribing}>
                  Send
                </Button>
              </div>
              {isRecording && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  Listening... (speak now, or click mic to stop)
                </div>
              )}
              {isTranscribing && (
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-500">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  Transcribing audio...
                </div>
              )}
              {isListening && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-500">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  Listening... (speak now)
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}