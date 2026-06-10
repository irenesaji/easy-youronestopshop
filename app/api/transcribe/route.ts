import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

// Map ISO 639-1 codes to Whisper-compatible language values and script hints
// The prompt helps guide Whisper to output the correct script for South Indian languages
// that share similar phonetics (Malayalam, Tamil, Kannada, Telugu)
const whisperConfig: Record<string, { code: string; prompt: string }> = {
  en: { code: "en", prompt: "Transcribe this English speech" },
  hi: { code: "hi", prompt: "इस हिंदी भाषण को लिप्यंतरित करें" },
  kn: { code: "kn", prompt: "ಈ ಕನ್ನಡ ಭಾಷಣವನ್ನು ಲಿಪ್ಯಂತರಿಸಿ" },
  ml: { code: "ml", prompt: "ഈ മലയാളം സംഭാഷണം ലിപ്യന്തരണം ചെയ്യുക" },
  ta: { code: "ta", prompt: "இந்த தமிழ் பேச்சை எழுத்துப் பெயர்ப்பு செய்யவும்" },
  te: { code: "te", prompt: "ఈ తెలుగు ప్రసంగాన్ని లిప్యంతరీకరించండి" },
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
    }

    const formData = await req.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Get language from frontend
    const lang = ((formData.get("lang") as string) || "en").toLowerCase()

    // Convert File to Blob for the API
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Build form data for Groq Whisper API
    // IMPORTANT: Pass the language as a 2-letter ISO code to force correct language detection
    // Without language hint, Whisper confuses Malayalam <-> Tamil <-> Kannada
    const groqFormData = new FormData()
    groqFormData.append("file", audioBlob, audioFile.name || "audio.webm")
    groqFormData.append("model", "whisper-large-v3-turbo")
    groqFormData.append("response_format", "json")
    // Get language config for the selected language
    const config = whisperConfig[lang] || whisperConfig.en
    // Pass language as 2-letter ISO code to guide Whisper's detection
    groqFormData.append("language", config.code)
    // Add a short prompt in the target script to bias Whisper's output towards
    // the correct native script (e.g. Malayalam vs Tamil for similar-sounding speech)
    groqFormData.append("prompt", config.prompt)

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    })

    if (!groqRes.ok) {
      const errorText = await groqRes.text()
      console.error("Groq transcription error:", groqRes.status, errorText)
      return NextResponse.json({ error: "Transcription failed" }, { status: groqRes.status })
    }

    const data = await groqRes.json()
    return NextResponse.json({ text: data.text })
  } catch (err) {
    console.error("Transcribe API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}