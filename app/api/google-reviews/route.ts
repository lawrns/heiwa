import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Google Places API configuration
    const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJQ_TFLpYxHw0RiPPMypIv51E'
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      console.warn('Google Places API key not configured')
      return NextResponse.json({
        success: true,
        data: {
          result: {
            rating: 5.0,
            user_ratings_total: 73,
            reviews: []
          },
          status: 'OK'
        },
        fallback: true,
        message: 'Using fallback data - configure GOOGLE_PLACES_API_KEY for real reviews'
      })
    }

    if (!placeId) {
      console.warn('Google Place ID not configured')
      return NextResponse.json({
        success: true,
        data: {
          result: {
            rating: 5.0,
            user_ratings_total: 73,
            reviews: []
          },
          status: 'OK'
        },
        fallback: true,
        message: 'Using fallback data - configure GOOGLE_PLACE_ID for real reviews'
      })
    }

    // Fetch reviews from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message)
      // Return fallback on API error
      return NextResponse.json({
        success: true,
        data: {
          result: {
            rating: 5.0,
            user_ratings_total: 73,
            reviews: []
          },
          status: 'OK'
        },
        fallback: true,
        error: `Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`
      })
    }

    return NextResponse.json({
      success: true,
      data: data,
      fallback: false
    })

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    // Return fallback on error
    return NextResponse.json({
      success: true,
      data: {
        result: {
          rating: 5.0,
          user_ratings_total: 73,
          reviews: []
        },
        status: 'OK'
      },
      fallback: true,
      error: 'Error fetching reviews, using fallback data'
    })
  }
}
