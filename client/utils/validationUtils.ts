/**
 * Validation utilities for registration and user profile data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate Philippine phone number
 * Accepts: 09XX XXX XXXX, +63 9XX XXX XXXX, 09XXXXXXXXXX, +639XXXXXXXXXX
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === "") {
    // Phone is optional
    return { isValid: true };
  }

  // Remove spaces, dashes, parentheses
  const cleanedPhone = phone.replace(/[\s\-()]/g, "");

  // Philippine phone number patterns:
  // - 09XXXXXXXXX (starts with 09)
  // - +639XXXXXXXXX (starts with +639)
  const phoneRegex = /^(\+63|0)?9\d{9}$/;

  if (!phoneRegex.test(cleanedPhone)) {
    return {
      isValid: false,
      error: "Please enter a valid Philippine phone number (e.g., 09XX XXX XXXX or +63 9XX XXX XXXX)",
    };
  }

  return { isValid: true };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  return { isValid: true };
};

/**
 * Validate full name
 */
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: "Full name is required" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Full name must be at least 2 characters" };
  }

  return { isValid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address || address.trim() === "") {
    // Address is optional
    return { isValid: true };
  }

  if (address.trim().length < 5) {
    return { isValid: false, error: "Please provide a complete address (at least 5 characters)" };
  }

  return { isValid: true };
};

/**
 * Validate branch location
 */
export const validateBranchLocation = (location: string): { isValid: boolean; error?: string } => {
  const validLocations = ["manila", "cebu", "davao", "other", "default"];

  if (!location || !validLocations.includes(location)) {
    return { isValid: false, error: "Please select a valid branch location" };
  }

  return { isValid: true };
};

/**
 * Validate entire registration form
 */
export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  contactNumber?: string;
  address?: string;
  branchLocation: string;
}

export const validateRegistrationForm = (formData: RegistrationFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || "Invalid email";
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error || "Invalid password";
  }

  // Validate confirm password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Validate full name
  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.error || "Invalid full name";
  }

  // Validate contact number (optional)
  const phoneValidation = validatePhoneNumber(formData.contactNumber || "");
  if (!phoneValidation.isValid) {
    errors.contactNumber = phoneValidation.error || "Invalid phone number";
  }

  // Validate address (optional)
  const addressValidation = validateAddress(formData.address || "");
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error || "Invalid address";
  }

  // Validate branch location
  const branchValidation = validateBranchLocation(formData.branchLocation);
  if (!branchValidation.isValid) {
    errors.branchLocation = branchValidation.error || "Invalid branch location";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format phone number to standard format
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // If it starts with 0, replace with +63
  if (cleaned.startsWith("0")) {
    return "+63" + cleaned.substring(1);
  }

  // If it doesn't start with +, assume it's Philippines
  if (!cleaned.startsWith("+")) {
    return "+63" + cleaned;
  }

  return cleaned;
};

/**
 * Validate user profile update
 */
export interface UserProfileUpdateData {
  fullName?: string;
  contactNumber?: string;
  address?: string;
  branchLocation?: string;
}

export const validateUserProfileUpdate = (data: UserProfileUpdateData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (data.fullName !== undefined) {
    const nameValidation = validateFullName(data.fullName);
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error || "Invalid full name";
    }
  }

  if (data.contactNumber !== undefined) {
    const phoneValidation = validatePhoneNumber(data.contactNumber);
    if (!phoneValidation.isValid) {
      errors.contactNumber = phoneValidation.error || "Invalid phone number";
    }
  }

  if (data.address !== undefined) {
    const addressValidation = validateAddress(data.address);
    if (!addressValidation.isValid) {
      errors.address = addressValidation.error || "Invalid address";
    }
  }

  if (data.branchLocation !== undefined) {
    const branchValidation = validateBranchLocation(data.branchLocation);
    if (!branchValidation.isValid) {
      errors.branchLocation = branchValidation.error || "Invalid branch location";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
