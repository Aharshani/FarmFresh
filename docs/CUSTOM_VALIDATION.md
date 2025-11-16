# Custom Validation System for Registration Form

## Overview
The registration form (`register.html`) now includes a comprehensive custom validation system with real-time feedback, visual indicators, and detailed error messages.

## Features

### ✅ Real-Time Validation
- **Input Events**: Validates as user types (for immediate feedback)
- **Blur Events**: Validates when user leaves field (for final validation)
- **Visual Feedback**: Green borders for valid, red borders for invalid
- **Icons**: Check mark (✓) for valid, X mark (✗) for invalid

### ✅ Field-Specific Validation Rules

#### First Name & Last Name
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Pattern**: Only letters, spaces, hyphens, and apostrophes
- **Error Message**: "First/Last name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes"

#### Email Address
- **Required**: Yes
- **Pattern**: Standard email format validation
- **Error Message**: "Please enter a valid email address"

#### Phone Number
- **Required**: No (Optional)
- **Pattern**: UK phone number format (+44 or 0 followed by 10-11 digits)
- **Error Message**: "Please enter a valid UK phone number (e.g., +44 7123 456789 or 07123 456789)"
- **Format Hint**: Shows format examples

#### Password
- **Required**: Yes
- **Min Length**: 8 characters
- **Pattern**: Must contain uppercase, lowercase, and number
- **Error Message**: "Password must be at least 8 characters with uppercase, lowercase, and number"
- **Requirements Display**: Real-time checklist showing:
  - ✓ At least 8 characters
  - ✓ One uppercase letter
  - ✓ One lowercase letter
  - ✓ One number

#### Confirm Password
- **Required**: Yes
- **Match**: Must match password field
- **Error Message**: "Passwords do not match"
- **Real-time Check**: Validates as user types

#### Postcode
- **Required**: Yes
- **Pattern**: UK postcode format (e.g., SW1A 1AA)
- **Auto-formatting**: Automatically formats as user types
- **Error Message**: "Please enter a valid UK postcode (e.g., SW1A 1AA)"

#### Terms & Conditions
- **Required**: Yes
- **Error Message**: "You must accept the terms and conditions"

## Visual Indicators

### Success State (Valid)
- **Border**: Green (`border-green-500`)
- **Icon**: Green check circle (✓)
- **Error Message**: Hidden

### Error State (Invalid)
- **Border**: Red (`border-red-500`)
- **Icon**: Red X circle (✗)
- **Error Message**: Displayed in red text

### Default State
- **Border**: Gray (`border-gray-300`)
- **Icon**: Hidden
- **Error Message**: Hidden

## Validation Flow

### 1. Real-Time Validation (While Typing)
```javascript
input.addEventListener('input', () => {
    validateField('fieldName', input, true); // isTyping = true
});
```

### 2. Blur Validation (On Field Exit)
```javascript
input.addEventListener('blur', () => {
    validateField('fieldName', input); // Full validation
});
```

### 3. Form Submission Validation
```javascript
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) {
        // Show error, scroll to first error
        return;
    }
    // Proceed with submission
});
```

## Validation Rules Configuration

```javascript
const validationRules = {
    firstName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[A-Za-z\s'-]+$/,
        message: 'Custom error message'
    },
    // ... other fields
};
```

## Special Features

### Password Requirements Display
Real-time checklist that updates as user types:
- ✓/✗ At least 8 characters
- ✓/✗ One uppercase letter
- ✓/✗ One lowercase letter
- ✓/✗ One number

### Postcode Auto-Formatting
Automatically formats UK postcodes as user types:
- Input: `sw1a1aa`
- Output: `SW1A 1AA`

### Form Validation Before Submission
- Validates all fields before allowing submission
- Scrolls to first error if validation fails
- Prevents submission if any field is invalid

## Error Handling

### Field-Level Errors
- Displayed below each field
- Red text color
- Specific error message for each validation failure

### Form-Level Errors
- Displayed at top of form
- Shown when form submission fails
- Includes general error message

## User Experience

### Immediate Feedback
- Users see validation results as they type
- No need to submit form to see errors
- Clear visual indicators (colors, icons)

### Helpful Messages
- Specific error messages for each field
- Format hints for phone and postcode
- Password requirements checklist

### Accessibility
- Required fields marked with red asterisk (*)
- Optional fields clearly labeled
- Error messages associated with fields

## Code Structure

### Validation Functions
- `validateField()` - Validates individual field
- `validateForm()` - Validates entire form
- `showFieldError()` - Shows error state
- `showFieldSuccess()` - Shows success state
- `clearFieldError()` - Clears validation state

### Helper Functions
- `updatePasswordRequirements()` - Updates password checklist
- `formatPostcode()` - Formats UK postcode
- `updateRequirement()` - Updates individual requirement status

## Testing

### Test Cases
1. **Empty Required Fields**: Should show "This field is required"
2. **Invalid Email**: Should show email format error
3. **Weak Password**: Should show password requirements
4. **Mismatched Passwords**: Should show "Passwords do not match"
5. **Invalid Postcode**: Should show postcode format error
6. **Valid Form**: Should allow submission

### Example Test Data
```javascript
// Invalid
firstName: "A" // Too short
email: "invalid" // Invalid format
password: "weak" // Too weak
postcode: "123" // Invalid format

// Valid
firstName: "John"
email: "john@example.com"
password: "Password123"
postcode: "SW1A 1AA"
```

## Integration

The validation system integrates seamlessly with:
- **Form Submission**: Validates before submitting to API
- **Auth Manager**: Works with existing `authManager.register()`
- **Error Handling**: Displays API errors if validation passes but registration fails

## Benefits

1. **Better UX**: Users get immediate feedback
2. **Reduced Errors**: Catches errors before submission
3. **Clear Guidance**: Specific error messages help users fix issues
4. **Professional Look**: Visual indicators enhance form appearance
5. **Accessibility**: Clear labeling and error association

## Future Enhancements

1. **Email Availability Check**: Real-time check if email exists
2. **Password Strength Meter**: Visual strength indicator
3. **Postcode Lookup**: Auto-complete UK postcodes
4. **Phone Number Formatting**: Auto-format phone numbers
5. **Validation Summary**: Show all errors at once

