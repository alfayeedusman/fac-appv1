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

// Sample booking data for demonstration
const sampleBookings: BookingRecord[] = [
  {
    id: "BK001",
    service: "VIP ProMax",
    vehicleType: "sedan",
    date: "2024-12-28",
    time: "02:00 PM",
    branch: "Tumaga Hub",
    notes: "Please pay attention to the wheels",
    status: "completed",
    createdAt: "2024-12-26T10:30:00Z",
    completedAt: "2024-12-28T15:30:00Z",
    price: "₱0",
    rating: 5,
    review:
      "Excellent service! The team was professional and my car looks amazing.",
    crew: ["John", "Mike", "Sarah"],
  },
  {
    id: "BK002",
    service: "Classic Wash",
    vehicleType: "suv",
    date: "2024-12-30",
    time: "10:00 AM",
    branch: "Boalan Hub",
    status: "confirmed",
    createdAt: "2024-12-27T14:20:00Z",
    price: "₱0",
  },
  {
    id: "BK003",
    service: "Premium Detail",
    vehicleType: "motorcycle",
    motorcycleType: "sport",
    date: "2025-01-02",
    time: "01:00 PM",
    branch: "Tumaga Hub",
    notes: "First time customer",
    status: "pending",
    createdAt: "2024-12-27T16:45:00Z",
    price: "₱0",
  },
];

export const getBookings = (): BookingRecord[] => {
  const stored = localStorage.getItem("fac_bookings");
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with sample data
  localStorage.setItem("fac_bookings", JSON.stringify(sampleBookings));
  return sampleBookings;
};

export const addBooking = (
  booking: Omit<BookingRecord, "id" | "createdAt" | "status">,
): BookingRecord => {
  const bookings = getBookings();
  const newBooking: BookingRecord = {
    ...booking,
    id: `BK${String(bookings.length + 1).padStart(3, "0")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  localStorage.setItem("fac_bookings", JSON.stringify(bookings));
  return newBooking;
};

export const updateBookingStatus = (
  id: string,
  status: BookingRecord["status"],
): void => {
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex((b) => b.id === id);
  if (bookingIndex !== -1) {
    bookings[bookingIndex].status = status;
    if (status === "completed") {
      bookings[bookingIndex].completedAt = new Date().toISOString();
    }
    localStorage.setItem("fac_bookings", JSON.stringify(bookings));
  }
};

export const addBookingRating = (
  id: string,
  rating: number,
  review?: string,
): void => {
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex((b) => b.id === id);
  if (bookingIndex !== -1) {
    bookings[bookingIndex].rating = rating;
    if (review) {
      bookings[bookingIndex].review = review;
    }
    localStorage.setItem("fac_bookings", JSON.stringify(bookings));
  }
};

export const cancelBooking = (id: string): void => {
  updateBookingStatus(id, "cancelled");
};

export const getBookingsByStatus = (
  status: BookingRecord["status"],
): BookingRecord[] => {
  return getBookings().filter((booking) => booking.status === status);
};

export const getRecentBookings = (limit: number = 5): BookingRecord[] => {
  return getBookings()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
};
