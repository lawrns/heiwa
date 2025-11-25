import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(_request: NextRequest) {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'heiwalogo-white.webp')
    
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    const logoBuffer = fs.readFileSync(logoPath)
    
    return new NextResponse(logoBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error serving logo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
