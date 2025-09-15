import { type NextRequest, NextResponse } from "next/server"
import { blockchainUtils } from "@/lib/blockchain"

// GET /api/herbs/[batchId] - Get specific herb by batch ID
export async function GET(request: NextRequest, { params }: { params: { batchId: string } }) {
  try {
    const { batchId } = params
    const herb = blockchainUtils.getHerbByBatchId(batchId)

    if (!herb) {
      return NextResponse.json(
        {
          success: false,
          error: "Herb not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: herb,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch herb",
      },
      { status: 500 },
    )
  }
}

// PUT /api/herbs/[batchId] - Update herb entry (for lab verification)
export async function PUT(request: NextRequest, { params }: { params: { batchId: string } }) {
  try {
    const { batchId } = params
    const body = await request.json()

    // Check if herb exists
    const existingHerb = blockchainUtils.getHerbByBatchId(batchId)
    if (!existingHerb) {
      return NextResponse.json(
        {
          success: false,
          error: "Herb not found",
        },
        { status: 404 },
      )
    }

    // Validate status if provided
    if (body.status && !["pending", "verified", "rejected"].includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be 'pending', 'verified', or 'rejected'",
        },
        { status: 400 },
      )
    }

    // Update the entry
    const updates = {
      ...body,
      verificationDate: body.status ? new Date().toISOString() : existingHerb.verificationDate,
    }

    const updatedBlock = blockchainUtils.updateHerbEntry(batchId, updates)

    if (!updatedBlock) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update herb entry",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedBlock.data,
      block: {
        index: updatedBlock.index,
        hash: updatedBlock.hash,
        previousHash: updatedBlock.previousHash,
        timestamp: updatedBlock.timestamp,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update herb entry",
      },
      { status: 500 },
    )
  }
}
