import { Booking, User, CrewAssignment, BookingStatusUpdate } from './databaseSchema';

// Sample crew members data
export const initializeSampleCrewMembers = () => {
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  const sampleCrewMembers = [
    {
      id: 'crew_001',
      fullName: 'Juan Cruz',
      email: 'juan.cruz@fayeedautocare.com',
      password: 'crew123',
      role: 'crew' as const,
      permissions: [
        'field.update_status',
        'field.upload_photos',
        'field.collect_signature',
        'field.update_location',
        'field.accept_assignments',
        'field.reject_assignments',
        'bookings.view_assigned',
        'bookings.update_status',
      ],
      status: 'active' as const,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      contactNumber: '+63 999 111 0001',
      address: 'Tumaga, Zamboanga City',
      carUnit: 'Service Vehicle 1',
      carPlateNumber: 'FAC-001',
      carType: 'Van',
      branchLocation: 'Tumaga Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: 'basic' as const,
      // Crew specific fields
      crewSkills: ['exterior_wash', 'interior_detail', 'engine_detail'],
      crewStatus: 'available' as const,
      crewRating: 4.8,
      crewExperience: 3,
    },
    {
      id: 'crew_002',
      fullName: 'Maria Santos',
      email: 'maria.santos@fayeedautocare.com',
      password: 'crew123',
      role: 'crew' as const,
      permissions: [
        'field.update_status',
        'field.upload_photos',
        'field.collect_signature',
        'field.update_location',
        'field.accept_assignments',
        'field.reject_assignments',
        'bookings.view_assigned',
        'bookings.update_status',
      ],
      status: 'active' as const,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
      contactNumber: '+63 999 111 0002',
      address: 'Boalan, Zamboanga City',
      carUnit: 'Service Vehicle 2',
      carPlateNumber: 'FAC-002',
      carType: 'Motorcycle',
      branchLocation: 'Boalan Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: 'basic' as const,
      // Crew specific fields
      crewSkills: ['motorcycle_wash', 'coating', 'detailing'],
      crewStatus: 'busy' as const,
      currentAssignment: 'BOOK_003',
      crewRating: 4.9,
      crewExperience: 5,
    },
    {
      id: 'crew_003',
      fullName: 'Carlos Mendoza',
      email: 'carlos.mendoza@fayeedautocare.com',
      password: 'crew123',
      role: 'crew' as const,
      permissions: [
        'field.update_status',
        'field.upload_photos',
        'field.collect_signature',
        'field.update_location',
        'field.accept_assignments',
        'field.reject_assignments',
        'bookings.view_assigned',
        'bookings.update_status',
      ],
      status: 'active' as const,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      contactNumber: '+63 999 111 0003',
      address: 'Tetuan, Zamboanga City',
      carUnit: 'Service Vehicle 3',
      carPlateNumber: 'FAC-003',
      carType: 'Pickup',
      branchLocation: 'Tetuan Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: 'basic' as const,
      // Crew specific fields
      crewSkills: ['exterior_wash', 'premium_detail', 'graphene_coating'],
      crewStatus: 'available' as const,
      crewRating: 4.7,
      crewExperience: 2,
    },
    {
      id: 'crew_004',
      fullName: 'Ana Reyes',
      email: 'ana.reyes@fayeedautocare.com',
      password: 'crew123',
      role: 'crew' as const,
      permissions: [
        'field.update_status',
        'field.upload_photos',
        'field.collect_signature',
        'field.update_location',
        'field.accept_assignments',
        'field.reject_assignments',
        'bookings.view_assigned',
        'bookings.update_status',
      ],
      status: 'active' as const,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      contactNumber: '+63 999 111 0004',
      address: 'Ayala, Zamboanga City',
      carUnit: 'Service Vehicle 4',
      carPlateNumber: 'FAC-004',
      carType: 'SUV',
      branchLocation: 'Ayala Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: 'basic' as const,
      // Crew specific fields
      crewSkills: ['interior_detail', 'seat_cleaning', 'dashboard_detail'],
      crewStatus: 'offline' as const,
      crewRating: 4.6,
      crewExperience: 1,
    },
  ];

  // Check if crew members already exist
  const existingCrewEmails = existingUsers.map((user: any) => user.email);
  const newCrewMembers = sampleCrewMembers.filter(crew => !existingCrewEmails.includes(crew.email));

  if (newCrewMembers.length > 0) {
    const updatedUsers = [...existingUsers, ...newCrewMembers];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    console.log(`✅ Added ${newCrewMembers.length} sample crew members`);
  } else {
    console.log('ℹ️ Sample crew members already exist');
  }

  return sampleCrewMembers;
};

// Sample bookings with various statuses and crew assignments
export const initializeSampleBookings = () => {
  const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  
  if (existingBookings.length > 0) {
    console.log('ℹ️ Sample bookings already exist');
    return existingBookings;
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const sampleBookings: Booking[] = [
    // Completed booking with crew assignment
    {
      id: 'BOOK_001',
      userId: 'user_sample_001',
      type: 'registered',
      category: 'carwash',
      service: 'VIP ProMax',
      unitType: 'car',
      unitSize: 'sedan',
      plateNumber: 'ABC-1234',
      date: yesterday,
      timeSlot: '09:00 AM',
      branch: 'Tumaga Hub',
      estimatedDuration: 90,
      basePrice: 399,
      totalPrice: 399,
      currency: 'PHP',
      paymentMethod: 'branch',
      paymentStatus: 'paid',
      status: 'completed',
      confirmationCode: 'FAC001',
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
      startedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      assignedCrew: ['crew_001', 'crew_003'],
      crewNotes: 'Customer was very satisfied. Premium coating applied.',
      qualityRating: 5,
      customerFeedback: 'Excellent service! Will definitely book again.',
      crewStartTime: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      crewArrivalTime: new Date(now.getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
      crewCompletionTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 39,
    },
    
    // In progress booking
    {
      id: 'BOOK_002',
      userId: 'user_sample_002',
      type: 'registered',
      category: 'carwash',
      service: 'Classic Wash',
      unitType: 'car',
      unitSize: 'suv',
      plateNumber: 'XYZ-5678',
      date: today,
      timeSlot: '10:00 AM',
      branch: 'Boalan Hub',
      estimatedDuration: 60,
      basePrice: 299,
      totalPrice: 299,
      currency: 'PHP',
      paymentMethod: 'branch',
      paymentStatus: 'pending',
      status: 'washing',
      confirmationCode: 'FAC002',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      startedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      assignedCrew: ['crew_002'],
      crewNotes: 'Currently washing exterior. Customer requested extra attention to wheels.',
      crewStartTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      crewArrivalTime: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },

    // Crew assigned and going to location
    {
      id: 'BOOK_003',
      userId: 'user_sample_003',
      type: 'registered',
      category: 'carwash',
      service: 'Premium Detail',
      unitType: 'motorcycle',
      unitSize: 'big_bike',
      plateNumber: 'MTO-9999',
      date: today,
      timeSlot: '02:00 PM',
      branch: 'Tetuan Hub',
      estimatedDuration: 45,
      basePrice: 199,
      totalPrice: 199,
      currency: 'PHP',
      paymentMethod: 'online',
      paymentStatus: 'paid',
      status: 'crew_going',
      confirmationCode: 'FAC003',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      assignedCrew: ['crew_002'],
      crewNotes: 'On the way to customer location. ETA 15 minutes.',
      specialRequests: 'Please be gentle with the custom paint job',
    },

    // Crew assigned, confirmed booking
    {
      id: 'BOOK_004',
      guestInfo: {
        firstName: 'Jose',
        lastName: 'Garcia',
        email: 'jose.garcia@email.com',
        phone: '+63 999 888 7777',
      },
      type: 'guest',
      category: 'carwash',
      service: 'VIP ProMax',
      unitType: 'car',
      unitSize: 'pickup',
      plateNumber: 'GGG-1111',
      date: today,
      timeSlot: '04:00 PM',
      branch: 'Tumaga Hub',
      estimatedDuration: 90,
      basePrice: 449,
      totalPrice: 449,
      currency: 'PHP',
      paymentMethod: 'branch',
      paymentStatus: 'pending',
      status: 'crew_assigned',
      confirmationCode: 'FAC004',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      assignedCrew: ['crew_001', 'crew_003'],
      notes: 'Guest booking for premium service',
    },

    // Pending booking awaiting crew assignment
    {
      id: 'BOOK_005',
      userId: 'user_sample_004',
      type: 'registered',
      category: 'auto_detailing',
      service: 'Full Interior Detail',
      unitType: 'car',
      unitSize: 'van_small',
      plateNumber: 'VAN-2022',
      date: tomorrow,
      timeSlot: '08:00 AM',
      branch: 'Ayala Hub',
      estimatedDuration: 120,
      basePrice: 599,
      totalPrice: 599,
      currency: 'PHP',
      paymentMethod: 'online',
      paymentStatus: 'paid',
      status: 'confirmed',
      confirmationCode: 'FAC005',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      specialRequests: 'Family van with child seats - please be careful',
    },

    // Future booking
    {
      id: 'BOOK_006',
      userId: 'user_sample_005',
      type: 'registered',
      category: 'graphene_coating',
      service: 'Graphene Pro Coating',
      unitType: 'car',
      unitSize: 'sedan',
      plateNumber: 'LUX-7777',
      date: dayAfterTomorrow,
      timeSlot: '10:00 AM',
      branch: 'Tumaga Hub',
      estimatedDuration: 180,
      basePrice: 2999,
      totalPrice: 2999,
      currency: 'PHP',
      paymentMethod: 'online',
      paymentStatus: 'paid',
      status: 'confirmed',
      confirmationCode: 'FAC006',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      specialRequests: 'Premium luxury vehicle - highest quality coating required',
    },

    // Cancelled booking
    {
      id: 'BOOK_007',
      userId: 'user_sample_006',
      type: 'registered',
      category: 'carwash',
      service: 'Classic Wash',
      unitType: 'motorcycle',
      unitSize: 'regular',
      plateNumber: 'MC-1234',
      date: today,
      timeSlot: '12:00 PM',
      branch: 'Boalan Hub',
      estimatedDuration: 30,
      basePrice: 149,
      totalPrice: 149,
      currency: 'PHP',
      paymentMethod: 'branch',
      paymentStatus: 'pending',
      status: 'cancelled',
      confirmationCode: 'FAC007',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      confirmedAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      cancelledAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      cancellationReason: 'Customer emergency - rescheduling for next week',
    },
  ];

  localStorage.setItem('bookings', JSON.stringify(sampleBookings));
  console.log(`✅ Created ${sampleBookings.length} sample bookings`);
  return sampleBookings;
};

// Initialize crew assignments
export const initializeSampleCrewAssignments = () => {
  const existingAssignments = JSON.parse(localStorage.getItem('crew_assignments') || '[]');
  
  if (existingAssignments.length > 0) {
    console.log('ℹ️ Sample crew assignments already exist');
    return existingAssignments;
  }

  const now = new Date();
  const sampleAssignments: CrewAssignment[] = [
    {
      id: 'ASSIGN_001',
      bookingId: 'BOOK_001',
      crewId: 'crew_001',
      assignedBy: 'manager_fayeed',
      assignedAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(now.getTime() - 25.5 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      notes: 'Primary crew for VIP service',
    },
    {
      id: 'ASSIGN_002',
      bookingId: 'BOOK_001',
      crewId: 'crew_003',
      assignedBy: 'manager_fayeed',
      assignedAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(now.getTime() - 25.5 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      notes: 'Support crew for coating application',
    },
    {
      id: 'ASSIGN_003',
      bookingId: 'BOOK_002',
      crewId: 'crew_002',
      assignedBy: 'manager_fayeed',
      assignedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      status: 'accepted',
      notes: 'Solo assignment for standard wash',
    },
    {
      id: 'ASSIGN_004',
      bookingId: 'BOOK_003',
      crewId: 'crew_002',
      assignedBy: 'manager_fayeed',
      assignedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      status: 'accepted',
      notes: 'Motorcycle specialist assignment',
    },
    {
      id: 'ASSIGN_005',
      bookingId: 'BOOK_004',
      crewId: 'crew_001',
      assignedBy: 'manager_fayeed',
      assignedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      status: 'accepted',
      notes: 'Lead crew for guest VIP service',
    },
    {
      id: 'ASSIGN_006',
      bookingId: 'BOOK_004',
      crewId: 'crew_003',
      assignedBy: 'manager_fayeed',
      assignedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      status: 'accepted',
      notes: 'Support crew for VIP service',
    },
  ];

  localStorage.setItem('crew_assignments', JSON.stringify(sampleAssignments));
  console.log(`✅ Created ${sampleAssignments.length} sample crew assignments`);
  return sampleAssignments;
};

// Initialize booking status updates
export const initializeSampleStatusUpdates = () => {
  const existingUpdates = JSON.parse(localStorage.getItem('booking_status_updates') || '[]');
  
  if (existingUpdates.length > 0) {
    console.log('ℹ️ Sample status updates already exist');
    return existingUpdates;
  }

  const now = new Date();
  const sampleStatusUpdates: BookingStatusUpdate[] = [
    // BOOK_001 status history (completed)
    {
      id: 'STATUS_001',
      bookingId: 'BOOK_001',
      status: 'pending',
      updatedBy: 'system',
      updatedByRole: 'admin',
      timestamp: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      notes: 'Booking created',
    },
    {
      id: 'STATUS_002',
      bookingId: 'BOOK_001',
      status: 'confirmed',
      updatedBy: 'manager_fayeed',
      updatedByRole: 'manager',
      timestamp: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
      notes: 'Booking confirmed by manager',
    },
    {
      id: 'STATUS_003',
      bookingId: 'BOOK_001',
      status: 'crew_assigned',
      updatedBy: 'manager_fayeed',
      updatedByRole: 'manager',
      timestamp: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
      notes: 'Crew assigned: Juan Cruz, Carlos Mendoza',
    },
    {
      id: 'STATUS_004',
      bookingId: 'BOOK_001',
      status: 'crew_going',
      updatedBy: 'crew_001',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      notes: 'Crew en route to customer location',
      location: {
        latitude: 6.9214,
        longitude: 122.0790,
        address: 'Tumaga, Zamboanga City',
      },
    },
    {
      id: 'STATUS_005',
      bookingId: 'BOOK_001',
      status: 'crew_arrived',
      updatedBy: 'crew_001',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
      notes: 'Crew arrived at customer location',
      location: {
        latitude: 6.9214,
        longitude: 122.0790,
        address: 'Customer Location, Tumaga',
      },
    },
    {
      id: 'STATUS_006',
      bookingId: 'BOOK_001',
      status: 'washing',
      updatedBy: 'crew_001',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      notes: 'Started washing service',
    },
    {
      id: 'STATUS_007',
      bookingId: 'BOOK_001',
      status: 'completed',
      updatedBy: 'crew_001',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Service completed successfully',
    },

    // BOOK_002 status history (in progress)
    {
      id: 'STATUS_008',
      bookingId: 'BOOK_002',
      status: 'pending',
      updatedBy: 'system',
      updatedByRole: 'admin',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      notes: 'Booking created',
    },
    {
      id: 'STATUS_009',
      bookingId: 'BOOK_002',
      status: 'confirmed',
      updatedBy: 'manager_fayeed',
      updatedByRole: 'manager',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      notes: 'Booking confirmed',
    },
    {
      id: 'STATUS_010',
      bookingId: 'BOOK_002',
      status: 'crew_assigned',
      updatedBy: 'manager_fayeed',
      updatedByRole: 'manager',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      notes: 'Crew assigned: Maria Santos',
    },
    {
      id: 'STATUS_011',
      bookingId: 'BOOK_002',
      status: 'crew_going',
      updatedBy: 'crew_002',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      notes: 'On the way to customer',
    },
    {
      id: 'STATUS_012',
      bookingId: 'BOOK_002',
      status: 'crew_arrived',
      updatedBy: 'crew_002',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      notes: 'Arrived at customer location',
    },
    {
      id: 'STATUS_013',
      bookingId: 'BOOK_002',
      status: 'washing',
      updatedBy: 'crew_002',
      updatedByRole: 'crew',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      notes: 'Started washing service',
    },
  ];

  localStorage.setItem('booking_status_updates', JSON.stringify(sampleStatusUpdates));
  console.log(`✅ Created ${sampleStatusUpdates.length} sample status updates`);
  return sampleStatusUpdates;
};

// Initialize sample customer data for the bookings
export const initializeSampleCustomers = () => {
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  const sampleCustomerIds = [
    'user_sample_001',
    'user_sample_002',
    'user_sample_003',
    'user_sample_004',
    'user_sample_005',
    'user_sample_006',
  ];

  const existingCustomers = existingUsers.filter((user: any) => 
    sampleCustomerIds.includes(user.id)
  );

  if (existingCustomers.length === sampleCustomerIds.length) {
    console.log('ℹ️ Sample customers already exist');
    return existingCustomers;
  }

  const sampleCustomers = [
    {
      id: 'user_sample_001',
      fullName: 'Robert Chen',
      email: 'robert.chen@email.com',
      password: 'customer123',
      role: 'user',
      permissions: [],
      status: 'active',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+63 999 222 0001',
      address: '123 Tumaga Road, Zamboanga City',
      carUnit: 'Toyota Camry',
      carPlateNumber: 'ABC-1234',
      carType: 'Sedan',
      branchLocation: 'Tumaga Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 150,
      subscriptionStatus: 'premium',
    },
    {
      id: 'user_sample_002',
      fullName: 'Sarah Mitchell',
      email: 'sarah.mitchell@email.com',
      password: 'customer123',
      role: 'user',
      permissions: [],
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+63 999 222 0002',
      address: '456 Boalan Street, Zamboanga City',
      carUnit: 'Honda CR-V',
      carPlateNumber: 'XYZ-5678',
      carType: 'SUV',
      branchLocation: 'Boalan Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 89,
      subscriptionStatus: 'basic',
    },
    {
      id: 'user_sample_003',
      fullName: 'Miguel Rodriguez',
      email: 'miguel.rodriguez@email.com',
      password: 'customer123',
      role: 'user',
      permissions: [],
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+63 999 222 0003',
      address: '789 Tetuan Avenue, Zamboanga City',
      carUnit: 'Yamaha R1',
      carPlateNumber: 'MTO-9999',
      carType: 'Motorcycle',
      branchLocation: 'Tetuan Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 45,
      subscriptionStatus: 'basic',
    },
    {
      id: 'user_sample_004',
      fullName: 'Linda Johnson',
      email: 'linda.johnson@email.com',
      password: 'customer123',
      role: 'user',
      permissions: [],
      status: 'active',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+63 999 222 0004',
      address: '321 Ayala Drive, Zamboanga City',
      carUnit: 'Toyota Hiace',
      carPlateNumber: 'VAN-2022',
      carType: 'Van',
      branchLocation: 'Ayala Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 25,
      subscriptionStatus: 'vip',
    },
    {
      id: 'user_sample_005',
      fullName: 'David Kim',
      email: 'david.kim@email.com',
      password: 'customer123',
      role: 'user',
      permissions: [],
      status: 'active',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+63 999 222 0005',
      address: '654 Luxury Village, Zamboanga City',
      carUnit: 'BMW 3 Series',
      carPlateNumber: 'LUX-7777',
      carType: 'Sedan',
      branchLocation: 'Tumaga Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 500,
      subscriptionStatus: 'vip',
    },
    {
      id: 'user_sample_006',
      fullName: 'Emma Davis',
      email: 'emma.davis@email.com',
      password: 'customer123',
      role: 'user',
      permissions: [],
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+63 999 222 0006',
      address: '987 Boalan Heights, Zamboanga City',
      carUnit: 'Honda PCX',
      carPlateNumber: 'MC-1234',
      carType: 'Motorcycle',
      branchLocation: 'Boalan Hub',
      profileImage: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      loyaltyPoints: 78,
      subscriptionStatus: 'basic',
    },
  ];

  // Filter out existing customers
  const existingUserIds = existingUsers.map((user: any) => user.id);
  const newCustomers = sampleCustomers.filter(customer => !existingUserIds.includes(customer.id));

  if (newCustomers.length > 0) {
    const updatedUsers = [...existingUsers, ...newCustomers];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    console.log(`✅ Added ${newCustomers.length} sample customers`);
  } else {
    console.log('ℹ️ Sample customers already exist');
  }

  return sampleCustomers;
};

// Main initialization function
export const initializeAllSampleData = () => {
  console.log('🚀 Initializing sample booking data...');
  
  try {
    initializeSampleCustomers();
    initializeSampleCrewMembers();
    initializeSampleBookings();
    initializeSampleCrewAssignments();
    initializeSampleStatusUpdates();
    
    console.log('✅ Sample booking data initialization completed!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    return false;
  }
};

// Helper function to reset all sample data
export const resetSampleBookingData = () => {
  localStorage.removeItem('bookings');
  localStorage.removeItem('crew_assignments');
  localStorage.removeItem('booking_status_updates');
  
  // Remove sample users (customers and crew)
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const filteredUsers = existingUsers.filter((user: any) => 
    !user.id.startsWith('user_sample_') && !user.id.startsWith('crew_')
  );
  localStorage.setItem('registeredUsers', JSON.stringify(filteredUsers));
  
  console.log('🗑️ Sample booking data reset completed');
  
  // Re-initialize
  initializeAllSampleData();
};
