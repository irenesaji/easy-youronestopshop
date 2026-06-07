import { NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ""
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

const langNameMap: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ml: "Malayalam",
  ta: "Tamil",
  te: "Telugu",
}

export async function POST(req: NextRequest) {
  try {
    const { message, lang } = await req.json()
    if (!message || !lang) {
      return NextResponse.json({ error: "Missing message or lang" }, { status: 400 })
    }

    const langName = langNameMap[lang] ?? "English"

    const systemPrompt = `You are an expert AI Construction Assistant specializing in the Indian construction industry.

You provide accurate, detailed answers about:
- Construction costs and budget estimation (region-wise rates across India)
- Building materials (cement, steel, bricks, sand, aggregate, tiles, paint) with current Indian market prices
- Workforce and contractors (daily wages, hiring tips, contractor rates in India)
- Vastu Shastra compliance for homes and buildings
- Eco-friendly and sustainable construction practices
- Building permits, approvals, and legal requirements in India
- Structural engineering basics (foundation types, RCC, load-bearing walls, slabs)
- Interior finishing, plumbing, and electrical work estimates

STRICT RULES:
1. You MUST respond ONLY in ${langName}. Every single word must be in ${langName}. Do NOT mix languages.
2. Give specific, accurate, practical answers with real numbers relevant to India.
3. Use ₹ for all prices. Mention Indian cities/regions where relevant.
4. Keep responses clear and concise (under 250 words).
5. If the question is unrelated to construction, politely say so in ${langName}.`

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 512,
        temperature: 0.4,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}))
      console.error("Groq error:", err)
      return NextResponse.json({ error: "Groq API failed" }, { status: 502 })
    }

    const data = await groqRes.json()
    const reply = data.choices?.[0]?.message?.content?.trim() ?? ""
    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
