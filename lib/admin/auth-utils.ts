/**
 * Utility functions for admin authentication
 */

// Set admin status in multiple storage mechanisms
export function setAdminStatus() {
  // Set sessionStorage for immediate detection
  sessionStorage.setItem('admin_logged_in', 'true')
  
  // Set localStorage for persistence across sessions
  localStorage.setItem('admin_logged_in', 'true')
  
  // Dispatch storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'admin_logged_in',
    newValue: 'true',
    oldValue: null,
    storageArea: localStorage
  }))
}

// Clear admin status from all storage
export function clearAdminStatus() {
  sessionStorage.removeItem('admin_logged_in')
  localStorage.removeItem('admin_logged_in')
  
  // Dispatch storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'admin_logged_in',
    newValue: null,
    oldValue: 'true',
    storageArea: localStorage
  }))
}

// Check if user is admin
export function isAdminUser(): boolean {
  // Check cookie first
  const cookies = document.cookie.split(';')
  const adminCookie = cookies.find(c => c.trim().startsWith('admin_logged_in='))
  
  if (adminCookie) return true
  
  // Check sessionStorage
  if (sessionStorage.getItem('admin_logged_in') === 'true') return true
  
  // Check localStorage
  if (localStorage.getItem('admin_logged_in') === 'true') return true
  
  return false
}
