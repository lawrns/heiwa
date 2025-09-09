'use client'

// Minimal test page to isolate webpack module loading issues
export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p className="text-gray-600">
        This is a minimal test page with no external dependencies.
        If this loads without errors, the issue is in specific components.
      </p>
      <div className="mt-4 p-4 bg-green-100 rounded">
        <p className="text-green-800">✅ Basic React component working</p>
      </div>
    </div>
  )
}
