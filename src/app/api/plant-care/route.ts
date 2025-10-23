import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { plantType, issue, context } = await request.json()

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create detailed plant care prompt
    const carePrompt = `
    Provide detailed care instructions for a ${plantType}${issue ? ` that has ${issue}` : ''}.
    ${context ? `Additional context: ${context}` : ''}
    
    Include:
    1. Immediate actions to take
    2. Long-term care routine
    3. Prevention tips
    4. Warning signs to watch for
    5. Best practices for this specific plant
    
    Respond in JSON format:
    {
      "immediateActions": ["action1", "action2"],
      "longTermCare": ["care1", "care2"],
      "preventionTips": ["tip1", "tip2"],
      "warningSigns": ["sign1", "sign2"],
      "bestPractices": ["practice1", "practice2"],
      "wateringSchedule": "Weekly",
      "lightRequirements": "Bright indirect light",
      "fertilizerRecommendation": "Monthly during growing season"
    }
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert horticulturist and plant care specialist with deep knowledge of all plant species and their care requirements.'
        },
        {
          role: 'user',
          content: carePrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const aiResponse = completion.choices[0]?.message?.content

    let careData
    try {
      careData = JSON.parse(aiResponse || '{}')
    } catch (error) {
      // Fallback care data
      careData = {
        immediateActions: [
          'Check soil moisture',
          'Inspect for pests',
          'Ensure proper drainage'
        ],
        longTermCare: [
          'Water regularly but don\'t overwater',
          'Provide appropriate light',
          'Fertilize during growing season'
        ],
        preventionTips: [
          'Maintain consistent watering schedule',
          'Monitor for early signs of problems',
          'Keep plant area clean'
        ],
        warningSigns: [
          'Yellowing leaves',
          'Drooping stems',
          'Brown spots'
        ],
        bestPractices: [
          'Use well-draining soil',
          'Provide adequate humidity',
          'Rotate plant periodically'
        ],
        wateringSchedule: 'Weekly',
        lightRequirements: 'Bright indirect light',
        fertilizerRecommendation: 'Monthly during growing season'
      }
    }

    return NextResponse.json(careData)

  } catch (error) {
    console.error('Plant care API error:', error)
    
    return NextResponse.json({
      error: 'Failed to get plant care recommendations',
      immediateActions: ['Check soil moisture', 'Inspect for pests'],
      longTermCare: ['Water regularly', 'Provide proper light'],
      preventionTips: ['Maintain consistent care', 'Monitor health'],
      warningSigns: ['Watch for color changes', 'Check growth patterns'],
      bestPractices: ['Use quality soil', 'Ensure good drainage'],
      wateringSchedule: 'Weekly',
      lightRequirements: 'Bright indirect light',
      fertilizerRecommendation: 'Monthly during growing season'
    }, { status: 500 })
  }
}