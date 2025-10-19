import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Google Places API configuration
    const placeId = 'ChIJ1234567890' // Replace with actual Heiwa House place ID
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      console.warn('Google Places API key not configured')
      return NextResponse.json({
        success: false,
        error: 'Google Places API not configured'
      })
    }

    // Fetch reviews from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reviews from Google'
      })
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}
