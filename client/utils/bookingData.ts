// This file is deprecated - all booking data now comes from the database
// Keeping only the type definitions for backward compatibility

export interface BookingRecord {
  id: string;
  service: string;
  vehicleType: string;
  motorcycleType?: string;
  date: string;
  time: string;
  branch: string;
  notes?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  completedAt?: string;
  price: string;
  rating?: number;
  review?: string;
  crew?: string[];
}

// DEPRECATED: Use supabaseDbClient.getBookings() instead
// This function only exists for backward compatibility and will be removed
export const getBookings = (): BookingRecord[] => {
  console.warn('⚠️ DEPRECATED: getBookings() from bookingData.ts is deprecated. Use supabaseDbClient.getBookings() instead.');
  return [];
};

// DEPRECATED: Use supabaseDbClient.createBooking() instead
export const addBooking = (
  booking: Omit<BookingRecord, "id" | "createdAt" | "status">,
): BookingRecord => {
  console.warn('⚠️ DEPRECATED: addBooking() from bookingData.ts is deprecated. Use supabaseDbClient.createBooking() instead.');
  const newBooking: BookingRecord = {
    ...booking,
    id: `TEMP-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  return newBooking;
};

// DEPRECATED: Use supabaseDbClient.updateBooking() instead
export const updateBookingStatus = (
  id: string,
  status: BookingRecord["status"],
): void => {
  console.warn('⚠️ DEPRECATED: updateBookingStatus() from bookingData.ts is deprecated. Use supabaseDbClient.updateBooking() instead.');
};

// DEPRECATED: Use supabaseDbClient.updateBooking() instead
export const addBookingRating = (
  id: string,
  rating: number,
  review?: string,
): void => {
  console.warn('⚠️ DEPRECATED: addBookingRating() from bookingData.ts is deprecated. Use supabaseDbClient.updateBooking() instead.');
};

// DEPRECATED: Use supabaseDbClient.updateBooking() instead
export const cancelBooking = (id: string): void => {
  console.warn('⚠️ DEPRECATED: cancelBooking() from bookingData.ts is deprecated. Use supabaseDbClient.updateBooking() instead.');
};

// DEPRECATED: Use supabaseDbClient.getBookings() with filter instead
export const getBookingsByStatus = (
  status: BookingRecord["status"],
): BookingRecord[] => {
  console.warn('⚠️ DEPRECATED: getBookingsByStatus() from bookingData.ts is deprecated. Use supabaseDbClient.getBookings() with filter instead.');
  return [];
};

// DEPRECATED: Use supabaseDbClient.getBookings() with limit instead
export const getRecentBookings = (limit: number = 5): BookingRecord[] => {
  console.warn('⚠️ DEPRECATED: getRecentBookings() from bookingData.ts is deprecated. Use supabaseDbClient.getBookings() with limit instead.');
  return [];
};
