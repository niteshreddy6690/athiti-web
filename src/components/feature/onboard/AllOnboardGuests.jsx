
import React, { useEffect, useState } from 'react'
import { API_URL } from '@/utils/constants'
const AllOnboardGuests = () => {
    const [guests, setGuests] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function fetchAllGuests() {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch(`${API_URL}${"/guest"}`) // Replace with your actual API endpoint
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            setGuests(data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching guests:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllGuests()
    }, [])

    if (loading) return <div>Loading guests...</div>
    if (error) return <div>Error: {error}</div>

    return (
       <div className="p-6">
  <h2 className="text-2xl font-semibold mb-4">All Onboard Guests</h2>
  {guests.length === 0 ? (
    <p className="text-gray-500">No guests found</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guests.map((guest, index) => (
        <div
          key={guest._id || index}
          className="border rounded-lg shadow-sm p-4 bg-white"
        >
          <h3 className="text-lg font-bold mb-2">
            {guest.name || `Guest ${index + 1}`}
          </h3>
          <p className="text-sm text-gray-700">
            <strong>Email:</strong> {guest.email}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Phone:</strong> {guest.phone}
          </p>
          <p className="text-sm text-gray-700">
            <strong>People:</strong> {guest.numberOfPeople}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Created:</strong>{" "}
            {new Date(guest.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

    )
}

export default AllOnboardGuests