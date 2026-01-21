import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, options } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Apply optimizations
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      brightness = 100,
      contrast = 100
    } = options || {}

    let image = sharp(buffer)

    // Resize if dimensions specified
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
    }

    // Apply brightness and contrast
    if (brightness !== 100 || contrast !== 100) {
      image = image.modulate({
        brightness: brightness / 100,
        ...(contrast !== 100 && { saturation: contrast / 100 })
      })
    }

    // Convert to target format
    switch (format) {
      case 'webp':
        image = image.webp({ quality })
        break
      case 'jpeg':
        image = image.jpeg({ quality, progressive: true })
        break
      case 'png':
        image = image.png({ quality, progressive: true })
        break
      default:
        image = image.webp({ quality })
    }

    const optimizedBuffer = await image.toBuffer()
    const metadata = await sharp(optimizedBuffer).metadata()

    // Return optimized image as base64
    const base64 = `data:image/${format};base64,${optimizedBuffer.toString('base64')}`

    return NextResponse.json({
      success: true,
      url: base64,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: optimizedBuffer.length
      }
    })
  } catch (error) {
    console.error('Image optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')
  const width = searchParams.get('width')
  const height = searchParams.get('height')
  const quality = searchParams.get('quality')
  const format = searchParams.get('format') || 'webp'
  const brightness = searchParams.get('brightness')
  const contrast = searchParams.get('contrast')

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    let image = sharp(buffer)

    if (width || height) {
      image = image.resize(
        width ? parseInt(width) : undefined,
        height ? parseInt(height) : undefined,
        {
          fit: 'cover',
          position: 'center'
        }
      )
    }

    const qualityValue = quality ? parseInt(quality) : 85
    const brightnessValue = brightness ? parseInt(brightness) : 100
    const contrastValue = contrast ? parseInt(contrast) : 100

    if (brightnessValue !== 100 || contrastValue !== 100) {
      image = image.modulate({
        brightness: brightnessValue / 100,
        ...(contrastValue !== 100 && { saturation: contrastValue / 100 })
      })
    }

    switch (format) {
      case 'webp':
        image = image.webp({ quality: qualityValue })
        break
      case 'jpeg':
        image = image.jpeg({ quality: qualityValue, progressive: true })
        break
      case 'png':
        image = image.png({ quality: qualityValue, progressive: true })
        break
      default:
        image = image.webp({ quality: qualityValue })
    }

    const optimizedBuffer = await image.toBuffer()
    const metadata = await sharp(optimizedBuffer).metadata()

    return new NextResponse(optimizedBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Content-Length': optimizedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Image optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 }
    )
  }
}
