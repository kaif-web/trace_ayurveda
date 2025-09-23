'use client'

import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'

export default function VerifyHerbs() {
  const [farmers, setFarmers] = useState<any[]>([])

  // Initial fetch
  useEffect(() => {
    const fetchFarmers = async () => {
      const { data, error } = await supabase.from('farmers').select('*')
      if (error) {
        console.error('Error fetching farmers:', error.message)
      } else {
        setFarmers(data)
      }
    }
    fetchFarmers()
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime:farmer-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'farmers' },
        (payload) => {
          setFarmers((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h2>Verify Herbs (Live)</h2>
      <table border={1} cellPadding={8} style={{ marginTop: '15px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Farmer Name</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map((farmer) => (
            <tr key={farmer.id}>
              <td>{farmer.id}</td>
              <td>{farmer.name}</td>
              <td>{farmer.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}