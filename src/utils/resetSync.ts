/**
 * Utility to reset synchronization state for testing
 */

export const resetSyncState = () => {
  // Clear ALL localStorage items related to carbon credits
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('carbon') || key.includes('government') || key.includes('balance') || key.includes('supply'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Reset government balance and supply to initial values
  localStorage.setItem('government_wallet_balance', '2423');
  localStorage.setItem('government_total_supply', '2423');
  
  console.log('🔄 Sync state reset to initial values:');
  console.log('📊 Government Balance: 2,423 CC');
  console.log('📊 Total Supply: 2,423 CC');
  console.log('🗑️ Cleared keys:', keysToRemove);
  
  // Trigger a page refresh to update the UI
  window.location.reload();
};

export const debugSyncState = () => {
  console.log('🔍 Current localStorage state:');
  const balance = localStorage.getItem('government_wallet_balance');
  const supply = localStorage.getItem('government_total_supply');
  const syncEvents = localStorage.getItem('carbon_platform_sync');
  
  console.log('📊 Balance:', balance);
  console.log('📊 Supply:', supply);
  console.log('📋 Sync Events:', syncEvents ? JSON.parse(syncEvents).length : 0);
  
  // Show all carbon-related keys
  const carbonKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('carbon') || key.includes('government') || key.includes('balance') || key.includes('supply'))) {
      carbonKeys.push({ key, value: localStorage.getItem(key) });
    }
  }
  console.table(carbonKeys);
};

// Make them available globally for testing
(window as any).resetSyncState = resetSyncState;
(window as any).debugSyncState = debugSyncState;