import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

// Language name map for system prompt
const langNameMap: Record<string, string> = {
  en: "English (use Latin script)",
  hi: "Hindi ONLY in Devanagari script (देवनागरी लिपि). Example: 'सीमेंट की कीमत ₹350-400 प्रति बैग है'",
  mr: "Marathi ONLY in Devanagari script (देवनागरी लिपि). Example: 'सिमेंटची किंमत ₹350-400 प्रति पिशवी'",
  ml: "Malayalam ONLY in Malayalam script (മലയാളം ലിപി). Example: 'സിമന്റിന്റെ വില ₹350-400 ബാഗിന്'",
  ta: "Tamil ONLY in Tamil script (தமிழ் எழுத்து). Example: 'சிமெண்ட் விலை ₹350-400 ஒரு பை'",
  te: "Telugu ONLY in Telugu script (తెలుగు లిపి). Example: 'సిమెంట్ ధర ₹350-400 బ్యాగుకు'",
}

// Description for each language
const langDescriptionMap: Record<string, string> = {
  en: "English",
  hi: "Hindi in Devanagari script (हिन्दी)",
  mr: "Marathi in Devanagari script (मराठी)",
  ml: "Malayalam in Malayalam script (മലയാളം)",
  ta: "Tamil in Tamil script (தமிழ்)",
  te: "Telugu in Telugu script (తెలుగు)",
}

// Domain rejection messages per language (when query is not construction-related)
const domainRejectionMessages: Record<string, string> = {
  en: "Sorry, I can only answer construction-related questions. Please ask about house construction, building materials, costs, design, Vastu, contractors, or other construction topics.",
  hi: "क्षमा करें, मैं केवल निर्माण संबंधी प्रश्नों का उत्तर दे सकता हूँ। कृपया घर निर्माण, सामग्री, लागत, डिज़ाइन, वास्तु, ठेकेदार या अन्य निर्माण विषयों पर पूछें।",
  mr: "क्षमस्व, मी फक्त बांधकामाशी संबंधित प्रश्नांची उत्तरे देऊ शकतो. कृपया घर बांधकाम, साहित्य, खर्च, डिझाइन, वास्तु, कंत्राटदार किंवा इतर बांधकाम विषयांवर विचारा.",
  ml: "ക്ഷമിക്കണം, ഞാൻ നിർമ്മാണവുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾക്ക് മാത്രമേ ഉത്തരം നൽകാനാകൂ. ദയവായി വീട് നിർമ്മാണം, സാമഗ്രികൾ, ചെലവ്, ഡിസൈൻ, വാസ്തു, കോൺട്രാക്ടർമാർ എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ.",
  ta: "மன்னிக்கவும், கட்டுமானம் தொடர்பான கேள்விகளுக்கு மட்டுமே நான் பதிலளிக்க முடியும். தயவுசெய்து வீடு கட்டுதல், பொருட்கள், செலவு, வடிவமைப்பு, வாஸ்து, ஒப்பந்தக்காரர்கள் பற்றி கேளுங்கள்.",
  te: "క్షమించండి, నేను నిర్మాణానికి సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను. దయచేసి ఇల్లు నిర్మాణం, సామగ్రి, ఖర్చు, డిజైన్, వాస్తు, కాంట్రాక్టర్ల గురించి అడగండి.",
}

// Construction-related keywords for domain validation
const constructionKeywords = [
  // English
  "construction", "building", "house", "home", "villa", "apartment", "flat", "floor", "roof", "wall",
  "cement", "concrete", "brick", "block", "sand", "aggregate", "steel", "tmt", "iron", "rod", "rebar",
  "tile", "marble", "granite", "paint", "plaster", "putty", "primer", "pipe", "pvc", "fitting",
  "wire", "cable", "switch", "socket", "panel", "circuit", "plumbing", "electrical", "sanitary",
  "cost", "estimate", "budget", "price", "rate", "sq ft", "square foot", "square feet", "lakh", "crore",
  "rupee", "₹", "material", "labour", "labor", "mason", "carpenter", "plumber", "electrician",
  "painter", "welder", "helper", "worker", "workforce", "contractor", "builder", "engineer",
  "architect", "design", "layout", "plan", "blueprint", "elevation", "section", "drawing",
  "vastu", "vaastu", "vasthu", "direction", "east", "west", "north", "south", "orientation",
  "foundation", "column", "beam", "slab", "staircase", "stair", "balcony", "terrace", "garden",
  "kitchen", "bedroom", "bathroom", "living room", "dining", "pooja", "puja", "store", "parking",
  "window", "door", "frame", "glass", "aluminium", "wood", "plywood", "laminates", "hardware",
  "permission", "approval", "license", "licence", "nagar nigam", "municipal", "corporation",
  "eco", "green", "solar", "rainwater", "septic", "drainage", "sewage", "water tank",
  "renovation", "repair", "extension", "modification", "interior", "exterior", "furniture",
  "safety", "helmet", "scaffold", "scaffolding", "shuttering", "centering",
  // Hindi
  "निर्माण", "भवन", "मकान", "घर", "सीमेंट", "ईंट", "रेत", "स्टील", "लोहा", "सरिया",
  "टाइल", "पेंट", "प्लास्टर", "पाइप", "तार", "स्विच", "सॉकेट", "बिजली", "नलसाजी",
  "लागत", "बजट", "कीमत", "दर", "वर्ग फुट", "लाख", "करोड़", "मजदूर", "राजमिस्त्री",
  "बढ़ई", "प्लंबर", "इलेक्ट्रीशियन", "पेंटर", "ठेकेदार", "वास्तु", "डिज़ाइन", "नक्शा",
  "नींव", "कॉलम", "बीम", "स्लैब", "सीढ़ी", "रसोई", "बेडरूम", "बाथरूम", "खिड़की", "दरवाजा",
  // Marathi
  "बांधकाम", "इमारत", "सिमेंट", "वीट", "स्टील", "लोखंड", "लागत", "अंदाज", "बजेट", "किंमत",
  "मजूर", "ठेकेदार", "वास्तु", "रचना", "आराखडा", "स्वयंपाकघर", "स्नानगृह", "खिडकी", "दरवाजा",
  // Malayalam
  "നിർമ്മാണം", "കെട്ടിടം", "വീട്", "സിമന്റ്", "ഇഷ്ടിക", "മണൽ", "സ്റ്റീൽ", "ചെലവ്", "എസ്റ്റിമേറ്റ്",
  "ബജറ്റ്", "വില", "തൊഴിലാളി", "കോൺട്രാക്ടർ", "വാസ്തു", "ഡിസൈൻ", "പ്ലാൻ", "അടുക്കള", "കുളിമുറി",
  // Tamil
  "கட்டுமானம்", "கட்டிடம்", "வீடு", "சிமெண்ட்", "செங்கல்", "மணல்", "எஃகு", "செலவு", "மதிப்பீடு",
  "பட்ஜெட்", "விலை", "தொழிலாளி", "ஒப்பந்தக்காரர்", "வாஸ்து", "வடிவமைப்பு", "திட்டம்", "சமையலறை",
  // Telugu
  "నిర్మాణం", "భవనం", "ఇల్లు", "సిమెంట్", "ఇటుక", "ఇసుక", "స్టీల్", "ఖర్చు", "అంచనా",
  "బడ్జెట్", "ధర", "కూలీ", "కాంట్రాక్టర్", "వాస్తు", "డిజైన్", "ప్లాన్", "వంటగది", "బాత్రూమ్",
]

// Check if a message is construction-related
function isConstructionRelated(message: string): boolean {
  const lower = message.toLowerCase().trim()
  if (!lower) return false

  // Check against construction keywords
  for (const keyword of constructionKeywords) {
    if (lower.includes(keyword.toLowerCase())) {
      return true
    }
  }

  return false
}

// Fallback responses per language for when Groq is unavailable
const fallbacks: Record<string, Record<string, string>> = {
  en: {
    cost: "Construction costs in India (per sq ft):\n• Basic: ₹1,200–1,600\n• Standard: ₹1,600–2,200\n• Premium: ₹2,200–3,000\n• Luxury: ₹3,000+\n\nFor 1000 sq ft: Basic ₹12–16L, Standard ₹16–22L, Premium ₹22–30L.\nMumbai/Delhi cost 30–40% more than tier-2 cities.",
    materials: "Current material prices (India):\n• Cement (OPC 53): ₹350–420/bag (50kg)\n• TMT Steel: ₹55–68/kg\n• Red Bricks: ₹7–12 each\n• River Sand: ₹50–80/cft\n• Aggregate (20mm): ₹40–60/cft\n• AAC Blocks: ₹45–55 each\n• Tiles (vitrified): ₹35–120/sq ft",
    workforce: "Labour rates in India (per day):\n• Mason: ₹700–1,200\n• Helper: ₹450–700\n• Carpenter: ₹700–1,100\n• Plumber: ₹600–1,000\n• Electrician: ₹600–1,000\n• Painter: ₹500–800\n\nContractor rate: ₹150–300/sq ft (labour only)",
    vastu: "Key Vastu principles:\n• Main door: East or North facing\n• Kitchen: South-East corner (Agni corner)\n• Master bedroom: South-West\n• Pooja room: North-East\n• Staircase: South or West\n• Avoid toilet in North-East\n• Water sources: North-East or North",
    design: "Popular home design styles in India:\n• Contemporary: Clean lines, large windows, open floor plans\n• Traditional Indian: Jali work, courtyards, sloping roofs\n• Modern Minimalist: Neutral tones, functional spaces\n• Vastu-compliant: Room placement per Vastu principles\n• Eco-friendly: Solar panels, rainwater harvesting, fly ash bricks\n\nConsider climate, plot size, and budget when choosing.",
    contractors: "How to find verified contractors:\n• Check local builder associations (CREDAI, BAI)\n• Ask for recent project references and visit sites\n• Verify licenses, GST registration, and insurance\n• Get at least 3 quotes for comparison\n• Use platforms like BuildersMart, Housing.com, MagicBricks\n\nRed flags: demands >30% advance, no written contract, no portfolio.",
    vendors: "Finding local vendors in India:\n• Building materials: Check local wholesale markets (e.g., Delhi's Lajpat Rai Market, Mumbai's Bhuleshwar)\n• Tiles & sanitaryware: Visit dedicated tile showrooms for better rates\n• Hardware: Local hardware stores often beat online prices\n• Paint: Direct from dealer for bulk discounts (15-25% off MRP)\n• Electrical: Local electrical markets for competitive pricing\n\nAlways compare 3-4 vendors and negotiate for bulk orders.",
    default: "I can help you with:\n• Construction costs & budget planning\n• Building materials & current prices\n• Workforce & contractor guidance\n• Vastu Shastra compliance\n• Design ideas & architectural styles\n• Verified contractors & how to find them\n• Local vendors & material sourcing\n• Eco-friendly construction\n• Building permits & approvals\n• Structural engineering basics\n\nPlease ask your specific construction question!",
  },
  ml: {
    cost: "ഇന്ത്യയിൽ നിർമ്മാണ ചെലവ് (പ്രതി ചതുരശ്ര അടി):\n• ബേസിക്: ₹1,200–1,600\n• സ്റ്റാൻഡേർഡ്: ₹1,600–2,200\n• പ്രീമിയം: ₹2,200–3,000\n• ലക്ഷ്വറി: ₹3,000+\n\n1000 ചതുരശ്ര അടി വീടിന്: ബേസിക് ₹12–16 ലക്ഷം, സ്റ്റാൻഡേർഡ് ₹16–22 ലക്ഷം.\nമുംബൈ/ഡൽഹി ടയർ-2 നഗരങ്ങളേക്കാൾ 30–40% കൂടുതൽ ചെലവ്.",
    materials: "നിലവിലെ സാമഗ്രി വില (ഇന്ത്യ):\n• സിമന്റ് (OPC 53): ₹350–420/ബാഗ് (50കിലോ)\n• TMT സ്റ്റീൽ: ₹55–68/കിലോ\n• ചുവന്ന ഇഷ്ടിക: ₹7–12 ഓരോന്നും\n• മണൽ: ₹50–80/ഘനഅടി\n• മെറ്റൽ (20mm): ₹40–60/ഘനഅടി\n• ടൈൽസ്: ₹35–120/ചതുരശ്ര അടി",
    workforce: "തൊഴിലാളി നിരക്ക് (പ്രതിദിനം):\n• മേസ്ത്രി: ₹700–1,200\n• ഹെൽപ്പർ: ₹450–700\n• ആശാരി: ₹700–1,100\n• പ്ലംബർ: ₹600–1,000\n• ഇലക്ട്രീഷ്യൻ: ₹600–1,000\n• പെയിന്റർ: ₹500–800\n\nകോൺട്രാക്ടർ നിരക്ക്: ₹150–300/ചതുരശ്ര അടി",
    vastu: "പ്രധാന വാസ്തു തത്ത്വങ്ങൾ:\n• പ്രധാന വാതിൽ: കിഴക്ക് അല്ലെങ്കിൽ വടക്ക് ദിശ\n• അടുക്കള: തെക്ക്-കിഴക്ക് (അഗ്നി കോൺ)\n• മാസ്റ്റർ ബെഡ്റൂം: തെക്ക്-പടിഞ്ഞാറ്\n• പൂജാ മുറി: വടക്ക്-കിഴക്ക്\n• കിണർ/വെള്ളം: വടക്ക്-കിഴക്ക്\n• ടോയ്‌ലറ്റ് വടക്ക്-കിഴക്ക് ഒഴിവാക്കുക",
    design: "ജനപ്രിയ ഭവന രൂപകൽപ്പന ശൈലികൾ:\n• ആധുനികം: വൃത്തിയുള്ള ലൈനുകൾ, വലിയ ജനാലകൾ\n• പരമ്പരാഗത ഇന്ത്യൻ: ജാലി പണി, മുറ്റങ്ങൾ\n• മിനിമലിസ്റ്റ്: നിഷ്പക്ഷ നിറങ്ങൾ, പ്രവർത്തനക്ഷമമായ ഇടങ്ങൾ\n• വാസ്തു അനുസൃതം: വാസ്തു പ്രകാരം മുറി ക്രമീകരണം\n• പരിസ്ഥിതി സൗഹൃദം: സോളാർ, മഴവെള്ള സംഭരണം",
    contractors: "വിശ്വസ്തരായ കോൺട്രാക്ടർമാരെ കണ്ടെത്താൻ:\n• പ്രാദേശിക ബിൽഡേഴ്സ് അസോസിയേഷനുകൾ പരിശോധിക്കുക\n• സമീപകാല പ്രോജക്ട് റഫറൻസുകൾ ചോദിക്കുക\n• ലൈസൻസും ഇൻഷുറൻസും പരിശോധിക്കുക\n• കുറഞ്ഞത് 3 ഉദ്ധരണികൾ താരതമ്യം ചെയ്യുക\n• 30% ൽ കൂടുതൽ അഡ്വാൻസ് ആവശ്യപ്പെടുന്നവരെ സൂക്ഷിക്കുക",
    vendors: "പ്രാദേശിക വെണ്ടർമാരെ കണ്ടെത്താൻ:\n• നിർമ്മാണ സാമഗ്രികൾ: പ്രാദേശിക മൊത്ത വിപണികൾ പരിശോധിക്കുക\n• ടൈലുകൾ: ടൈൽ ഷോറൂമുകളിൽ മികച്ച നിരക്ക് ലഭിക്കും\n• പെയിന്റ്: ഡീലറിൽ നിന്ന് നേരിട്ട് 15-25% കിഴിവ്\n• 3-4 വെണ്ടർമാരെ താരതമ്യം ചെയ്യുക",
    default: "ഞാൻ ഇനിപ്പറയുന്ന വിഷയങ്ങളിൽ സഹായിക്കാം:\n• നിർമ്മാണ ചെലവ് & ബജറ്റ് ആസൂത്രണം\n• സാമഗ്രികൾ & നിലവിലെ വിലകൾ\n• തൊഴിലാളികൾ & കോൺട്രാക്ടർ നിർദ്ദേശം\n• വാസ്തു ശാസ്ത്ര അനുപാലനം\n• ഡിസൈൻ ആശയങ്ങൾ\n• വിശ്വസ്ത കോൺട്രാക്ടർമാർ\n• പ്രാദേശിക വെണ്ടർമാർ\n• പരിസ്ഥിതി സൗഹൃദ നിർമ്മാണം\n\nനിങ്ങളുടെ ചോദ്യം ചോദിക്കൂ!",
  },
  hi: {
    cost: "भारत में निर्माण लागत (प्रति वर्ग फुट):\n• बेसिक: ₹1,200–1,600\n• स्टैंडर्ड: ₹1,600–2,200\n• प्रीमियम: ₹2,200–3,000\n• लक्ज़री: ₹3,000+\n\n1000 वर्ग फुट घर के लिए: बेसिक ₹12–16 लाख, स्टैंडर्ड ₹16–22 लाख.\nमुंबई/दिल्ली में टियर-2 शहरों से 30–40% अधिक लागत.",
    materials: "वर्तमान सामग्री मूल्य (भारत):\n• सीमेंट (OPC 53): ₹350–420/बैग (50kg)\n• TMT स्टील: ₹55–68/kg\n• लाल ईंट: ₹7–12 प्रत्येक\n• रेत: ₹50–80/घन फुट\n• गिट्टी (20mm): ₹40–60/घन फुट\n• टाइल्स: ₹35–120/वर्ग फुट",
    workforce: "मजदूरी दर (प्रतिदिन):\n• राजमिस्त्री: ₹700–1,200\n• हेल्पर: ₹450–700\n• बढ़ई: ₹700–1,100\n• प्लंबर: ₹600–1,000\n• इलेक्ट्रीशियन: ₹600–1,000\n\nठेकेदार दर: ₹150–300/वर्ग फुट (श्रम मात्र)",
    vastu: "मुख्य वास्तु सिद्धांत:\n• मुख्य द्वार: पूर्व या उत्तर दिशा\n• रसोई: दक्षिण-पूर्व (अग्नि कोण)\n• मास्टर बेडरूम: दक्षिण-पश्चिम\n• पूजा कक्ष: उत्तर-पूर्व\n• जल स्रोत: उत्तर-पूर्व\n• उत्तर-पूर्व में शौचालय न बनाएं",
    design: "लोकप्रिय घर डिज़ाइन शैलियाँ:\n• समकालीन: साफ लाइनें, बड़ी खिड़कियां, खुला फ्लोर प्लान\n• पारंपरिक भारतीय: जाली का काम, आंगन, ढलवां छत\n• आधुनिक मिनिमलिस्ट: तटस्थ रंग, कार्यात्मक स्थान\n• वास्तु-अनुरूप: वास्तु के अनुसार कमरे की व्यवस्था\n• इको-फ्रेंडली: सोलर पैनल, वर्षा जल संचयन",
    contractors: "वेरिफाइड ठेकेदार कैसे खोजें:\n• स्थानीय बिल्डर्स एसोसिएशन (CREDAI, BAI) जांचें\n• हाल के प्रोजेक्ट रेफरेंस मांगें और साइट विजिट करें\n• लाइसेंस, GST रजिस्ट्रेशन और इंश्योरेंस जांचें\n• कम से कम 3 कोटेशन तुलना करें\n• 30% से अधिक एडवांस मांगने वालों से सावधान रहें",
    vendors: "स्थानीय विक्रेता कैसे खोजें:\n• निर्माण सामग्री: स्थानीय थोक बाजार देखें\n• टाइल्स: टाइल शोरूम में बेहतर दरें मिलती हैं\n• पेंट: डीलर से सीधे 15-25% छूट पर खरीदें\n• 3-4 विक्रेताओं की तुलना करें और मोलभाव करें",
    default: "मैं इन विषयों में सहायता कर सकता हूं:\n• निर्माण लागत और बजट योजना\n• सामग्री और वर्तमान मूल्य\n• कार्यबल और ठेकेदार मार्गदर्शन\n• वास्तु शास्त्र अनुपालन\n• डिज़ाइन विचार और आर्किटेक्चरल शैलियाँ\n• वेरिफाइड ठेकेदार\n• स्थानीय विक्रेता और सामग्री सोर्सिंग\n• पर्यावरण-अनुकूल निर्माण\n\nअपना प्रश्न पूछें!",
  },
  mr: {
    cost: "भारतात बांधकाम खर्च (प्रति चौरस फूट):\n• मूलभूत: ₹1,200–1,600\n• मानक: ₹1,600–2,200\n• प्रीमियम: ₹2,200–3,000\n• लक्झरी: ₹3,000+\n\n1000 चौरस फूट घरासाठी: मूलभूत ₹12–16 लाख, मानक ₹16–22 लाख.\nमुंबई/दिल्ली टियर-2 शहरांपेक्षा 30–40% अधिक खर्च.",
    materials: "सध्याचे साहित्य दर (भारत):\n• सिमेंट (OPC 53): ₹350–420/पिशवी (50kg)\n• TMT स्टील: ₹55–68/किलो\n• लाल विटा: ₹7–12 प्रति\n• वाळू: ₹50–80/घन फूट\n• मेटल (20mm): ₹40–60/घन फूट\n• फरशा: ₹35–120/चौरस फूट",
    workforce: "मजुरी दर (प्रतिदिन):\n• राजमिस्त्री: ₹700–1,200\n• हेल्पर: ₹450–700\n• सुतार: ₹700–1,100\n• प्लंबर: ₹600–1,000\n• इलेक्ट्रिशियन: ₹600–1,000\n\nकंत्राटदार दर: ₹150–300/चौरस फूट (कामगार मात्र)",
    vastu: "मुख्य वास्तु तत्त्वे:\n• मुख्य दरवाजा: पूर्व किंवा उत्तर दिशा\n• स्वयंपाकघर: आग्नेय कोपरा\n• मास्टर बेडरूम: नैऋत्य\n• पूजा खोली: ईशान्य\n• पाण्याचे स्रोत: ईशान्य\n• ईशान्येत शौचालय बांधू नका",
    design: "लोकप्रिय घर रचना शैली:\n• समकालीन: स्वच्छ रेषा, मोठ्या खिडक्या, खुला मजला आराखडा\n• पारंपारिक भारतीय: जाळीकाम, अंगण, उताराचे छप्पर\n• आधुनिक मिनिमलिस्ट: तटस्थ रंग, कार्यात्मक जागा\n• वास्तु-अनुरूप: वास्तुनुसार खोल्यांची मांडणी\n• पर्यावरणपूरक: सोलर पॅनेल, पावसाचे पाणी साठवणूक",
    contractors: "प्रमाणित कंत्राटदार कसे शोधावेत:\n• स्थानिक बिल्डर्स असोसिएशन (CREDAI, BAI) तपासा\n• अलीकडील प्रकल्प संदर्भ विचारा आणि साइट भेट द्या\n• परवाना, GST नोंदणी आणि विमा तपासा\n• किमान 3 कोटेशनची तुलना करा\n• 30% पेक्षा जास्त अॅडव्हान्स मागणाऱ्यांपासून सावध रहा",
    vendors: "स्थानिक विक्रेते कसे शोधावेत:\n• बांधकाम साहित्य: स्थानिक घाऊक बाजार पहा\n• फरशा: टाइल शोरूममध्ये चांगले दर मिळतात\n• पेंट: डीलरकडून थेट 15-25% सूट घ्या\n• 3-4 विक्रेत्यांची तुलना करा आणि सौदा करा",
    default: "मी या विषयांमध्ये मदत करू शकतो:\n• बांधकाम खर्च आणि बजेट नियोजन\n• साहित्य आणि सध्याचे बाजारभाव\n• कामगार आणि कंत्राटदार मार्गदर्शन\n• वास्तु शास्त्र अनुपालन\n• डिझाइन कल्पना आणि स्थापत्य शैली\n• प्रमाणित कंत्राटदार\n• स्थानिक विक्रेते आणि साहित्य स्रोत\n• पर्यावरणपूरक बांधकाम\n\nकृपया तुमचा प्रश्न विचारा!",
  },
  ta: {
    cost: "இந்தியாவில் கட்டுமான செலவு (ஒரு சதுர அடிக்கு):\n• அடிப்படை: ₹1,200–1,600\n• நிலையான: ₹1,600–2,200\n• பிரீமியம்: ₹2,200–3,000\n\n1000 சதுர அடி வீட்டிற்கு: அடிப்படை ₹12–16 லட்சம், நிலையான ₹16–22 லட்சம்.\nமும்பை/டெல்லி டயர்-2 நகரங்களை விட 30–40% அதிக செலவு.",
    materials: "தற்போதைய பொருள் விலைகள் (இந்தியா):\n• சிமெண்ட் (OPC 53): ₹350–420/பை (50kg)\n• TMT எஃகு: ₹55–68/கிலோ\n• சிவப்பு செங்கல்: ₹7–12 ஒவ்வொன்று\n• மணல்: ₹50–80/கன அடி\n• சரளை (20mm): ₹40–60/கன அடி\n• டைல்ஸ்: ₹35–120/சதுர அடி",
    workforce: "கூலி விகிதம் (தினசரி):\n• கொத்தனார்: ₹700–1,200\n• உதவியாளர்: ₹450–700\n• தச்சர்: ₹700–1,100\n• பம்பர்: ₹600–1,000\n• மின்சாரக்காரர்: ₹600–1,000\n\nஒப்பந்தக்காரர் விகிதம்: ₹150–300/சதுர அடி",
    vastu: "முக்கிய வாஸ்து கொள்கைகள்:\n• பிரதான வாசல்: கிழக்கு அல்லது வடக்கு\n• சமையலறை: தென்கிழக்கு மூலை\n• தலை படுக்கையறை: தென்மேற்கு\n• பூஜை அறை: வடகிழக்கு\n• நீர் ஆதாரம்: வடகிழக்கு\n• வடகிழக்கில் கழிவறை வேண்டாம்",
    design: "பிரபலமான வீட்டு வடிவமைப்பு பாணிகள்:\n• சமகால: சுத்தமான கோடுகள், பெரிய ஜன்னல்கள்\n• பாரம்பரிய இந்திய: ஜாலி வேலை, முற்றங்கள்\n• நவீன மினிமலிஸ்ட்: நடுநிலை வண்ணங்கள்\n• வாஸ்து இணக்கம்: வாஸ்து படி அறை அமைப்பு\n• சூழல் நட்பு: சோலார், மழைநீர் சேகரிப்பு",
    contractors: "சரிபார்க்கப்பட்ட ஒப்பந்தக்காரர்களை கண்டுபிடிப்பது:\n• உள்ளூர் பில்டர்ஸ் அசோசியேஷன் பார்க்கவும்\n• சமீபத்திய திட்ட குறிப்புகளை கேட்கவும்\n• உரிமம், GST மற்றும் காப்பீடு சரிபார்க்கவும்\n• குறைந்தது 3 ஒப்பீடுகள் பெறவும்\n• 30% முன்பணம் கேட்பவர்களிடம் எச்சரிக்கை",
    vendors: "உள்ளூர் விற்பனையாளர்களை கண்டுபிடிப்பது:\n• கட்டுமான பொருட்கள்: உள்ளூர் மொத்த சந்தை பார்க்கவும்\n• ஓடுகள்: டைல் கடைகளில் சிறந்த விலை\n• பெயிண்ட்: டீலரிடம் நேரடியாக 15-25% தள்ளுபடி\n• 3-4 விற்பனையாளர்களை ஒப்பிட்டு பேரம் பேசவும்",
    default: "நான் இந்த தலைப்புகளில் உதவ முடியும்:\n• கட்டுமான செலவு & பட்ஜெட் திட்டமிடல்\n• பொருட்கள் & தற்போதைய விலைகள்\n• தொழிலாளர் & ஒப்பந்தகாரர் வழிகாட்டுதல்\n• வாஸ்து சாஸ்திர இணக்கம்\n• வடிவமைப்பு யோசனைகள்\n• சரிபார்க்கப்பட்ட ஒப்பந்தக்காரர்கள்\n• உள்ளூர் விற்பனையாளர்கள்\n• சூழல் நட்பு கட்டுமானம்\n\nஉங்கள் கேள்வியை கேளுங்கள்!",
  },
  te: {
    cost: "భారతదేశంలో నిర్మాణ ఖర్చు (చదరపు అడుగుకు):\n• బేసిక్: ₹1,200–1,600\n• స్టాండర్డ్: ₹1,600–2,200\n• ప్రీమియం: ₹2,200–3,000\n\n1000 చదరపు అడుగుల ఇంటికి: బేసిక్ ₹12–16 లక్షలు, స్టాండర్డ్ ₹16–22 లక్షలు.\nముంబై/ఢిల్లీ టయర్-2 నగరాల కంటే 30–40% అధిక ఖర్చు.",
    materials: "ప్రస్తుత సామగ్రి ధరలు (భారతదేశం):\n• సిమెంట్ (OPC 53): ₹350–420/బ్యాగ్ (50kg)\n• TMT స్టీల్: ₹55–68/కిలో\n• ఎర్ర ఇటుక: ₹7–12 ఒక్కొక్కటి\n• ఇసుక: ₹50–80/క్యూబిక్ అడుగు\n• మెటల్ (20mm): ₹40–60/క్యూబిక్ అడుగు\n• టైల్స్: ₹35–120/చదరపు అడుగు",
    workforce: "కూలీ రేటు (రోజుకు):\n• మేస్త్రి: ₹700–1,200\n• హెల్పర్: ₹450–700\n• వడ్రంగి: ₹700–1,100\n• ప్లంబర్: ₹600–1,000\n• ఎలక్ట్రీషియన్: ₹600–1,000\n\nకాంట్రాక్టర్ రేటు: ₹150–300/చదరపు అడుగు",
    vastu: "ముఖ్యమైన వాస్తు సూత్రాలు:\n• ప్రధాన తలుపు: తూర్పు లేదా ఉత్తరం\n• వంటగది: ఆగ్నేయ మూల\n• మాస్టర్ బెడ్ రూమ్: నైరుతి\n• పూజ గది: ఈశాన్యం\n• నీటి వనరు: ఈశాన్యం\n• ఈశాన్యంలో మరుగుదొడ్డి వద్దు",
    design: "ప్రసిద్ధ ఇల్లు డిజైన్ శైలులు:\n• సమకాలీన: శుభ్రమైన లైన్లు, పెద్ద కిటికీలు\n• సాంప్రదాయ భారతీయ: జాలీ పని, ఆవరణలు\n• ఆధునిక మినిమలిస్ట్: తటస్థ రంగులు\n• వాస్తు అనుసారం: వాస్తు ప్రకారం గది అమరిక\n• పర్యావరణ స్నేహపూర్వక: సోలార్, వర్షపు నీటి సేకరణ",
    contractors: "ధృవీకరించబడిన కాంట్రాక్టర్లను కనుగొనడం:\n• స్థానిక బిల్డర్స్ అసోసియేషన్ తనిఖీ చేయండి\n• ఇటీవలి ప్రాజెక్ట్ రిఫరెన్స్ లు అడగండి\n• లైసెన్స్, GST మరియు బీమా తనిఖీ చేయండి\n• కనీసం 3 కోటేషన్లు పోల్చండి\n• 30% ముందస్తు డిమాండ్ చేసే వారి పట్ల అప్రమత్తత",
    vendors: "స్థానిక విక్రేతలను కనుగొనడం:\n• నిర్మాణ సామగ్రి: స్థానిక హోల్సేల్ మార్కెట్ చూడండి\n• టైల్స్: టైల్ షోరూమ్ లలో మెరుగైన ధరలు\n• పెయింట్: డీలర్ నుండి నేరుగా 15-25% తగ్గింపు\n• 3-4 విక్రేతలను పోల్చి బేరం చేయండి",
    default: "నేను ఈ విషయాలలో సహాయపడగలను:\n• నిర్మాణ ఖర్చు & బడ్జెట్ ప్లానింగ్\n• సామగ్రి & ప్రస్తుత ధరలు\n• కార్మికులు & కాంట్రాక్టర్ మార్గదర్శకత్వం\n• వాస్తు శాస్త్ర అనుగుణత\n• డిజైన్ ఆలోచనలు\n• ధృవీకరించబడిన కాంట్రాక్టర్లు\n• స్థానిక విక్రేతలు\n• పర్యావరణ అనుకూల నిర్మాణం\n\nమీ ప్రశ్న అడగండి!",
  },
}

function getFallback(message: string, lang: string): string {
  const t = message.toLowerCase()
  const fb = fallbacks[lang] ?? fallbacks.en
  if (t.includes("cost") || t.includes("price") || t.includes("budget") || t.includes("rate") ||
      t.includes("estimate") || t.includes("lakh") || t.includes("rupee") || t.includes("₹") ||
      t.includes("ചെലവ") || t.includes("വില") || t.includes("ബജ") ||
      t.includes("लागत") || t.includes("बजट") || t.includes("कीमत") ||
      t.includes("खर्च") || t.includes("बजेट") || t.includes("किंमत") ||
      t.includes("செலவ") || t.includes("விலை") || t.includes("பட்ஜெட்") ||
      t.includes("ఖర్చ") || t.includes("ధర") || t.includes("బడ్జెట్"))
    return fb.cost
  if (t.includes("material") || t.includes("cement") || t.includes("steel") || t.includes("brick") ||
      t.includes("sand") || t.includes("iron") || t.includes("tile") || t.includes("aggregate") ||
      t.includes("സാമഗ്") || t.includes("സിമ") || t.includes("ഇഷ്ട") ||
      t.includes("सामग") || t.includes("सीमेंट") || t.includes("ईंट") ||
      t.includes("साहित्य") || t.includes("सिमेंट") || t.includes("वीट") ||
      t.includes("பொருட்") || t.includes("சிமெண்") || t.includes("செங்க") ||
      t.includes("సామగ్రి") || t.includes("సిమెంట్") || t.includes("ఇటుక"))
    return fb.materials
  if (t.includes("worker") || t.includes("labour") || t.includes("labor") || t.includes("mason") ||
      t.includes("workforce") || t.includes("helper") || t.includes("carpenter") || t.includes("plumber") ||
      t.includes("electrician") || t.includes("painter") || t.includes("welder") ||
      t.includes("കൂലി") || t.includes("కూలీ") ||
      t.includes("मजदूर") || t.includes("मजूर") || t.includes("कार्मिक") ||
      t.includes("मजूर") || t.includes("कामगार") ||
      t.includes("தொழிலாள") || t.includes("തൊഴി") ||
      t.includes("ಕಾರ್ಮಿಕ"))
    return fb.workforce
  if (t.includes("vastu") || t.includes("vaastu") || t.includes("vasthu") ||
      t.includes("വാസ്") || t.includes("वास्तु") || t.includes("વાસ્તુ") ||
      t.includes("வாஸ்து") || t.includes("వాస్తు"))
    return fb.vastu
  if (t.includes("design") || t.includes("style") || t.includes("floor plan") || t.includes("elevation") ||
      t.includes("modern") || t.includes("contemporary") || t.includes("traditional") ||
      t.includes("architecture") || t.includes("layout") ||
      t.includes("ഡിസൈന") || t.includes("डिज़ाइन") || t.includes("डिझाइन") ||
      t.includes("विन्यास") || t.includes("रचना") ||
      t.includes("டிசைன்") || t.includes("வடிவமைப்ப") || t.includes("డిజైన్"))
    return fb.design
  if (t.includes("contractor") || t.includes("builder") || t.includes("verified") || t.includes("credai") ||
      t.includes("bai") || t.includes("licence") || t.includes("license") ||
      t.includes("ഗുത്ത") || t.includes("ठेकेदार") || t.includes("ઠેકેદાર") ||
      t.includes("गुत्त") || t.includes("कंत्राट") ||
      t.includes("ஒப்பந்த") || t.includes("காந்திராக்") || t.includes("కాంట్రాక్ట"))
    return fb.contractors
  if (t.includes("vendor") || t.includes("supplier") || t.includes("shop") || t.includes("market") ||
      t.includes("buy") || t.includes("purchase") || t.includes("wholesale") || t.includes("dealer") || t.includes("store") ||
      t.includes("വെണ്ട") || t.includes("विक्रे") || t.includes("मार्केट") ||
      t.includes("विक्रे") || t.includes("बाजार") ||
      t.includes("விற்ப") || t.includes("విక్ర"))
    return fb.vendors
  return fb.default
}

export async function POST(req: NextRequest) {
  try {
    const { message, lang } = await req.json()
    if (!message || !lang) {
      return NextResponse.json({ error: "Missing message or lang" }, { status: 400 })
    }

    // --- DOMAIN VALIDATION ---
    // Check if the query is construction-related before calling LLM
    if (!isConstructionRelated(message)) {
      const rejectionMessage = domainRejectionMessages[lang] ?? domainRejectionMessages.en
      return NextResponse.json({ reply: rejectionMessage, isOffTopic: true })
    }

    const apiKey = process.env.GROQ_API_KEY?.trim()
    const langName = langNameMap[lang] ?? "English"

    // If no API key, return accurate fallback immediately
    if (!apiKey) {
      return NextResponse.json({ reply: getFallback(message, lang) })
    }

    // --- SCRIPT-VALIDATED LLM CALL ---
    // We may retry up to 3 times with escalating strictness
    let reply: string | null = null
    let attempts = 0
    const maxAttempts = 3

    // Map language to native script name and a sample sentence for few-shot prompting
    const langExamples: Record<string, { script: string; sample: string }> = {
      ml: {
        script: "Malayalam (മലയാളം)",
        sample: "സിമന്റിന്റെ വില ₹350-400 ബാഗിന്. 1000 ചതുരശ്ര അടി വീടിന് ഏകദേശം ₹12-16 ലക്ഷം ചെലവ് വരും."
      },
      ta: {
        script: "Tamil (தமிழ்)",
        sample: "சிமெண்ட் விலை ₹350-400 ஒரு பை. 1000 சதுர அடி வீட்டிற்கு தோராயமாக ₹12-16 லட்சம் செலவாகும்."
      },
      te: {
        script: "Telugu (తెలుగు)",
        sample: "సిమెంట్ ధర ₹350-400 బ్యాగుకు. 1000 చదరపు అడుగుల ఇంటికి దాదాపు ₹12-16 లక్షలు ఖర్చు అవుతుంది."
      },
      hi: {
        script: "Hindi in Devanagari (हिन्दी)",
        sample: "सीमेंट की कीमत ₹350-400 प्रति बैग है। 1000 वर्ग फुट के घर की लागत लगभग ₹12-16 लाख है।"
      },
      mr: {
        script: "Marathi in Devanagari (मराठी)",
        sample: "सिमेंटची किंमत ₹350-400 प्रति पिशवी. 1000 चौरस फूट घरासाठी अंदाजे ₹12-16 लाख खर्च येतो."
      },
      en: {
        script: "English",
        sample: "Cement price is ₹350-400 per bag. A 1000 sq ft house costs approximately ₹12-16 lakhs."
      }
    }

    const example = langExamples[lang] || langExamples.en

    while (attempts < maxAttempts && !reply) {
      attempts++

      let strictnessInstruction = ""
      if (attempts === 1) {
        strictnessInstruction = ""
      } else if (attempts === 2) {
        strictnessInstruction = "\n\nWARNING: Your previous response contained Latin/English letters instead of the native script. This is COMPLETELY UNACCEPTABLE. You MUST write ONLY in the native script this time."
      } else {
        strictnessInstruction = `\n\nFINAL WARNING: This is your ABSOLUTE LAST chance. If you include even ONE Latin letter (a-z, A-Z) in your response, you have FAILED. Write ENTIRELY in ${example.script} ONLY. Here is an example of the correct format:\n\n${example.sample}`
      }

      const systemPrompt = `You are a Construction AI Assistant for India, specializing in construction costs, materials, workforce, Vastu Shastra, design, contractors, and vendors.

CRITICAL RULE - YOU MUST FOLLOW THIS WITHOUT EXCEPTION:
Write your ENTIRE response in ${example.script} script ONLY. Do NOT use Latin/English alphabet letters at all. Zero transliteration. Zero Romanized words. Zero English words.

The user's question may be in English, in the native script, or in transliteration (English letters). Regardless of how they asked, you MUST reply ONLY in ${example.script} script.

Example of correct response format for ${example.script}:
${example.sample}

PRICES: Always use ₹. Give real Indian market rates.
LENGTH: Under 200 words. Be specific and practical.${strictnessInstruction}`

      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 500,
          temperature: attempts >= 2 ? 0.0 : 0.2,
        }),
      })

      if (!groqRes.ok) {
        console.error("Groq error:", groqRes.status)
        break
      }

      const data = await groqRes.json()
      const candidate = data.choices?.[0]?.message?.content?.trim()
      
      if (!candidate) break

      // Strip only ASCII digits, ASCII punctuation, and whitespace.
      // Keep ALL Unicode characters (Indian scripts, ₹, etc.)
      const cleaned = candidate.replace(/[0-9\s\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/g, "").trim()
      
      if (!cleaned) {
        // Only numbers/symbols — accept as-is
        reply = candidate
        break
      }

      // For non-English languages: strictly validate native script
      if (lang !== "en") {
        // Define native script Unicode ranges for each language
        const nativeRange: Record<string, [number, number]> = {
          hi: [0x0900, 0x097F],
          mr: [0x0900, 0x097F],
          ml: [0x0D00, 0x0D7F],
          ta: [0x0B80, 0x0BFF],
          te: [0x0C00, 0x0C7F],
        }
        
        const range = nativeRange[lang]
        if (!range) {
          // Unknown language, accept
          reply = candidate
          break
        }

        // Check every character in cleaned text
        let hasLatinChars = false
        let hasNativeChars = false
        
        for (let i = 0; i < cleaned.length; i++) {
          const code = cleaned.charCodeAt(i)
          if (code >= 0x41 && code <= 0x5A) hasLatinChars = true // A-Z
          else if (code >= 0x61 && code <= 0x7A) hasLatinChars = true // a-z
          else if (code >= range[0] && code <= range[1]) hasNativeChars = true
        }
        
        // CRITICAL: Accept ONLY if there are native chars AND no Latin chars
        if (hasNativeChars && !hasLatinChars) {
          reply = candidate
          break
        }
        
        // FAILED validation
        if (hasLatinChars) {
          console.warn(`Groq attempt ${attempts} for ${lang}: HAS Latin chars. Retrying...`)
        } else if (!hasNativeChars) {
          console.warn(`Groq attempt ${attempts} for ${lang}: missing native script chars. Retrying...`)
        }
        
        if (attempts >= maxAttempts) {
          console.warn(`All ${maxAttempts} attempts failed for ${lang}, using fallback`)
          reply = getFallback(message, lang)
        }
        continue
      }
      
      // English: accept
      reply = candidate
    }

    return NextResponse.json({ reply: reply || getFallback(message, lang) })

  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json({ reply: getFallback("", "en") })
  }
}
