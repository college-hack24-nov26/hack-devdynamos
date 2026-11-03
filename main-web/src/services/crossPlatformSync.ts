/**
 * Cross-Platform Synchronization Service
 * Synchronizes government wallet balance between Green Ledger India and Carbon Bloom Connect
 */

interface SyncEvent {
  type: 'balance_update';
  ccAmount: number;
  source: string;
  transactionHash: string;
  companyId: string;
  timestamp: string;
  operation: 'mint' | 'purchase';
}

class CrossPlatformSyncService {
  private static instance: CrossPlatformSyncService;
  private syncKey = 'carbon_platform_sync';
  private balanceKey = 'government_wallet_balance';
  private supplyKey = 'government_total_supply';
  private listeners: ((balance: number, supply: number) => void)[] = [];
  private isPolling = false;

  static getInstance(): CrossPlatformSyncService {
    if (!CrossPlatformSyncService.instance) {
      CrossPlatformSyncService.instance = new CrossPlatformSyncService();
    }
    return CrossPlatformSyncService.instance;
  }

  /**
   * Initialize the sync service
   */
  initialize(): void {
    // Check if values exist, if not set initial values
    const currentBalance = this.getGovernmentBalance();
    const currentSupply = this.getTotalSupply();
    
    if (currentBalance === null) {
      console.log('🔄 Setting initial government balance: 2,423 CC');
      this.setGovernmentBalance(2423); // Initial balance
    } else {
      console.log(`🔄 Found existing government balance: ${currentBalance.toLocaleString()} CC`);
    }
    
    if (currentSupply === null) {
      console.log('🔄 Setting initial total supply: 2,423 CC');
      this.setTotalSupply(2423); // Initial supply
    } else {
      console.log(`🔄 Found existing total supply: ${currentSupply.toLocaleString()} CC`);
    }

    // Start polling for sync events
    this.startPolling();
    
    console.log('🔄 Cross-platform sync service initialized');
    console.log(`📊 Current Balance: ${this.getGovernmentBalance()?.toLocaleString()} CC`);
    console.log(`📊 Current Supply: ${this.getTotalSupply()?.toLocaleString()} CC`);
  }

  /**
   * Get current government balance
   */
  getGovernmentBalance(): number | null {
    const balance = localStorage.getItem(this.balanceKey);
    return balance ? parseFloat(balance) : null;
  }

  /**
   * Get current total supply
   */
  getTotalSupply(): number | null {
    const supply = localStorage.getItem(this.supplyKey);
    return supply ? parseFloat(supply) : null;
  }

  /**
   * Set government balance
   */
  setGovernmentBalance(balance: number): void {
    localStorage.setItem(this.balanceKey, balance.toString());
    this.notifyListeners(balance, this.getTotalSupply() || balance);
  }

  /**
   * Set total supply
   */
  setTotalSupply(supply: number): void {
    localStorage.setItem(this.supplyKey, supply.toString());
    this.notifyListeners(this.getGovernmentBalance() || supply, supply);
  }

  /**
   * Process a balance update from another platform
   */
  processBalanceUpdate(ccAmount: number, source: string, transactionHash: string, type: 'mint' | 'purchase' = 'purchase'): void {
    const currentBalance = this.getGovernmentBalance() || 2423;
    const currentSupply = this.getTotalSupply() || 2423;
    
    let newBalance: number;
    let newSupply: number;
    
    if (type === 'mint') {
      // Minting ADDS to both balance and supply
      newBalance = currentBalance + ccAmount;
      newSupply = currentSupply + ccAmount;
      console.log(`🌱 Processing mint from ${source}`);
      console.log(`📊 Current balance: ${currentBalance} CC → New balance: ${newBalance} CC`);
      console.log(`📊 Current supply: ${currentSupply} CC → New supply: ${newSupply} CC`);
    } else {
      // Purchase DEDUCTS only from balance, supply stays the same
      newBalance = Math.max(0, currentBalance - ccAmount); // Ensure balance doesn't go negative
      newSupply = currentSupply; // Supply doesn't change on purchase
      console.log(`🔄 Processing purchase from ${source}`);
      console.log(`📊 Current balance: ${currentBalance} CC → New balance: ${newBalance} CC`);
      console.log(`📊 Supply unchanged: ${newSupply} CC`);
    }
    
    console.log(`🔗 Transaction: ${transactionHash}`);
    
    this.setGovernmentBalance(newBalance);
    this.setTotalSupply(newSupply);
    
    // Store the sync event for audit trail
    this.storeSyncEvent({
      type: 'balance_update',
      ccAmount,
      source,
      transactionHash,
      companyId: type === 'mint' ? 'government' : 'unknown',
      timestamp: new Date().toISOString(),
      operation: type
    });
  }

  /**
   * Listen for balance and supply changes
   */
  onBalanceChange(callback: (balance: number, supply: number) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove balance change listener
   */
  removeBalanceListener(callback: (balance: number, supply: number) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of balance/supply change
   */
  private notifyListeners(balance: number, supply: number): void {
    this.listeners.forEach(listener => {
      try {
        listener(balance, supply);
      } catch (error) {
        console.error('Error in balance change listener:', error);
      }
    });
  }

  /**
   * Store sync event for audit trail
   */
  private storeSyncEvent(event: SyncEvent): void {
    const events = this.getSyncEvents();
    events.unshift(event); // Add to beginning
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(100);
    }
    
    localStorage.setItem(this.syncKey, JSON.stringify(events));
  }

  /**
   * Get all sync events
   */
  getSyncEvents(): SyncEvent[] {
    const events = localStorage.getItem(this.syncKey);
    return events ? JSON.parse(events) : [];
  }

  /**
   * Start polling for sync events from Carbon Bloom Connect
   */
  private startPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    
    // Poll every 5 seconds for sync events
    setInterval(() => {
      this.checkForSyncEvents();
    }, 5000);
  }

  /**
   * Check for sync events from Carbon Bloom Connect
   */
  private async checkForSyncEvents(): Promise<void> {
    try {
      // Try to fetch sync events from Carbon Bloom Connect API
      const response = await fetch('http://localhost:3002/api/sync/government-balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // This is just a health check - actual sync happens via localStorage
        // In a production environment, you'd use WebSockets or Server-Sent Events
      }
    } catch (error) {
      // Silently fail - Carbon Bloom Connect might not be running
    }

    // Check localStorage for sync events from other tabs/windows
    this.checkLocalStorageSync();
  }

  /**
   * Check localStorage for sync events from other browser tabs
   */
  private checkLocalStorageSync(): void {
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'carbon_purchase_sync_event') {
        try {
          const syncData = JSON.parse(event.newValue || '{}');
          if (syncData.type === 'balance_update') {
            this.processBalanceUpdate(
              syncData.ccAmount,
              syncData.source,
              syncData.transactionHash,
              'purchase'
            );
          }
        } catch (error) {
          console.error('Error processing purchase sync event:', error);
        }
      } else if (event.key === 'carbon_mint_sync_event') {
        try {
          const syncData = JSON.parse(event.newValue || '{}');
          if (syncData.type === 'balance_update') {
            this.processBalanceUpdate(
              syncData.ccAmount,
              syncData.source,
              syncData.transactionHash,
              'mint'
            );
          }
        } catch (error) {
          console.error('Error processing mint sync event:', error);
        }
      }
    });
  }

  /**
   * Trigger a sync event for minting (called from Green Ledger India)
   */
  static triggerMintEvent(ccAmount: number, transactionHash: string, projectId: string): void {
    const syncData = {
      type: 'balance_update',
      ccAmount,
      source: 'green-ledger-india',
      transactionHash,
      companyId: projectId,
      timestamp: new Date().toISOString(),
      operation: 'mint' // Add operation type
    };

    // Store in localStorage to trigger sync across tabs
    localStorage.setItem('carbon_mint_sync_event', JSON.stringify(syncData));
    
    // Remove after a short delay to allow other tabs to process
    setTimeout(() => {
      localStorage.removeItem('carbon_mint_sync_event');
    }, 1000);
  }

  /**
   * Trigger a sync event for purchasing (called from Carbon Bloom Connect)
   */
  static triggerPurchaseEvent(ccAmount: number, transactionHash: string, companyId: string): void {
    const syncData = {
      type: 'balance_update',
      ccAmount,
      source: 'carbon-bloom-connect',
      transactionHash,
      companyId,
      timestamp: new Date().toISOString(),
      operation: 'purchase' // Add operation type
    };

    // Store in localStorage to trigger sync across tabs
    localStorage.setItem('carbon_purchase_sync_event', JSON.stringify(syncData));
    
    // Remove after a short delay to allow other tabs to process
    setTimeout(() => {
      localStorage.removeItem('carbon_purchase_sync_event');
    }, 1000);
  }
}

export const crossPlatformSync = CrossPlatformSyncService.getInstance();
export default crossPlatformSync;