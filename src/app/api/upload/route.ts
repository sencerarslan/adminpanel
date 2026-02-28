import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';

const MAX_DIMENSION = 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request: NextRequest): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) {
        return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'Dosya bulunamadı' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { message: 'Desteklenmeyen dosya türü. Yalnızca JPEG, PNG, GIF ve WebP desteklenmektedir.' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB before optimization)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: 'Dosya boyutu 10MB sınırını aşıyor.' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Optimize with Sharp: resize max 1024px (width or height), convert to WebP
        const optimizedBuffer = await sharp(buffer)
            .resize(MAX_DIMENSION, MAX_DIMENSION, {
                fit: 'inside',        // maintains aspect ratio
                withoutEnlargement: true, // don't upscale small images
            })
            .webp({ quality: 82 }) // high quality WebP
            .toBuffer();

        // Generate unique filename
        const filename = `${randomUUID()}.webp`;
        let url: string;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blobInfo = await put(`uploads/${filename}`, optimizedBuffer, {
                access: 'public',
                contentType: 'image/webp',
            });
            url = blobInfo.url;
        } else {
            if (process.env.VERCEL) {
                throw new Error("Vercel Blob yapılandırılmadı. Lütfen Vercel projenizde bir Blob Storage oluşturup ayarlarını yapın.");
            }
            // Ensure upload dir exists
            await mkdir(UPLOAD_DIR, { recursive: true });
            const filepath = path.join(UPLOAD_DIR, filename);

            await writeFile(filepath, optimizedBuffer);
            url = `/uploads/${filename}`;
        }

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
        return NextResponse.json(
            { message: `Yükleme sırasında bir hata oluştu: ${message}` },
            { status: 500 }
        );
    }
}
