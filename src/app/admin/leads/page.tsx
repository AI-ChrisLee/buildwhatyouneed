"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LeadData {
  funnel: {
    total_leads: number
    signups: number
    paid_members: number
    active_members: number
    cancelled_members: number
    optouts: number
    lead_to_signup_rate: number
    signup_to_paid_rate: number
    retention_rate: number
  }
  recentLeads: Array<{
    id: string
    email: string
    name: string
    stage: string
    created_at: string
    hot_lead_at: string | null
    member_at: string | null
  }>
  analytics: Array<{
    stage: string
    count: number
  }>
}

export default function AdminLeadsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<LeadData | null>(null)

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  async function checkAdminAndLoadData() {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!userData?.is_admin) {
        router.push('/threads')
        return
      }

      // Load lead data
      const response = await fetch('/api/leads')
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Error loading lead data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Lead Analytics Dashboard</h1>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{data.funnel.total_leads}</p>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.funnel.signups}</p>
              <p className="text-sm text-gray-600">Signups</p>
              <p className="text-xs text-green-600">{data.funnel.lead_to_signup_rate}% conversion</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.funnel.paid_members}</p>
              <p className="text-sm text-gray-600">Paid Members</p>
              <p className="text-xs text-green-600">{data.funnel.signup_to_paid_rate}% conversion</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.funnel.active_members}</p>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-xs text-green-600">{data.funnel.retention_rate}% retention</p>
            </div>
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Leads by Stage</h2>
          <div className="space-y-2">
            {data.analytics.map((item) => (
              <div key={item.stage} className="flex justify-between items-center">
                <span className="capitalize">{item.stage.replace('_', ' ')}</span>
                <span className="font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Stage</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b">
                    <td className="py-2">{lead.email}</td>
                    <td className="py-2">{lead.name || '-'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        lead.stage === 'member' ? 'bg-green-100 text-green-800' :
                        lead.stage === 'hot_lead' ? 'bg-yellow-100 text-yellow-800' :
                        lead.stage === 'lead' ? 'bg-blue-100 text-blue-800' :
                        lead.stage === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.stage}
                      </span>
                    </td>
                    <td className="py-2">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}