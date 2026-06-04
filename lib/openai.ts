import OpenAI from 'openai'

const client = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://drift.vercel.app',
        'X-Title': 'DRIFT',
      },
    })
  : new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const MODEL = process.env.OPENROUTER_MODEL ?? 'gpt-4o-mini'

export async function generateCorrectionCard(
  specFeature: string,
  driftType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  novusData: any,
  specContext: string
) {
  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `You are a senior product manager analyzing a product drift.

PRODUCT SPEC CONTEXT:
${specContext}

FEATURE: "${specFeature}"
DRIFT TYPE: ${driftType}
NOVUS DATA: ${JSON.stringify(novusData)}

Generate a correction card with exactly these fields:
1. title: A punchy, PM-style headline (max 8 words)
2. user_story: "As a [user], I want [action] so that [outcome]" format
3. copy_rewrite: Specific UI copy suggestion (1 sentence)
4. mockup_suggestion: A 1-sentence description of what the UI should look like instead
5. priority: critical, high, medium, or low

Rules:
- Be specific. No generic advice like "improve UX."
- Reference the actual Novus data numbers.
- Write like a Slack message to a founder, not a consultant report.
- Keep each field under 150 characters.

Respond in JSON format.`,
      },
    ],
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('Empty response from OpenRouter')
  return JSON.parse(content)
}
