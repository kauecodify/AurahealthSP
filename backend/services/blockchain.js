/**
 * Simplified Blockchain for Audit Trail
 * Production: Replace with Hyperledger Fabric
 */

const crypto = require('crypto');

class AuditBlockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 2; // For demo purposes
    this.createGenesisBlock();
  }
  
  createGenesisBlock() {
    const genesis = {
      index: 0,
      timestamp: new Date().toISOString(),
      data: { 
        type: 'GENESIS', 
        message: 'AuraHealthSP Audit Chain Initialized',
        version: '1.0.0'
      },
      previousHash: '0',
      nonce: 0,
      hash: this.calculateHash(0, new Date().toISOString(), {}, '0', 0)
    };
    this.chain.push(genesis);
  }
  
  calculateHash(index, timestamp, data, previousHash, nonce) {
    return crypto
      .createHash('sha256')
      .update(`${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`)
      .digest('hex');
  }
  
  mineBlock(block) {
    // Simple PoW for demo
    while (!block.hash.startsWith('0'.repeat(this.difficulty))) {
      block.nonce++;
      block.hash = this.calculateHash(
        block.index, 
        block.timestamp, 
        block.data, 
        block.previousHash, 
        block.nonce
      );
    }
    return block;
  }
  
  addTransaction(type, payload, metadata = {}) {
    const transaction = {
      type,
      payload,
      meta {
        ...metadata,
        timestamp: new Date().toISOString(),
        nodeId: process.env.HOSTNAME || 'node-1'
      }
    };
    this.pendingTransactions.push(transaction);
    return transaction;
  }
  
  createBlock() {
    if (this.pendingTransactions.length === 0) return null;
    
    const previousBlock = this.chain[this.chain.length - 1];
    const block = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      transactions: [...this.pendingTransactions],
      previousHash: previousBlock.hash,
      nonce: 0,
      hash: ''
    };
    
    // Mine the block
    const minedBlock = this.mineBlock(block);
    this.chain.push(minedBlock);
    this.pendingTransactions = [];
    
    return minedBlock;
  }
  
  verifyChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      
      // Verify hash linkage
      if (current.previousHash !== previous.hash) {
        console.error(`❌ Block ${i}: Invalid previous hash`);
        return false;
      }
      
      // Verify block hash
      const validHash = this.calculateHash(
        current.index,
        current.timestamp,
        current.transactions,
        current.previousHash,
        current.nonce
      );
      if (current.hash !== validHash) {
        console.error(`❌ Block ${i}: Invalid hash`);
        return false;
      }
      
      // Verify PoW
      if (!current.hash.startsWith('0'.repeat(this.difficulty))) {
        console.error(`❌ Block ${i}: Invalid proof of work`);
        return false;
      }
    }
    return true;
  }
  
  getLatestBlocks(n = 5) {
    return [...this.chain].reverse().slice(0, n);
  }
  
  searchTransactions(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const block of this.chain) {
      for (const tx of block.transactions || []) {
        const txString = JSON.stringify(tx).toLowerCase();
        if (txString.includes(queryLower)) {
          results.push({ blockIndex: block.index, blockHash: block.hash, transaction: tx });
        }
      }
    }
    return results;
  }
  
  getStats() {
    return {
      totalBlocks: this.chain.length,
      totalTransactions: this.chain.reduce((acc, block) => acc + (block.transactions?.length || 0), 0),
      pendingTransactions: this.pendingTransactions.length,
      lastBlockTime: this.chain[this.chain.length - 1]?.timestamp,
      chainValid: this.verifyChain()
    };
  }
}

// Singleton instance
const auditChain = new AuditBlockchain();

// Wrapper functions for routes
function auditTransaction(type, payload, metadata = {}) {
  auditChain.addTransaction(type, payload, metadata);
  
  // Auto-mine every 10 transactions or after 30 seconds (demo)
  if (auditChain.pendingTransactions.length >= 10) {
    const block = auditChain.createBlock();
    return { success: true, blockHash: block?.hash, pending: false };
  }
  
  return { success: true, pending: true };
}

function forceMine() {
  const block = auditChain.createBlock();
  return block ? { success: true, blockHash: block.hash } : { success: false, reason: 'No pending transactions' };
}

module.exports = { 
  auditChain, 
  auditTransaction, 
  forceMine,
  AuditBlockchain 
};