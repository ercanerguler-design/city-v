/**
 * 📱 CROSS-PLATFORM RESPONSIVE UTILITIES
 * Mobil, Tablet, Desktop için optimize edilmiş Tailwind CSS sınıfları
 */

// Container Sınıfları
export const containerClasses = {
  // Full width on mobile, max-width on desktop
  responsive: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Fluid container (always full width)
  fluid: 'w-full px-3 sm:px-4 md:px-6',
  
  // Narrow container (blog posts, forms)
  narrow: 'w-full max-w-3xl mx-auto px-4 sm:px-6',
  
  // Wide container (dashboards)
  wide: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'
};

// Grid Layouts
export const gridClasses = {
  // Responsive grid: 1 col on mobile, 2 on tablet, 3-4 on desktop
  responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  
  // Card grid
  cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  
  // List grid (2 columns on tablet+)
  list: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  
  // Dashboard widgets
  dashboard: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
};

// Spacing Utilities
export const spacingClasses = {
  // Section padding
  section: 'py-8 sm:py-12 md:py-16 lg:py-20',
  
  // Card padding
  card: 'p-4 sm:p-6 md:p-8',
  
  // Stack spacing (vertical)
  stack: 'space-y-4 sm:space-y-6',
  
  // Inline spacing (horizontal)
  inline: 'space-x-2 sm:space-x-4'
};

// Typography
export const typographyClasses = {
  // Headings
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold',
  h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
  h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold',
  h4: 'text-lg sm:text-xl md:text-2xl font-semibold',
  h5: 'text-base sm:text-lg md:text-xl font-medium',
  
  // Body text
  body: 'text-sm sm:text-base',
  bodyLarge: 'text-base sm:text-lg',
  bodySmall: 'text-xs sm:text-sm',
  
  // Lead text
  lead: 'text-lg sm:text-xl md:text-2xl text-gray-600'
};

// Button Sizes
export const buttonClasses = {
  // Size variants
  sm: 'px-3 py-1.5 text-xs sm:text-sm',
  md: 'px-4 py-2 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base sm:text-lg',
  xl: 'px-8 py-4 text-lg sm:text-xl',
  
  // Full width on mobile
  responsive: 'w-full sm:w-auto px-4 py-2 text-sm sm:text-base',
  
  // Icon buttons
  icon: 'p-2 sm:p-3',
  iconLarge: 'p-3 sm:p-4'
};

// Modal/Dialog Sizes
export const modalClasses = {
  // Responsive modal widths
  sm: 'w-full max-w-md mx-4',
  md: 'w-full max-w-2xl mx-4',
  lg: 'w-full max-w-4xl mx-4',
  xl: 'w-full max-w-6xl mx-4',
  full: 'w-full h-full sm:h-auto sm:max-w-7xl sm:mx-4',
  
  // Modal content padding
  padding: 'p-4 sm:p-6 md:p-8'
};

// Touch Targets (44x44 minimum for accessibility)
export const touchTargetClasses = {
  // Minimum touch target size
  minimum: 'min-h-[44px] min-w-[44px]',
  
  // Interactive elements
  button: 'min-h-[44px] px-4 touch-manipulation',
  link: 'min-h-[44px] flex items-center touch-manipulation',
  icon: 'min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation'
};

// Canvas/Drawing Areas (for AI Camera)
export const canvasClasses = {
  // Responsive canvas container
  container: 'w-full max-w-full overflow-hidden rounded-lg',
  
  // Canvas element
  canvas: 'max-w-full h-auto touch-none',
  
  // Drawing canvas (calibration, zones)
  drawing: 'border-2 sm:border-4 border-gray-200 rounded-lg cursor-crosshair touch-none max-w-full h-auto',
  
  // Video stream canvas
  stream: 'w-full h-auto rounded-lg'
};

// Flex Layouts
export const flexClasses = {
  // Row with responsive wrapping
  row: 'flex flex-col sm:flex-row gap-4 sm:gap-6',
  
  // Center content
  center: 'flex items-center justify-center',
  
  // Space between
  between: 'flex items-center justify-between',
  
  // Stack on mobile, row on desktop
  stack: 'flex flex-col lg:flex-row gap-4 sm:gap-6'
};

// Navigation
export const navClasses = {
  // Mobile navigation
  mobile: 'fixed bottom-0 inset-x-0 bg-white border-t shadow-lg lg:hidden',
  
  // Desktop navigation
  desktop: 'hidden lg:flex items-center gap-6',
  
  // Navigation item
  item: 'px-3 py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center',
  
  // Hamburger menu
  hamburger: 'lg:hidden p-2 min-h-[44px] min-w-[44px]'
};

// Card Components
export const cardClasses = {
  // Basic card
  base: 'bg-white rounded-lg shadow-sm border border-gray-200',
  
  // Responsive card padding
  padding: 'p-4 sm:p-6',
  
  // Hover effect
  hover: 'transition-shadow hover:shadow-md',
  
  // Interactive card
  interactive: 'cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]'
};

// Form Elements
export const formClasses = {
  // Input field
  input: 'w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  
  // Select dropdown
  select: 'w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500',
  
  // Textarea
  textarea: 'w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]',
  
  // Label
  label: 'block text-sm sm:text-base font-medium mb-2',
  
  // Form group
  group: 'space-y-2 sm:space-y-3'
};

// Utility Functions
export const getResponsiveClass = (mobile: string, tablet?: string, desktop?: string) => {
  let classes = mobile;
  if (tablet) classes += ` sm:${tablet}`;
  if (desktop) classes += ` lg:${desktop}`;
  return classes;
};

export const getBreakpointValue = <T,>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}) => {
  if (typeof window === 'undefined') return values.mobile;
  
  const width = window.innerWidth;
  if (width >= 1536 && values.wide) return values.wide;
  if (width >= 1024 && values.desktop) return values.desktop;
  if (width >= 640 && values.tablet) return values.tablet;
  return values.mobile;
};

// Export all
export const responsive = {
  container: containerClasses,
  grid: gridClasses,
  spacing: spacingClasses,
  typography: typographyClasses,
  button: buttonClasses,
  modal: modalClasses,
  touchTarget: touchTargetClasses,
  canvas: canvasClasses,
  flex: flexClasses,
  nav: navClasses,
  card: cardClasses,
  form: formClasses,
  getResponsiveClass,
  getBreakpointValue
};

export default responsive;
