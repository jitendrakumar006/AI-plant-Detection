import { NextRequest, NextResponse } from 'next/server'

// Mock plant data - in a real app, this would come from a database
let plants = [
  {
    id: '1',
    name: 'My Monstera',
    type: 'Monstera Deliciosa',
    age: '6 months',
    location: 'Living Room',
    lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextWatering: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    healthScore: 85,
    notes: 'Growing new leaves!'
  },
  {
    id: '2',
    name: 'Kitchen Snake',
    type: 'Snake Plant',
    age: '1 year',
    location: 'Kitchen',
    lastWatered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    healthScore: 92,
    notes: 'Very low maintenance'
  }
]

export async function GET() {
  return NextResponse.json(plants)
}

export async function POST(request: NextRequest) {
  try {
    const plantData = await request.json()
    
    const newPlant = {
      id: Date.now().toString(),
      ...plantData,
      age: 'New',
      lastWatered: new Date(),
      nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      healthScore: 100
    }
    
    plants.push(newPlant)
    
    return NextResponse.json(newPlant, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create plant' },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    
    const plantIndex = plants.findIndex(plant => plant.id === id)
    
    if (plantIndex === -1) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      )
    }
    
    plants[plantIndex] = { ...plants[plantIndex], ...updateData }
    
    return NextResponse.json(plants[plantIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update plant' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Plant ID is required' },
        { status: 400 }
      )
    }
    
    const plantIndex = plants.findIndex(plant => plant.id === id)
    
    if (plantIndex === -1) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      )
    }
    
    plants.splice(plantIndex, 1)
    
    return NextResponse.json({ message: 'Plant deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete plant' },
      { status: 400 }
    )
  }
}