/**
 * Utility functions for scrolling to form errors
 */

/**
 * Scrolls to the first error field in a form
 * Looks for elements with aria-invalid="true" or data-error="true"
 */
export function scrollToFirstError(container?: HTMLElement | null): boolean {
  const searchContainer = container || document
  
  // Try multiple selectors to find error fields
  const errorSelectors = [
    '[aria-invalid="true"]',
    '[data-error="true"]',
    '.error',
    '.field-error',
    '[class*="error"]',
  ]
  
  for (const selector of errorSelectors) {
    const errorElement = searchContainer.querySelector(selector) as HTMLElement
    if (errorElement) {
      // Scroll to the element with smooth behavior
      errorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
      
      // Focus the element if it's focusable
      setTimeout(() => {
        if (errorElement instanceof HTMLInputElement || 
            errorElement instanceof HTMLTextAreaElement ||
            errorElement instanceof HTMLSelectElement) {
          errorElement.focus()
        } else {
          // Try to find a focusable input within the error container
          const focusableInput = errorElement.querySelector('input, textarea, select') as HTMLElement
          if (focusableInput) {
            focusableInput.focus()
          }
        }
      }, 300)
      
      return true
    }
  }
  
  return false
}

/**
 * Scrolls to a specific form field by ID or name
 */
export function scrollToField(fieldIdOrName: string, container?: HTMLElement | null): boolean {
  const searchContainer = container || document

  // Try ID first - use querySelector for both Document and HTMLElement compatibility
  let field = searchContainer.querySelector(`#${CSS.escape(fieldIdOrName)}`) as HTMLElement | null

  // Try name attribute if ID didn't work
  if (!field) {
    field = searchContainer.querySelector(`[name="${fieldIdOrName}"]`) as HTMLElement | null
  }

  // Try data-testid
  if (!field) {
    field = searchContainer.querySelector(`[data-testid="${fieldIdOrName}"]`) as HTMLElement | null
  }
  
  if (field) {
    field.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
    
    setTimeout(() => {
      if (field instanceof HTMLInputElement || 
          field instanceof HTMLTextAreaElement ||
          field instanceof HTMLSelectElement) {
        field.focus()
      }
    }, 300)
    
    return true
  }
  
  return false
}

/**
 * Scrolls to the first error message element
 * Useful when errors are displayed separately from inputs
 */
export function scrollToFirstErrorMessage(container?: HTMLElement | null): boolean {
  const searchContainer = container || document
  
  const errorMessageSelectors = [
    '[role="alert"]',
    '.error-message',
    '[class*="error-message"]',
    '[data-error-message="true"]',
  ]
  
  for (const selector of errorMessageSelectors) {
    const errorMessage = searchContainer.querySelector(selector) as HTMLElement
    if (errorMessage) {
      errorMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
      return true
    }
  }
  
  return false
}













