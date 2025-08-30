// Execute data clearing - call this function to clear all sample data
import { clearAllDataExceptAdmins, showDataState } from './clearAllData';

// Show current state before clearing
console.log('=== BEFORE CLEARING ===');
showDataState();

// Execute the comprehensive data clearing
clearAllDataExceptAdmins();
