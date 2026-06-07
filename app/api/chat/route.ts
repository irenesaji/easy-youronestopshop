import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

const langNameMap: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ml: "Malayalam",
  ta: "Tamil",
  te: "Telugu",
}

// Accurate fallback responses per language for when Groq is unavailable
const fallbacks: Record<string, Record<string, string>> = {
  en: {
    cost: "Construction costs in India (per sq ft):\n• Basic: ₹1,200–1,600\n• Standard: ₹1,600–2,200\n• Premium: ₹2,200–3,000\n• Luxury: ₹3,000+\n\nFor 1000 sq ft: Basic ₹12–16L, Standard ₹16–22L, Premium ₹22–30L.\nMumbai/Delhi cost 30–40% more than tier-2 cities.",
    materials: "Current material prices (India):\n• Cement (OPC 53): ₹350–420/bag (50kg)\n• TMT Steel: ₹55–68/kg\n• Red Bricks: ₹7–12 each\n• River Sand: ₹50–80/cft\n• Aggregate (20mm): ₹40–60/cft\n• AAC Blocks: ₹45–55 each\n• Tiles (vitrified): ₹35–120/sq ft",
    workforce: "Labour rates in India (per day):\n• Mason: ₹700–1,200\n• Helper: ₹450–700\n• Carpenter: ₹700–1,100\n• Plumber: ₹600–1,000\n• Electrician: ₹600–1,000\n• Painter: ₹500–800\n\nContractor rate: ₹150–300/sq ft (labour only)",
    vastu: "Key Vastu principles:\n• Main door: East or North facing\n• Kitchen: South-East corner (Agni corner)\n• Master bedroom: South-West\n• Pooja room: North-East\n• Staircase: South or West\n• Avoid toilet in North-East\n• Water sources: North-East or North",
    default: "I can help you with:\n• Construction costs & budget planning\n• Building materials & current prices\n• Workforce & contractor guidance\n• Vastu Shastra compliance\n• Eco-friendly construction\n• Building permits & approvals\n• Structural engineering basics\n\nPlease ask your specific construction question!",
  },
  ml: {
    cost: "ഇന്ത്യയിൽ നിർമ്മാണ ചെലവ് (പ്രതി ചതുരശ്ര അടി):\n• ബേസിക്: ₹1,200–1,600\n• സ്റ്റാൻഡേർഡ്: ₹1,600–2,200\n• പ്രീമിയം: ₹2,200–3,000\n• ലക്ഷ്വറി: ₹3,000+\n\n1000 ചതുരശ്ര അടി വീടിന്: ബേസിക് ₹12–16 ലക്ഷം, സ്റ്റാൻഡേർഡ് ₹16–22 ലക്ഷം.\nമുംബൈ/ഡൽഹി ടയർ-2 നഗരങ്ങളേക്കാൾ 30–40% കൂടുതൽ ചെലവ്.",
    materials: "നിലവിലെ സാമഗ്രി വില (ഇന്ത്യ):\n• സിമന്റ് (OPC 53): ₹350–420/ബാഗ് (50കിലോ)\n• TMT സ്റ്റീൽ: ₹55–68/കിലോ\n• ചുവന്ന ഇഷ്ടിക: ₹7–12 ഓരോന്നും\n• മണൽ: ₹50–80/ഘനഅടി\n• മെറ്റൽ (20mm): ₹40–60/ഘനഅടി\n• ടൈൽസ്: ₹35–120/ചതുരശ്ര അടി",
    workforce: "തൊഴിലാളി നിരക്ക് (പ്രതിദിനം):\n• മേസ്ത്രി: ₹700–1,200\n• ഹെൽപ്പർ: ₹450–700\n• ആശാരി: ₹700–1,100\n• പ്ലംബർ: ₹600–1,000\n• ഇലക്ട്രീഷ്യൻ: ₹600–1,000\n• പെയിന്റർ: ₹500–800\n\nകോൺട്രാക്ടർ നിരക്ക്: ₹150–300/ചതുരശ്ര അടി",
    vastu: "പ്രധാന വാസ്തു തത്ത്വങ്ങൾ:\n• പ്രധാന വാതിൽ: കിഴക്ക് അല്ലെങ്കിൽ വടക്ക് ദിശ\n• അടുക്കള: തെക്ക്-കിഴക്ക് (അഗ്നി കോൺ)\n• മാസ്റ്റർ ബെഡ്റൂം: തെക്ക്-പടിഞ്ഞാറ്\n• പൂജാ മുറി: വടക്ക്-കിഴക്ക്\n• കിണർ/വെള്ളം: വടക്ക്-കിഴക്ക്\n• ടോയ്‌ലറ്റ് വടക്ക്-കിഴക്ക് ഒഴിവാക്കുക",
    default: "ഞാൻ ഇനിപ്പറയുന്ന വിഷയങ്ങളിൽ സഹായിക്കാം:\n• നിർമ്മാണ ചെലവ് & ബജറ്റ് ആസൂത്രണം\n• സാമഗ്രികൾ & നിലവിലെ വിലകൾ\n• തൊഴിലാളികൾ & കോൺട്രാക്ടർ നിർദ്ദേശം\n• വാസ്തു ശാസ്ത്ര അനുപാലനം\n• പരിസ്ഥിതി സൗഹൃദ നിർമ്മാണം\n• നിർമ്മാണ അനുമതികൾ\n\nനിങ്ങളുടെ ചോദ്യം ചോദിക്കൂ!",
  },
  hi: {
    cost: "भारत में निर्माण लागत (प्रति वर्ग फुट):\n• बेसिक: ₹1,200–1,600\n• स्टैंडर्ड: ₹1,600–2,200\n• प्रीमियम: ₹2,200–3,000\n• लक्ज़री: ₹3,000+\n\n1000 वर्ग फुट घर के लिए: बेसिक ₹12–16 लाख, स्टैंडर्ड ₹16–22 लाख.\nमुंबई/दिल्ली में टियर-2 शहरों से 30–40% अधिक लागत.",
    materials: "वर्तमान सामग्री मूल्य (भारत):\n• सीमेंट (OPC 53): ₹350–420/बैग (50kg)\n• TMT स्टील: ₹55–68/kg\n• लाल ईंट: ₹7–12 प्रत्येक\n• रेत: ₹50–80/घन फुट\n• गिट्टी (20mm): ₹40–60/घन फुट\n• टाइल्स: ₹35–120/वर्ग फुट",
    workforce: "मजदूरी दर (प्रतिदिन):\n• राजमिस्त्री: ₹700–1,200\n• हेल्पर: ₹450–700\n• बढ़ई: ₹700–1,100\n• प्लंबर: ₹600–1,000\n• इलेक्ट्रीशियन: ₹600–1,000\n\nठेकेदार दर: ₹150–300/वर्ग फुट (श्रम मात्र)",
    vastu: "मुख्य वास्तु सिद्धांत:\n• मुख्य द्वार: पूर्व या उत्तर दिशा\n• रसोई: दक्षिण-पूर्व (अग्नि कोण)\n• मास्टर बेडरूम: दक्षिण-पश्चिम\n• पूजा कक्ष: उत्तर-पूर्व\n• जल स्रोत: उत्तर-पूर्व\n• उत्तर-पूर्व में शौचालय न बनाएं",
    default: "मैं इन विषयों में सहायता कर सकता हूं:\n• निर्माण लागत और बजट योजना\n• सामग्री और वर्तमान मूल्य\n• कार्यबल और ठेकेदार मार्गदर्शन\n• वास्तु शास्त्र अनुपालन\n• पर्यावरण-अनुकूल निर्माण\n• भवन निर्माण परमिट\n\nअपना प्रश्न पूछें!",
  },
  kn: {
    cost: "ಭಾರತದಲ್ಲಿ ನಿರ್ಮಾಣ ವೆಚ್ಚ (ಪ್ರತಿ ಚದರ ಅಡಿ):\n• ಬೇಸಿಕ್: ₹1,200–1,600\n• ಸ್ಟ್ಯಾಂಡರ್ಡ್: ₹1,600–2,200\n• ಪ್ರೀಮಿಯಂ: ₹2,200–3,000\n\n1000 ಚದರ ಅಡಿ ಮನೆಗೆ: ಬೇಸಿಕ್ ₹12–16 ಲಕ್ಷ, ಸ್ಟ್ಯಾಂಡರ್ಡ್ ₹16–22 ಲಕ್ಷ.\nಮುಂಬೈ/ದೆಹಲಿ ಟಯರ್-2 ನಗರಗಳಿಗಿಂತ 30–40% ಹೆಚ್ಚು.",
    materials: "ಪ್ರಸ್ತುತ ಸಾಮಗ್ರಿ ಬೆಲೆ (ಭಾರತ):\n• ಸಿಮೆಂಟ್ (OPC 53): ₹350–420/ಚೀಲ (50kg)\n• TMT ಉಕ್ಕು: ₹55–68/ಕಿಗ್ರಾ\n• ಕೆಂಪು ಇಟ್ಟಿಗೆ: ₹7–12 ಪ್ರತಿ\n• ಮರಳು: ₹50–80/ಘನ ಅಡಿ\n• ಜಲ್ಲಿ (20mm): ₹40–60/ಘನ ಅಡಿ\n• ಟೈಲ್ಸ್: ₹35–120/ಚದರ ಅಡಿ",
    workforce: "ಕಾರ್ಮಿಕ ದರ (ಪ್ರತಿ ದಿನ):\n• ಗಾರೆ ಕೆಲಸಗಾರ: ₹700–1,200\n• ಹೆಲ್ಪರ್: ₹450–700\n• ಬಡಗಿ: ₹700–1,100\n• ಪ್ಲಂಬರ್: ₹600–1,000\n• ಎಲೆಕ್ಟ್ರಿಷಿಯನ್: ₹600–1,000\n\nಗುತ್ತಿಗೆದಾರ ದರ: ₹150–300/ಚದರ ಅಡಿ",
    vastu: "ಪ್ರಮುಖ ವಾಸ್ತು ತತ್ವಗಳು:\n• ಮುಖ್ಯ ಬಾಗಿಲು: ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ\n• ಅಡುಗೆ ಮನೆ: ಆಗ್ನೇಯ ಮೂಲೆ\n• ಮಾಸ್ಟರ್ ಬೆಡ್‌ರೂಮ್: ನೈಋತ್ಯ\n• ಪೂಜಾ ಕೊಠಡಿ: ಈಶಾನ್ಯ\n• ನೀರಿನ ಮೂಲ: ಈಶಾನ್ಯ\n• ಈಶಾನ್ಯದಲ್ಲಿ ಶೌಚಾಲಯ ಬೇಡ",
    default: "ನಾನು ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ನಿರ್ಮಾಣ ವೆಚ್ಚ ಮತ್ತು ಬಜೆಟ್ ಯೋಜನೆ\n• ಸಾಮಗ್ರಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಬೆಲೆಗಳು\n• ಕಾರ್ಮಿಕ ಮತ್ತು ಗುತ್ತಿಗೆದಾರ ಮಾರ್ಗದರ್ಶನ\n• ವಾಸ್ತು ಶಾಸ್ತ್ರ ಅನುಪಾಲನೆ\n• ಪರಿಸರ ಸ್ನೇಹಿ ನಿರ್ಮಾಣ\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ!",
  },
  ta: {
    cost: "இந்தியாவில் கட்டுமான செலவு (ஒரு சதுர அடிக்கு):\n• அடிப்படை: ₹1,200–1,600\n• நிலையான: ₹1,600–2,200\n• பிரீமியம்: ₹2,200–3,000\n\n1000 சதுர அடி வீட்டிற்கு: அடிப்படை ₹12–16 லட்சம், நிலையான ₹16–22 லட்சம்.\nமும்பை/டெல்லி டயர்-2 நகரங்களை விட 30–40% அதிக செலவு.",
    materials: "தற்போதைய பொருள் விலைகள் (இந்தியா):\n• சிமெண்ட் (OPC 53): ₹350–420/பை (50kg)\n• TMT எஃகு: ₹55–68/கிலோ\n• சிவப்பு செங்கல்: ₹7–12 ஒவ்வொன்று\n• மணல்: ₹50–80/கன அடி\n• சரளை (20mm): ₹40–60/கன அடி\n• டைல்ஸ்: ₹35–120/சதுர அடி",
    workforce: "கூலி விகிதம் (தினசரி):\n• கொத்தனார்: ₹700–1,200\n• உதவியாளர்: ₹450–700\n• தச்சர்: ₹700–1,100\n• பம்பர்: ₹600–1,000\n• மின்சாரக்காரர்: ₹600–1,000\n\nஒப்பந்தக்காரர் விகிதம்: ₹150–300/சதுர அடி",
    vastu: "முக்கிய வாஸ்து கொள்கைகள்:\n• பிரதான வாசல்: கிழக்கு அல்லது வடக்கு\n• சமையலறை: தென்கிழக்கு மூலை\n• தலை படுக்கையறை: தென்மேற்கு\n• பூஜை அறை: வடகிழக்கு\n• நீர் ஆதாரம்: வடகிழக்கு\n• வடகிழக்கில் கழிவறை வேண்டாம்",
    default: "நான் இந்த தலைப்புகளில் உதவ முடியும்:\n• கட்டுமான செலவு & பட்ஜெட் திட்டமிடல்\n• பொருட்கள் & தற்போதைய விலைகள்\n• தொழிலாளர் & ஒப்பந்தகாரர் வழிகாட்டுதல்\n• வாஸ்து சாஸ்திர இணக்கம்\n• சுற்றுச்சூழல் நட்பு கட்டுமானம்\n\nஉங்கள் கேள்வியை கேளுங்கள்!",
  },
  te: {
    cost: "భారతదేశంలో నిర్మాణ ఖర్చు (చదరపు అడుగుకు):\n• బేసిక్: ₹1,200–1,600\n• స్టాండర్డ్: ₹1,600–2,200\n• ప్రీమియం: ₹2,200–3,000\n\n1000 చదరపు అడుగుల ఇంటికి: బేసిక్ ₹12–16 లక్షలు, స్టాండర్డ్ ₹16–22 లక్షలు.\nముంబై/ఢిల్లీ టయర్-2 నగరాల కంటే 30–40% అధిక ఖర్చు.",
    materials: "ప్రస్తుత సామగ్రి ధరలు (భారతదేశం):\n• సిమెంట్ (OPC 53): ₹350–420/బ్యాగ్ (50kg)\n• TMT స్టీల్: ₹55–68/కిలో\n• ఎర్ర ఇటుక: ₹7–12 ఒక్కొక్కటి\n• ఇసుక: ₹50–80/క్యూబిక్ అడుగు\n• మెటల్ (20mm): ₹40–60/క్యూబిక్ అడుగు\n• టైల్స్: ₹35–120/చదరపు అడుగు",
    workforce: "కూలీ రేటు (రోజుకు):\n• మేస్త్రి: ₹700–1,200\n• హెల్పర్: ₹450–700\n• వడ్రంగి: ₹700–1,100\n• ప్లంబర్: ₹600–1,000\n• ఎలక్ట్రీషియన్: ₹600–1,000\n\nకాంట్రాక్టర్ రేటు: ₹150–300/చదరపు అడుగు",
    vastu: "ముఖ్యమైన వాస్తు సూత్రాలు:\n• ప్రధాన తలుపు: తూర్పు లేదా ఉత్తరం\n• వంటగది: ఆగ్నేయ మూల\n• మాస్టర్ బెడ్‌రూమ్: నైరుతి\n• పూజ గది: ఈశాన్యం\n• నీటి వనరు: ఈశాన్యం\n• ఈశాన్యంలో మరుగుదొడ్డి వద్దు",
    default: "నేను ఈ విషయాలలో సహాయపడగలను:\n• నిర్మాణ ఖర్చు & బడ్జెట్ ప్లానింగ్\n• సామగ్రి & ప్రస్తుత ధరలు\n• కార్మికులు & కాంట్రాక్టర్ మార్గదర్శకత్వం\n• వాస్తు శాస్త్ర అనుగుణత\n• పర్యావరణ అనుకూల నిర్మాణం\n\nమీ ప్రశ్న అడగండి!",
  },
}

function getFallback(message: string, lang: string): string {
  const t = message.toLowerCase()
  const fb = fallbacks[lang] ?? fallbacks.en
  if (t.includes("cost") || t.includes("price") || t.includes("budget") || t.includes("rate") ||
      t.includes("lakh") || t.includes("rupee") || t.includes("ചെലവ") || t.includes("വില") ||
      t.includes("लागत") || t.includes("कीमत") || t.includes("ವೆಚ್ಚ") || t.includes("ಬೆಲೆ") ||
      t.includes("செலவ") || t.includes("விலை") || t.includes("ఖర్చ") || t.includes("ధర"))
    return fb.cost
  if (t.includes("material") || t.includes("cement") || t.includes("steel") || t.includes("brick") ||
      t.includes("sand") || t.includes("tile") || t.includes("സാമഗ്") || t.includes("സിമ") ||
      t.includes("सामग") || t.includes("सीमेंट") || t.includes("ಸಾಮಗ್ರಿ") || t.includes("ಸಿಮೆಂಟ್") ||
      t.includes("பொருட்") || t.includes("చామగ్రి") || t.includes("సిమెంట్"))
    return fb.materials
  if (t.includes("worker") || t.includes("labour") || t.includes("labor") || t.includes("mason") ||
      t.includes("contractor") || t.includes("workforce") || t.includes("തൊഴി") || t.includes("కూలీ") ||
      t.includes("मजदूर") || t.includes("ठेकेदार") || t.includes("ಕಾರ್ಮಿಕ") || t.includes("தொழிலாள"))
    return fb.workforce
  if (t.includes("vastu") || t.includes("vaastu") || t.includes("വാസ്") || t.includes("वास्तु") ||
      t.includes("ವಾಸ್ತು") || t.includes("வாஸ்து") || t.includes("వాస్తు"))
    return fb.vastu
  return fb.default
}

export async function POST(req: NextRequest) {
  try {
    const { message, lang } = await req.json()
    if (!message || !lang) {
      return NextResponse.json({ error: "Missing message or lang" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY?.trim()
    const langName = langNameMap[lang] ?? "English"

    // If no API key, return accurate fallback immediately
    if (!apiKey) {
      return NextResponse.json({ reply: getFallback(message, lang) })
    }

    const systemPrompt = `You are an expert AI Construction Assistant for India.

Answer questions about: construction costs, building materials with Indian prices, workforce/contractor rates, Vastu Shastra, eco-friendly construction, building permits, structural engineering, plumbing, electrical work.

LANGUAGE: Write your ENTIRE response in ${langName} only. Zero words in any other language.
PRICES: Always use ₹. Give real current Indian market rates.
LENGTH: Under 200 words. Be specific and practical.
OFF-TOPIC: If not construction-related, briefly say so in ${langName}.`

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
        max_tokens: 400,
        temperature: 0.3,
      }),
    })

    if (!groqRes.ok) {
      console.error("Groq error:", groqRes.status)
      return NextResponse.json({ reply: getFallback(message, lang) })
    }

    const data = await groqRes.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    return NextResponse.json({ reply: reply || getFallback(message, lang) })

  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json({ reply: getFallback("", "en") })
  }
}
