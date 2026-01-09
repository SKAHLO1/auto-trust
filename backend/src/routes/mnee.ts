import express, { Request, Response } from 'express';
import mneeService from '../services/mnee.service';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

// Generate new mnemonic
router.post('/wallet/generate', (req: Request, res: Response) => {
  try {
    const mnemonic = mneeService.generateMnemonic();
    res.json({
      mnemonic,
      warning: 'Store this mnemonic securely. Never share it with anyone.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize HD Wallet
router.post('/wallet/initialize', (req: Request, res: Response) => {
  try {
    const { mnemonic } = req.body;
    
    if (!mnemonic) {
      return res.status(400).json({ error: 'Mnemonic required' });
    }

    mneeService.initializeWallet(mnemonic);
    res.json({ success: true, message: 'Wallet initialized successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Derive address from HD Wallet
router.post('/wallet/derive', (req: Request, res: Response) => {
  try {
    const { index, isChange } = req.body;
    
    if (index === undefined) {
      return res.status(400).json({ error: 'Index required' });
    }

    const wallet = mneeService.deriveAddress(index, isChange || false);
    
    // Return address but not private key for security
    res.json({
      address: wallet.address,
      index,
      isChange: isChange || false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Derive multiple addresses
router.post('/wallet/derive-multiple', async (req: Request, res: Response) => {
  try {
    const { startIndex, count, isChange } = req.body;
    
    if (startIndex === undefined || count === undefined) {
      return res.status(400).json({ error: 'startIndex and count required' });
    }

    const wallets = await mneeService.deriveAddresses(startIndex, count, isChange || false);
    
    // Return addresses but not private keys
    const addresses = wallets.map((w, i) => ({
      address: w.address,
      index: startIndex + i,
      isChange: isChange || false,
    }));

    res.json({ addresses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get balance for an address
router.get('/balance/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balance = await mneeService.getBalance(address);
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get balances for multiple addresses
router.post('/balances', async (req: Request, res: Response) => {
  try {
    const { addresses } = req.body;
    
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Addresses array required' });
    }

    const balances = await mneeService.getBalances(addresses);
    res.json({ balances });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get UTXOs for an address
router.get('/utxos/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page, size } = req.query;
    
    const utxos = await mneeService.getUtxos(
      address,
      page ? parseInt(page as string) : 0,
      size ? parseInt(size as string) : 10
    );
    
    res.json({ utxos, count: utxos.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all UTXOs for an address
router.get('/utxos/:address/all', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const utxos = await mneeService.getAllUtxos(address);
    res.json({ utxos, count: utxos.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get enough UTXOs for an amount
router.post('/utxos/enough', async (req: Request, res: Response) => {
  try {
    const { address, amount } = req.body;
    
    if (!address || amount === undefined) {
      return res.status(400).json({ error: 'Address and amount required' });
    }

    const utxos = await mneeService.getEnoughUtxos(address, amount);
    res.json({ utxos, count: utxos.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer MNEE tokens
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const { recipients, senderPrivateKey, broadcast, callbackUrl } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || !senderPrivateKey) {
      return res.status(400).json({ error: 'Recipients array and senderPrivateKey required' });
    }

    const result = await mneeService.transfer({
      recipients,
      senderPrivateKey,
      broadcast: broadcast !== false,
      callbackUrl,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction status
router.get('/transaction/status/:ticketId', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const status = await mneeService.getTransactionStatus(ticketId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/history/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { fromScore, limit } = req.query;
    
    const history = await mneeService.getTransactionHistory(
      address,
      fromScore ? parseInt(fromScore as string) : undefined,
      limit ? parseInt(limit as string) : 50
    );
    
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Parse transaction
router.get('/transaction/parse/:txid', async (req: Request, res: Response) => {
  try {
    const { txid } = req.params;
    const { includeRaw } = req.query;
    
    const parsed = await mneeService.parseTransaction(
      txid,
      includeRaw === 'true'
    );
    
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Validate transaction
router.post('/transaction/validate', async (req: Request, res: Response) => {
  try {
    const { rawTxHex, recipients } = req.body;
    
    if (!rawTxHex) {
      return res.status(400).json({ error: 'rawTxHex required' });
    }

    const isValid = await mneeService.validateTransaction(rawTxHex, recipients);
    res.json({ valid: isValid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit raw transaction
router.post('/transaction/submit', async (req: Request, res: Response) => {
  try {
    const { rawTxHex, callbackUrl } = req.body;
    
    if (!rawTxHex) {
      return res.status(400).json({ error: 'rawTxHex required' });
    }

    const result = await mneeService.submitRawTransaction(rawTxHex, callbackUrl);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get MNEE configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = await mneeService.getConfig();
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Convert amounts
router.post('/convert/to-atomic', (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    
    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount required' });
    }

    const atomicAmount = mneeService.toAtomicAmount(amount);
    res.json({ mnee: amount, atomic: atomicAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/convert/from-atomic', (req: Request, res: Response) => {
  try {
    const { atomicAmount } = req.body;
    
    if (atomicAmount === undefined) {
      return res.status(400).json({ error: 'Atomic amount required' });
    }

    const mneeAmount = mneeService.fromAtomicAmount(atomicAmount);
    res.json({ atomic: atomicAmount, mnee: mneeAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Scan addresses with gap limit
router.post('/wallet/scan', async (req: Request, res: Response) => {
  try {
    const { gapLimit, maxScan } = req.body;
    
    const discovered = await mneeService.scanAddressesWithGapLimit(
      gapLimit || 20,
      maxScan || 1000
    );
    
    res.json({
      receive: discovered.receive.map(w => ({ address: w.address })),
      change: discovered.change.map(w => ({ address: w.address })),
      totalReceive: discovered.receive.length,
      totalChange: discovered.change.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
