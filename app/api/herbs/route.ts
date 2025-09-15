import { type NextRequest, NextResponse } from "next/server"
import { blockchainUtils, type BlockchainEntry } from "@/lib/blockchain"

// GET /api/herbs - Get all herb entries
export async function GET() {
  try {
    const herbs = blockchainUtils.getAllHerbs()
    return NextResponse.json({
      success: true,
      data: herbs,
      blockchain: blockchainUtils.getBlockchainInfo(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch herb entries",
      },
      { status: 500 },
    )
  }
}

// POST /api/herbs - Add new herb entry to blockchain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["herbName", "location", "farmerId", "batchId"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Check if batch ID already exists
    const existingHerb = blockchainUtils.getHerbByBatchId(body.batchId)
    if (existingHerb) {
      return NextResponse.json(
        {
          success: false,
          error: "Batch ID already exists",
        },
        { status: 409 },
      )
    }

    // Create new herb entry
    const herbEntry: BlockchainEntry = {
      id: Date.now().toString(),
      herbName: body.herbName,
      location: body.location,
      farmerId: body.farmerId,
      description: body.description || "",
      timestamp: new Date().toISOString(),
      batchId: body.batchId,
      status: "pending",
    }

    // Add to blockchain
    const block = blockchainUtils.addHerbEntry(herbEntry)

    return NextResponse.json({
      success: true,
      data: herbEntry,
      block: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add herb entry",
      },
      { status: 500 },
    )
  }
}
