"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestLeadPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function testLeadCreation() {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          name: 'Test User',
          source: 'test_page',
        }),
      })
      
      const data = await response.json()
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error: any) {
      setResult({
        error: error.message,
        stack: error.stack
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Lead API</h1>
      
      <Button 
        onClick={testLeadCreation} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Testing...' : 'Test Lead Creation'}
      </Button>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <ul className="text-sm space-y-1">
          <li>API Endpoint: /api/leads</li>
          <li>Method: POST</li>
          <li>This tests if the API is working at all</li>
        </ul>
      </div>
    </div>
  )
}