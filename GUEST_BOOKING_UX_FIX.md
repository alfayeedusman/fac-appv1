# Guest Booking UX Fix - Mobile Bottom Action Bar

## Problem
The mobile sticky action bar on the guest booking page was floating above the bottom (positioned at `bottom-20`, 80px from bottom), causing:
- Awkward floating appearance
- Overlapping with content
- Inconsistent with user expectations

This floating position was originally designed for pages with BottomNavigation component, but guest booking doesn't have that.

## Solution Applied

### 1. **Action Bar Positioning** (`StepperBooking.tsx`)
- **Before**: `fixed bottom-20` (floating 80px above bottom)
- **After**: `fixed bottom-0` (anchored to very bottom) for guest booking
- **Conditional**: Uses `isGuest` prop to apply correct positioning
  - Guest booking: `bottom-0` (at bottom)
  - Regular booking: `bottom-20` (above BottomNavigation)

### 2. **Full Width Design**
- **Before**: `left-3 right-3` (margins on sides)
- **After**: `left-0 right-0` (full width edge-to-edge)

### 3. **Border Styling**
- **Before**: `rounded-2xl` (all corners rounded)
- **After**: `rounded-t-2xl` (only top corners rounded)
- **Added**: `border-t` (top border for separation)

### 4. **Content Padding Adjustment**
- **Before**: `pb-56` (224px bottom padding on mobile)
- **After**: `pb-40` (160px bottom padding) for guest booking
- **Reason**: Less padding needed since bar is at bottom, not floating

## Code Changes

### File: `client/components/StepperBooking.tsx`

**Line 1391-1392** - Action Bar Container:
```tsx
// Before:
<div className="fixed bottom-20 left-3 right-3 z-50 md:hidden">
  <div className="glass border-2 border-border bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl p-4 space-y-4">

// After:
<div className={`fixed ${isGuest ? 'bottom-0' : 'bottom-20'} left-0 right-0 z-50 md:hidden`}>
  <div className="glass border-2 border-t border-border bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-t-2xl shadow-2xl p-4 space-y-4">
```

**Line 1193** - Content Padding:
```tsx
// Before:
<div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-56 md:pb-8">

// After:
<div className={`p-3 sm:p-4 md:p-6 lg:p-8 ${isGuest ? 'pb-40' : 'pb-56'} md:pb-8`}>
```

## Result

✅ Mobile action bar now sits perfectly at the bottom for guest booking
✅ Full-width edge-to-edge design
✅ Proper padding to prevent content overlap
✅ Maintains floating design for regular booking (with BottomNavigation)
✅ Clean, modern appearance with rounded top corners

## Testing

Test on mobile/small screens:
1. Navigate to guest booking page
2. Verify action bar is at the very bottom (not floating)
3. Scroll through booking steps - content should not be hidden
4. Verify regular booking still has floating bar (if it has BottomNavigation)
