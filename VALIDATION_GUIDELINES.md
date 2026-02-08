# Validation Guidelines

## Form Validation Rules

### Required Fields

#### Email Address
- **Validation**: Valid email format (e.g., user@example.com)
- **Error Message**: "Email is required" or "Invalid email format"
- **Examples of Valid Emails**:
  - user@example.com
  - john.doe@company.co.ph
  - contact+tag@domain.com

#### Password
- **Validation**: Minimum 6 characters
- **Error Message**: "Password is required" or "Password must be at least 6 characters"
- **Recommendations**:
  - Mix uppercase and lowercase letters
  - Include numbers
  - Include special characters (!@#$%^&*)

#### Confirm Password
- **Validation**: Must match the Password field
- **Error Message**: "Passwords do not match"

#### Full Name
- **Validation**: Required, at least 2 characters
- **Error Message**: "Full name is required" or "Full name must be at least 2 characters"
- **Examples**:
  - John Doe
  - Maria Santos
  - Juan dela Cruz

#### Branch Location
- **Validation**: Must select one of the available branches
- **Available Options**:
  - Manila
  - Cebu
  - Davao
  - Other
- **Error Message**: "Please select a valid branch location"

### Optional Fields

#### Contact Number (Philippine)
- **Validation**: Valid Philippine phone number (optional, but if provided must be valid)
- **Error Message**: "Please enter a valid Philippine phone number (e.g., 09XX XXX XXXX or +63 9XX XXX XXXX)"
- **Accepted Formats**:
  - `09XXXXXXXXX` (10 digits starting with 09)
  - `+639XXXXXXXXX` (Starts with +639)
  - `09XX XXX XXXX` (With spaces)
  - `09XX-XXX-XXXX` (With dashes)
  - `+63 9XX XXX XXXX` (With spaces)

**Examples of Valid Phone Numbers**:
- 09171234567
- 09-17-123-4567
- 09 17 123 4567
- +639171234567
- +63 9 17 123 4567

**Examples of Invalid Phone Numbers**:
- 08171234567 (Starts with 08, not 09)
- 9171234567 (Missing leading 0 or +63)
- +11234567890 (US number)
- 02-1234567 (Landline)

#### Address
- **Validation**: Valid street address (optional, but if provided must be at least 5 characters)
- **Error Message**: "Please provide a complete address (at least 5 characters)"
- **Examples**:
  - 123 Main Street, Manila, Metro Manila
  - Unit 5, Building A, Makati City
  - Barangay San Andres, Cainta, Rizal

**Do's and Don'ts**:
- ✅ Include street address
- ✅ Include city/municipality
- ✅ Include province (optional but recommended)
- ❌ Don't use abbreviations like "Blvd" instead of "Boulevard"
- ❌ Don't use just a building number

---

## Validation in Code

### Using Validation Utilities

The application provides validation utilities in `client/utils/validationUtils.ts`:

```typescript
import {
  validatePhoneNumber,
  validateEmail,
  validatePassword,
  validateFullName,
  validateAddress,
  validateRegistrationForm,
} from "@/utils/validationUtils";

// Validate individual fields
const emailResult = validateEmail("user@example.com");
if (!emailResult.isValid) {
  console.error(emailResult.error);
}

// Validate entire registration form
const result = validateRegistrationForm({
  email: "user@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!",
  fullName: "John Doe",
  contactNumber: "09171234567",
  address: "123 Main St, Manila",
  branchLocation: "manila",
});

if (!result.isValid) {
  console.error(result.errors); // { email?: "...", phone?: "...", etc }
}
```

### Phone Number Formatting

```typescript
import { formatPhoneNumber } from "@/utils/validationUtils";

const formatted = formatPhoneNumber("09171234567");
// Returns: "+639171234567"
```

---

## Backend Validation

The backend should mirror these validation rules to ensure consistency:

1. **Email**: Must be unique and valid format
2. **Password**: Minimum 6 characters (hashed before storage)
3. **Phone**: Optional, but must be valid Philippine format if provided
4. **Address**: Optional, but must not be empty if provided
5. **Branch Location**: Must be one of the predefined options

---

## Error Handling

When validation fails, errors are displayed as:

1. **Field-level errors**: Shown directly below the input field
2. **Form-level errors**: Shown as a notification toast
3. **Backend errors**: Parsed and displayed to the user

### Example Error Response Structure

```typescript
{
  "success": false,
  "errors": {
    "contactNumber": "Please enter a valid Philippine phone number",
    "address": "Please provide a complete address"
  }
}
```

---

## User Experience Flow

### Registration Form

1. User enters email → Validated in real-time
2. User enters password → Validated in real-time (min 6 chars)
3. User confirms password → Checked against password field
4. User enters full name → Required field validation
5. User enters (optional) phone → Validated only if filled
6. User enters (optional) address → Validated only if filled
7. User selects branch → Required dropdown selection
8. Click "Create Account" → Full form validation + backend validation
9. Backend creates account + sends verification email
10. User receives "Step 1 validation failed" → See errors above for solutions

---

## Common Issues and Solutions

### Issue: "Please enter a valid Philippine phone number"

**Problem**: Phone number format not recognized

**Solution**: Use one of these formats:
- `09XX XXX XXXX` (most common)
- `+63 9XX XXX XXXX`
- `09XXXXXXXXX` (no spaces)

**Example**: 
- ✅ Correct: 09171234567 or 09 17 123 4567
- ❌ Wrong: 9171234567 or 08171234567

### Issue: "Please provide a complete address"

**Problem**: Address field is empty or too short

**Solution**: Provide at least 5 characters including:
- Street number and name
- City or municipality
- Province (recommended)

**Example**:
- ✅ Correct: "123 Main St, Manila, Metro Manila"
- ❌ Wrong: "Manila" or empty field

### Issue: "Passwords do not match"

**Problem**: Confirm password doesn't match original password

**Solution**: 
1. Verify you're typing the same password in both fields
2. Check if caps lock is on
3. Clear both fields and re-enter

### Issue: "Email is required"

**Problem**: Email field is empty

**Solution**: Enter a valid email address (user@example.com)

---

## Testing Validation

### Test Data You Can Use

**Valid Phone Numbers**:
- 09171234567
- 09-51-123-4567
- +639171234567
- +63 9 17 123 4567

**Valid Addresses**:
- 123 Main Street, Manila, Metro Manila
- Unit 5, Building A, Makati
- Barangay San Andres, Cainta, Rizal

**Valid Emails**:
- user@example.com
- john.doe@company.co.ph
- test@domain.ph

**Valid Passwords**:
- SecurePass123
- MyPassword@2024
- StrongP@ss1

---

## FAQ

**Q: Is phone number required?**
A: No, it's optional. But if you provide one, it must be a valid Philippine number.

**Q: Can I use a landline number?**
A: No, the system only accepts mobile numbers (starting with 09 or +639).

**Q: What if I don't want to provide a phone number?**
A: That's fine. Just leave the phone field empty.

**Q: Can I update my information later?**
A: Yes, you can update your profile after logging in from the Account Settings page.

**Q: Why do I need branch location?**
A: It helps route you to the nearest service location and manage your account properly.

---

## Security Notes

- Never share your password with anyone
- Password should be at least 6 characters (more is better)
- Email address is used for account recovery
- Phone number is used for support contact only

---

Last Updated: 2024
