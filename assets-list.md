# Assets List

## Icons Required

### Core Icons (24x24px default, 32x32px touch targets)
- `upload` - Cloud upload with arrow
- `image` - Picture/photo frame icon
- `search` - Magnifying glass
- `shield-check` - Security/authenticity symbol
- `eye` - View/preview icon
- `download` - Download arrow
- `share` - Share/export icon
- `settings` - Gear/cog icon
- `info` - Information circle
- `warning` - Alert triangle
- `error` - X in circle
- `success` - Checkmark in circle

### Navigation Icons (24x24px)
- `home` - House icon
- `analyze` - Microscope or analysis icon
- `history` - Clock or history icon
- `user` - Profile/person icon

### Action Icons (20x20px minimum)
- `external-link` - Arrow pointing out of box
- `copy` - Duplicate documents
- `close` - X mark
- `chevron-down` - Down arrow
- `chevron-up` - Up arrow
- `chevron-left` - Left arrow
- `chevron-right` - Right arrow
- `plus` - Plus sign
- `minus` - Minus sign

### Service Provider Icons (32x32px)
- `google` - Google logo/icon
- `tineye` - TinEye logo
- `bing` - Microsoft Bing logo
- `yandex` - Yandex logo

### Forensics Icons (24x24px)
- `layers` - ELA analysis representation
- `clone` - Copy detection icon
- `metadata` - Data/information icon
- `zoom-in` - Magnifying glass with plus
- `zoom-out` - Magnifying glass with minus

## Image Assets

### Placeholder Images
- `image-placeholder.svg` - 400x300px grey placeholder with upload icon
- `ela-placeholder.svg` - 200x150px placeholder for ELA analysis
- `no-results.svg` - Empty state illustration (300x200px)

### Background Patterns
- `grid-pattern.svg` - Subtle grid for background (repeatable)
- `noise-texture.png` - Light texture overlay (100x100px, repeatable)

## Logo Assets
- `logo-mark.svg` - App icon/mark only (64x64px)
- `logo-full.svg` - Full logo with text (200x60px)
- `logo-mono.svg` - Monochrome version for dark themes

## Export Rules

### Icon Specifications
- **Format**: SVG preferred, PNG fallback
- **Stroke width**: 1.5px for outline icons
- **Corner radius**: 2px for rounded elements
- **Color**: Use currentColor for theme compatibility
- **Viewbox**: 0 0 24 24 for 24px icons

### Touch Target Requirements
- **Minimum size**: 44x44px interactive area
- **Icon size within target**: 24x24px maximum
- **Padding**: 10px minimum around icon

### Responsive Sizing
- **Mobile**: Icons scale to 20px in compact layouts
- **Tablet**: Standard 24px sizing
- **Desktop**: Can scale to 28px for better visibility

### Accessibility
- **Alt text**: Required for all decorative images
- **ARIA labels**: Required for icon-only buttons
- **High contrast**: Icons must pass WCAG AA contrast ratios
- **Focus indicators**: 2px outline on keyboard focus

## File Naming Convention
- Use kebab-case: `icon-name.svg`
- Include size suffix for multiple sizes: `logo-32.svg`, `logo-64.svg`
- Use descriptive names: `upload-cloud.svg` not `icon1.svg`

## CDN/Storage Structure
```
/assets/
  /icons/
    /24/ (24x24px icons)
    /32/ (32x32px icons)
  /images/
    /placeholders/
    /backgrounds/
  /logos/
```