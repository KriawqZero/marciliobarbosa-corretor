import { NextResponse } from 'next/server'
import { env } from 'process'
import { uploadToMinIO, getImageDimensions, generateTempPath } from '@/lib/storage'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice('Bearer '.length)
  return token === env.API_PASSWORD
}

function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType)
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validate MIME type
    if (!isValidMimeType(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Permitido: jpeg, jpg, png, webp' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Detect image dimensions
    const { width, height } = await getImageDimensions(buffer)

    // Generate temp ID and upload path
    const tempId = crypto.randomUUID()
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = generateTempPath(filename, tempId)

    // Upload to MinIO
    const url = await uploadToMinIO(buffer, path, file.type)

    return NextResponse.json({
      url,
      width,
      height,
      tempId,
      filename,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Erro ao fazer upload',
        detail: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
