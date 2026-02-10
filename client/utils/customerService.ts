// Customer Service - Search and lookup customers

const API_BASE = "/api/supabase";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  qrCode?: string;
}

/**
 * Search for customers by ID, phone, name, or email
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    console.log(`🔍 Searching customers for: ${query}`);
    const response = await fetch(`${API_BASE}/customers/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error(`❌ Failed to search customers: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`✅ Found ${data.customers?.length || 0} customers`);
    
    return data.customers || [];
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
}

/**
 * Get all customers
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    console.log("📋 Fetching all customers...");
    const response = await fetch(`${API_BASE}/customers`);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch customers: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    const customers = data.users || [];
    
    // Map users to Customer format
    const mappedCustomers = customers.map((user: any) => ({
      id: user.id,
      name: user.fullName || user.name || "Unknown",
      email: user.email,
      phone: user.contactNumber || user.phone,
      qrCode: user.qrCode || `CUST-${user.id}`,
    }));

    console.log(`✅ Fetched ${mappedCustomers.length} customers`);
    return mappedCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

/**
 * Parse QR code data - handle different QR code formats
 */
export function parseQRCodeData(qrData: string): { type: string; value: string } {
  // Handle QR code formats: CUST-{id}, phone numbers, emails, customer IDs, etc.
  
  if (qrData.startsWith("CUST-")) {
    return { type: "customerId", value: qrData.replace("CUST-", "") };
  }
  
  if (qrData.includes("@")) {
    return { type: "email", value: qrData };
  }
  
  // Check if it looks like a phone number (digits only, 10-15 chars)
  if (/^\d{10,15}$/.test(qrData)) {
    return { type: "phone", value: qrData };
  }
  
  // Assume it's a customer ID
  return { type: "customerId", value: qrData };
}
