// Mock Blockchain Implementation for Ayurvedic Herb Traceability

export interface BlockchainEntry {
  id: string
  herbName: string
  location: string
  farmerId: string
  description: string
  timestamp: string
  batchId: string
  status: "pending" | "verified" | "rejected"
  labNotes?: string
  verificationDate?: string
  labId?: string
  blockHash?: string
  previousHash?: string
  nonce?: number
}

export interface Block {
  index: number
  timestamp: string
  data: BlockchainEntry
  previousHash: string
  hash: string
  nonce: number
}

export class MockBlockchain {
  private chain: Block[] = []
  private difficulty = 2 // Number of leading zeros required in hash

  constructor() {
    // Create genesis block
    this.chain = [this.createGenesisBlock()]
  }

  private createGenesisBlock(): Block {
    const genesisData: BlockchainEntry = {
      id: "genesis",
      herbName: "Genesis Block",
      location: "Blockchain Network",
      farmerId: "SYSTEM",
      description: "Initial block of the AyurTrace blockchain",
      timestamp: new Date().toISOString(),
      batchId: "GENESIS-BLOCK",
      status: "verified",
    }

    return {
      index: 0,
      timestamp: new Date().toISOString(),
      data: genesisData,
      previousHash: "0",
      hash: this.calculateHash(0, new Date().toISOString(), genesisData, "0", 0),
      nonce: 0,
    }
  }

  private calculateHash(
    index: number,
    timestamp: string,
    data: BlockchainEntry,
    previousHash: string,
    nonce: number,
  ): string {
    const dataString = JSON.stringify(data)
    const input = `${index}${timestamp}${dataString}${previousHash}${nonce}`

    // Simple hash function (in real blockchain, would use SHA-256)
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16).padStart(8, "0")
  }

  private mineBlock(block: Block): Block {
    const target = Array(this.difficulty + 1).join("0")

    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++
      block.hash = this.calculateHash(block.index, block.timestamp, block.data, block.previousHash, block.nonce)
    }

    return block
  }

  public addBlock(data: BlockchainEntry): Block {
    const previousBlock = this.getLatestBlock()
    const newBlock: Block = {
      index: previousBlock.index + 1,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        blockHash: "", // Will be set after mining
        previousHash: previousBlock.hash,
      },
      previousHash: previousBlock.hash,
      hash: "",
      nonce: 0,
    }

    // Mine the block (proof of work simulation)
    const minedBlock = this.mineBlock(newBlock)
    minedBlock.data.blockHash = minedBlock.hash

    this.chain.push(minedBlock)
    return minedBlock
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1]
  }

  public getBlockByBatchId(batchId: string): Block | null {
    return this.chain.find((block) => block.data.batchId === batchId) || null
  }

  public getAllEntries(): BlockchainEntry[] {
    return this.chain.slice(1).map((block) => block.data) // Exclude genesis block
  }

  public updateEntry(batchId: string, updates: Partial<BlockchainEntry>): Block | null {
    const blockIndex = this.chain.findIndex((block) => block.data.batchId === batchId)

    if (blockIndex === -1 || blockIndex === 0) {
      return null // Not found or trying to update genesis block
    }

    // In a real blockchain, you can't modify existing blocks
    // Here we simulate by creating a new block with updated data
    const originalBlock = this.chain[blockIndex]
    const updatedData: BlockchainEntry = {
      ...originalBlock.data,
      ...updates,
      timestamp: originalBlock.data.timestamp, // Keep original timestamp
    }

    // Create new block with updated data
    const newBlock = this.addBlock(updatedData)

    // Mark original block as superseded (in real blockchain, both would exist)
    this.chain[blockIndex].data.status = "pending" // Mark as superseded

    return newBlock
  }

  public validateChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      // Validate current block hash
      const calculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce,
      )

      if (currentBlock.hash !== calculatedHash) {
        return false
      }

      // Validate link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }

    return true
  }

  public getChainInfo() {
    return {
      length: this.chain.length,
      latestBlock: this.getLatestBlock(),
      isValid: this.validateChain(),
      difficulty: this.difficulty,
    }
  }
}

// Singleton instance for the mock blockchain
let blockchainInstance: MockBlockchain | null = null

export function getBlockchain(): MockBlockchain {
  if (!blockchainInstance) {
    blockchainInstance = new MockBlockchain()

    // Load existing data from localStorage if available
    if (typeof window !== "undefined") {
      const existingEntries = JSON.parse(localStorage.getItem("herbEntries") || "[]")
      existingEntries.forEach((entry: BlockchainEntry) => {
        blockchainInstance!.addBlock(entry)
      })
    }
  }

  return blockchainInstance
}

// Utility functions for blockchain operations
export const blockchainUtils = {
  addHerbEntry: (entry: BlockchainEntry): Block => {
    const blockchain = getBlockchain()
    const block = blockchain.addBlock(entry)

    // Sync with localStorage
    if (typeof window !== "undefined") {
      const allEntries = blockchain.getAllEntries()
      localStorage.setItem("herbEntries", JSON.stringify(allEntries))
    }

    return block
  },

  updateHerbEntry: (batchId: string, updates: Partial<BlockchainEntry>): Block | null => {
    const blockchain = getBlockchain()
    const block = blockchain.updateEntry(batchId, updates)

    // Sync with localStorage
    if (typeof window !== "undefined") {
      const allEntries = blockchain.getAllEntries()
      localStorage.setItem("herbEntries", JSON.stringify(allEntries))
    }

    return block
  },

  getHerbByBatchId: (batchId: string): BlockchainEntry | null => {
    const blockchain = getBlockchain()
    const block = blockchain.getBlockByBatchId(batchId)
    return block ? block.data : null
  },

  getAllHerbs: (): BlockchainEntry[] => {
    const blockchain = getBlockchain()
    return blockchain.getAllEntries()
  },

  getBlockchainInfo: () => {
    const blockchain = getBlockchain()
    return blockchain.getChainInfo()
  },

  validateBlockchain: (): boolean => {
    const blockchain = getBlockchain()
    return blockchain.validateChain()
  },
}
