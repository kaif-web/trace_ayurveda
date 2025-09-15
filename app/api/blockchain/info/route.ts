import { NextResponse } from "next/server"
import { blockchainUtils } from "@/lib/blockchain"

// GET /api/blockchain/info - Get blockchain information
export async function GET() {
  try {
    const info = blockchainUtils.getBlockchainInfo()
    const isValid = blockchainUtils.validateBlockchain()

    return NextResponse.json({
      success: true,
      blockchain: {
        ...info,
        isValid,
        network: "AyurTrace Testnet",
        consensus: "Proof of Work (Simulated)",
        description: "Mock blockchain for Ayurvedic herb traceability",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blockchain info",
      },
      { status: 500 },
    )
  }
}
