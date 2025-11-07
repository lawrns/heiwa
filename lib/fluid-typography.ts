/**
 * Fluid Typography - Scales font sizes based on viewport width
 * Uses CSS clamp() for smooth scaling between min and max sizes
 */

export const fluidTypography = {
  // Headings
  h1: 'text-[clamp(2rem,5vw,3.5rem)]',
  h2: 'text-[clamp(1.5rem,4vw,2.5rem)]',
  h3: 'text-[clamp(1.25rem,3vw,2rem)]',
  h4: 'text-[clamp(1.1rem,2.5vw,1.5rem)]',
  h5: 'text-[clamp(1rem,2vw,1.25rem)]',
  h6: 'text-[clamp(0.9rem,1.5vw,1.1rem)]',

  // Body text
  body: 'text-[clamp(0.875rem,1.5vw,1rem)]',
  bodyLarge: 'text-[clamp(1rem,1.75vw,1.125rem)]',
  bodySmall: 'text-[clamp(0.75rem,1.25vw,0.875rem)]',

  // Display
  display: 'text-[clamp(2.5rem,6vw,4rem)]',
  displaySmall: 'text-[clamp(2rem,5vw,3rem)]',
}

/**
 * CSS for fluid typography - add to globals.css
 */
export const fluidTypographyCSS = `
  @supports (font-size: clamp(1rem, 1vw, 2rem)) {
    /* Fluid typography is supported */
  }
`
