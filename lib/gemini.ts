import "server-only"

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
]

const TIMEOUT_MS = 15_000
const FALLBACK_DELAY_MS = 1_000

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] }
    finishReason?: string
  }[]
  promptFeedback?: { blockReason?: string }
  error?: { message: string; code: number }
}

type ModelResult =
  | { ok: true; text: string }
  | { ok: false; retry: true }
  | { ok: false; retry: false; error: Error }

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function isBusy(status: number, rawText: string): boolean {
  if (status === 429 || status === 500 || status === 503) return true
  const lower = rawText.toLowerCase()
  return lower.includes("model is busy") || lower.includes("overloaded") || lower.includes("quota")
}

async function tryModel(model: string, prompt: string, apiKey: string): Promise<ModelResult> {
  const endpoint = `${GEMINI_BASE}/${model}:generateContent`
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  let bodyText: string
  let body: GeminiResponse = {}

  try {
    res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: controller.signal,
    })
    bodyText = await res.text()
    try { body = JSON.parse(bodyText) } catch { /* non-JSON body */ }
  } catch {
    return { ok: false, retry: true }
  } finally {
    clearTimeout(tid)
  }

  if (res.status === 404 || isBusy(res.status, bodyText)) {
    return { ok: false, retry: true }
  }

  if (!res.ok) {
    return {
      ok: false,
      retry: false,
      error: new Error(`Gemini ${res.status}: ${body.error?.message ?? bodyText.slice(0, 300)}`),
    }
  }

  if (body.promptFeedback?.blockReason) {
    return { ok: false, retry: false, error: new Error(`Gemini blocked prompt: ${body.promptFeedback.blockReason}`) }
  }

  if (!body.candidates?.length) {
    return { ok: false, retry: false, error: new Error("Gemini malformed response: no candidates") }
  }

  const candidate = body.candidates[0]

  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    if (candidate.finishReason === "MAX_TOKENS") {
      if (process.env.NODE_ENV === "development") console.log(`[gemini] WARNING: MAX_TOKENS | model=${model}`)
    } else {
      return { ok: false, retry: false, error: new Error(`Gemini finish reason: ${candidate.finishReason}`) }
    }
  }

  if (!candidate.content?.parts?.length) {
    return { ok: false, retry: false, error: new Error("Gemini malformed response: no content parts") }
  }

  const text = candidate.content.parts[0]?.text
  if (!text) {
    return { ok: false, retry: false, error: new Error("Gemini malformed response: empty text") }
  }

  return { ok: true, text }
}

export async function generateContent(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    throw new Error("GEMINI_API_KEY not configured")
  }

  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    if (i > 0) await delay(FALLBACK_DELAY_MS)
    const model = GEMINI_MODELS[i]
    const result = await tryModel(model, prompt, apiKey)

    if (result.ok) {
      if (process.env.NODE_ENV === "development") console.log(`[gemini] success | model=${model} | chars=${result.text.length}`)
      return result.text
    }

    if (!result.retry) throw result.error
  }

  throw new Error("Our AI service is temporarily busy. Please try again in a moment.")
}
