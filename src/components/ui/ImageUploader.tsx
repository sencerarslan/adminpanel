'use client';

import { useState, useCallback, useRef, useId } from 'react';
import Cropper from 'react-easy-crop';
import { toast } from 'sonner';
import { Upload, X, Crop, Loader2, GripVertical, ImageIcon, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Type cast: many CropperProps are 'required' in TS types but have runtime defaultProps,
// so we cast to accept any props to avoid TS errors for props with defaults.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EasyCrop = Cropper as unknown as React.FC<any>;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface UploadedImage {
    /** URL returned by the server after upload */
    url: string;
    /** Local preview URL (object URL) — only during upload phase */
    preview?: string;
    /** Display name */
    name: string;
}

export type ImageUploaderMode = 'single' | 'gallery';

interface ImageUploaderProps {
    /** Label shown above the uploader */
    label?: string;
    /** 'single' for cover image, 'gallery' for multiple images */
    mode?: ImageUploaderMode;
    /** Current value — URL string for single, URL[] for gallery */
    value?: string | string[] | null;
    /** Called when image URL(s) change */
    onChange: (value: string | string[]) => void;
    /** Aspect ratio for crop (width/height). Undefined = free crop */
    aspectRatio?: number;
    /** Max images for gallery mode */
    maxImages?: number;
    className?: string;
    disabled?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create an HTMLImageElement from a URL */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

/** Extract the cropped region as a Blob */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            },
            'image/jpeg',
            0.92
        );
    });
}

/** Upload a File/Blob to the server */
async function uploadToServer(file: File | Blob, name: string): Promise<string> {
    const formData = new FormData();
    const uploadFile =
        file instanceof File ? file : new File([file], name, { type: 'image/jpeg' });
    formData.append('file', uploadFile);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? 'Yükleme başarısız');
    }

    const data = (await response.json()) as { url: string };
    return data.url;
}

// ── CropModal ─────────────────────────────────────────────────────────────────

interface CropModalProps {
    open: boolean;
    imageSrc: string;
    aspectRatio?: number;
    onConfirm: (croppedBlob: Blob) => void;
    onSkip: () => void;
    onClose: () => void;
}

function CropModal({ open, imageSrc, aspectRatio, onConfirm, onSkip, onClose }: CropModalProps): React.JSX.Element {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    async function handleConfirm(): Promise<void> {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onConfirm(blob);
        } catch {
            toast.error('Kırpma işlemi başarısız');
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Crop className="h-5 w-5" />
                        Görseli Kırp
                    </DialogTitle>
                </DialogHeader>

                {/* Crop area */}
                <div className="relative w-full bg-black" style={{ height: '400px' }}>
                    {open && (
                        <EasyCrop
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio ?? 4 / 3}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            showGrid={true}
                            cropShape="rect"
                            style={{
                                containerStyle: { borderRadius: 0 },
                            }}
                        />
                    )}
                </div>

                {/* Zoom slider */}
                <div className="px-6 py-3 flex items-center gap-3 border-t border-border">
                    <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.05}
                        onValueChange={([v]) => setZoom(v ?? 1)}
                        className="flex-1"
                        aria-label="Yakınlaştırma seviyesi"
                    />
                    <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                        {zoom.toFixed(1)}x
                    </span>
                </div>

                <DialogFooter className="px-6 pb-6 gap-2 flex-wrap">
                    <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
                        İptal
                    </Button>
                    <Button variant="outline" onClick={onSkip} disabled={isProcessing}>
                        Kırpmadan Yükle
                    </Button>
                    <Button onClick={handleConfirm} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Kırp &amp; Yükle
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Single Image Uploader ─────────────────────────────────────────────────────

interface SingleUploaderProps {
    value?: string | null;
    onChange: (url: string) => void;
    aspectRatio?: number;
    label?: string;
    disabled?: boolean;
    inputId: string;
}

function SingleUploader({ value, onChange, aspectRatio, label, disabled, inputId }: SingleUploaderProps): React.JSX.Element {
    const [pendingSrc, setPendingSrc] = useState<string | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileSelect(file: File): void {
        const objectUrl = URL.createObjectURL(file);
        setPendingSrc(objectUrl);
        setCropModalOpen(true);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }

    async function doUpload(blob: Blob | File): Promise<void> {
        setIsUploading(true);
        setCropModalOpen(false);

        // We need to track the name outside
        const name = blob instanceof File ? blob.name : 'cropped.jpg';

        try {
            const url = await uploadToServer(blob, name);
            onChange(url);
            toast.success('Görsel başarıyla yüklendi');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Yükleme başarısız';
            toast.error(msg);
        } finally {
            setIsUploading(false);
            if (pendingSrc) {
                URL.revokeObjectURL(pendingSrc);
                setPendingSrc(null);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleCropConfirm(blob: Blob): Promise<void> {
        await doUpload(blob);
    }

    async function handleSkipCrop(): Promise<void> {
        if (!pendingSrc) return;
        // Convert object URL back to blob for upload
        const response = await fetch(pendingSrc);
        const blob = await response.blob();
        await doUpload(blob);
    }

    function handleCropModalClose(): void {
        setCropModalOpen(false);
        if (pendingSrc) {
            URL.revokeObjectURL(pendingSrc);
            setPendingSrc(null);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleRemove(): void {
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <>
            <div
                className={cn(
                    'group relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer overflow-hidden',
                    value
                        ? 'border-border bg-muted/20 min-h-[200px]'
                        : 'border-border hover:border-primary/60 hover:bg-primary/5 min-h-[160px]',
                    disabled && 'pointer-events-none opacity-50'
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
                aria-label={label ?? 'Görsel yükle'}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                    }
                }}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Yükleniyor ve optimize ediliyor…</p>
                    </div>
                ) : value ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt={label ?? 'Kapak görseli'}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                aria-label="Görseli değiştir"
                            >
                                <Upload className="h-4 w-4 mr-1" />
                                Değiştir
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                aria-label="Görseli kaldır"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
                        <div className="rounded-full bg-primary/10 p-4">
                            <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Sürükle &amp; bırak veya tıkla
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPEG, PNG, WebP — maks. 10MB
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Otomatik 1024px ve WebP optimize edilir
                            </p>
                        </div>
                        <Button type="button" size="sm" variant="outline" tabIndex={-1}>
                            <Upload className="h-4 w-4 mr-2" />
                            Görsel Seç
                        </Button>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                }}
                aria-label={label ?? 'Görsel dosyası seç'}
            />

            {pendingSrc && (
                <CropModal
                    open={cropModalOpen}
                    imageSrc={pendingSrc}
                    aspectRatio={aspectRatio}
                    onConfirm={handleCropConfirm}
                    onSkip={handleSkipCrop}
                    onClose={handleCropModalClose}
                />
            )}
        </>
    );
}

// ── Gallery Uploader ──────────────────────────────────────────────────────────

interface GalleryUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
    aspectRatio?: number;
    label?: string;
    maxImages?: number;
    disabled?: boolean;
    inputId: string;
}

function GalleryUploader({
    value,
    onChange,
    aspectRatio,
    label,
    maxImages = 10,
    disabled,
    inputId,
}: GalleryUploaderProps): React.JSX.Element {
    const [pendingSrc, setPendingSrc] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploadingCount, setUploadingCount] = useState(0);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isUploading = uploadingCount > 0;
    const canAddMore = value.length < maxImages;

    function handleFileSelect(file: File): void {
        setPendingFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPendingSrc(objectUrl);
        setCropModalOpen(true);
    }

    function handleFilesSelect(files: FileList): void {
        // Take only what's allowed
        const remaining = maxImages - value.length;
        const available = Array.from(files).slice(0, remaining);
        if (available.length === 0) return;
        // Process first file with crop, rest upload directly
        // For simplicity: open crop modal for first, then auto-upload the rest
        const first = available[0];
        if (!first) return;
        if (available.length > 1) {
            // Auto-upload remaining without crop
            void uploadMultiple(available.slice(1));
        }
        handleFileSelect(first);
    }

    async function uploadMultiple(files: File[]): Promise<void> {
        setUploadingCount((c) => c + files.length);
        const results = await Promise.allSettled(
            files.map((f) => uploadToServer(f, f.name))
        );
        const urls: string[] = [];
        let errorCount = 0;
        results.forEach((r) => {
            if (r.status === 'fulfilled') urls.push(r.value);
            else errorCount++;
        });
        if (urls.length > 0) onChange([...value, ...urls]);
        if (errorCount > 0) toast.error(`${errorCount} görsel yüklenemedi`);
        setUploadingCount((c) => c - files.length);
    }

    async function doUpload(blob: Blob | File): Promise<void> {
        setUploadingCount((c) => c + 1);
        setCropModalOpen(false);
        const name = pendingFile?.name ?? 'cropped.jpg';
        try {
            const url = await uploadToServer(blob, name);
            onChange([...value, url]);
            toast.success('Görsel başarıyla yüklendi');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Yükleme başarısız';
            toast.error(msg);
        } finally {
            setUploadingCount((c) => c - 1);
            if (pendingSrc) {
                URL.revokeObjectURL(pendingSrc);
                setPendingSrc(null);
            }
            setPendingFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleCropConfirm(blob: Blob): Promise<void> {
        await doUpload(blob);
    }

    async function handleSkipCrop(): Promise<void> {
        if (!pendingSrc) return;
        const response = await fetch(pendingSrc);
        const blob = await response.blob();
        await doUpload(blob);
    }

    function handleCropModalClose(): void {
        setCropModalOpen(false);
        if (pendingSrc) {
            URL.revokeObjectURL(pendingSrc);
            setPendingSrc(null);
        }
        setPendingFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleRemove(index: number): void {
        const next = [...value];
        next.splice(index, 1);
        onChange(next);
    }

    // ── Drag-to-reorder
    function handleDragStart(index: number): void {
        setDraggingIndex(index);
    }

    function handleDragEnter(index: number): void {
        setDragOverIndex(index);
    }

    function handleDragEnd(): void {
        if (draggingIndex !== null && dragOverIndex !== null && draggingIndex !== dragOverIndex) {
            const next = [...value];
            const [moved] = next.splice(draggingIndex, 1);
            if (moved) next.splice(dragOverIndex, 0, moved);
            onChange(next);
        }
        setDraggingIndex(null);
        setDragOverIndex(null);
    }

    function handleDropZoneDrop(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            handleFilesSelect(e.dataTransfer.files);
        }
    }

    return (
        <>
            <div className="space-y-3">
                {/* Gallery grid */}
                {value.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {value.map((url, index) => (
                            <div
                                key={url + index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragEnter={() => handleDragEnter(index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={cn(
                                    'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150',
                                    dragOverIndex === index && draggingIndex !== index
                                        ? 'border-primary scale-105 shadow-lg'
                                        : 'border-border',
                                    draggingIndex === index ? 'opacity-40' : 'opacity-100'
                                )}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`Ürün görseli ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* Index badge */}
                                {index === 0 && (
                                    <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                                        Ana
                                    </div>
                                )}
                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-150 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                    <div
                                        className="cursor-grab active:cursor-grabbing p-1.5 bg-white/20 backdrop-blur-sm rounded-md text-white hover:bg-white/30 transition-colors"
                                        aria-label="Sürükle ve yeniden sırala"
                                        title="Sürükleyerek sırala"
                                    >
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="p-1.5 bg-red-500/80 backdrop-blur-sm rounded-md text-white hover:bg-red-600 transition-colors"
                                        aria-label={`Görsel ${index + 1} sil`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Loading placeholders */}
                        {Array.from({ length: uploadingCount }).map((_, i) => (
                            <div
                                key={`loading-${i}`}
                                className="relative aspect-square rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center"
                            >
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Drop zone for adding more */}
                {canAddMore && (
                    <div
                        className={cn(
                            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer py-6 px-4',
                            'border-border hover:border-primary/60 hover:bg-primary/5',
                            disabled && 'pointer-events-none opacity-50',
                            isUploading && 'opacity-75'
                        )}
                        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                        onDrop={handleDropZoneDrop}
                        onDragOver={(e) => e.preventDefault()}
                        role="button"
                        tabIndex={0}
                        aria-label={label ?? 'Görsel ekle'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        {isUploading && value.length === 0 ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Yükleniyor…</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {value.length === 0
                                            ? 'Görsel ekle (birden fazla seçebilirsiniz)'
                                            : `Görsel ekle (${value.length}/${maxImages})`}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Sürükle &amp; bırak veya tıkla · Yükleme sırasında kırpabilirsiniz
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        JPEG, PNG, WebP · Otomatik optimize edilir (maks 1024px, WebP)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!canAddMore && (
                    <p className="text-xs text-muted-foreground text-center">
                        Maksimum {maxImages} görsel sınırına ulaşıldı
                    </p>
                )}
            </div>

            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        handleFilesSelect(e.target.files);
                    }
                }}
                aria-label="Görsel dosyaları seç"
            />

            {pendingSrc && (
                <CropModal
                    open={cropModalOpen}
                    imageSrc={pendingSrc}
                    aspectRatio={aspectRatio}
                    onConfirm={handleCropConfirm}
                    onSkip={handleSkipCrop}
                    onClose={handleCropModalClose}
                />
            )}
        </>
    );
}

// ── Main exported component ───────────────────────────────────────────────────

export function ImageUploader({
    label,
    mode = 'single',
    value,
    onChange,
    aspectRatio,
    maxImages = 10,
    className,
    disabled = false,
}: ImageUploaderProps): React.JSX.Element {
    const uid = useId();
    const inputId = `image-uploader-${uid}`;

    if (mode === 'gallery') {
        const galleryValue = Array.isArray(value) ? value : value ? [value] : [];
        return (
            <div className={cn('space-y-2', className)}>
                <GalleryUploader
                    value={galleryValue}
                    onChange={(urls) => onChange(urls)}
                    aspectRatio={aspectRatio}
                    label={label}
                    maxImages={maxImages}
                    disabled={disabled}
                    inputId={inputId}
                />
            </div>
        );
    }

    const singleValue = typeof value === 'string' ? value : Array.isArray(value) ? (value[0] ?? '') : '';

    return (
        <div className={cn('space-y-2', className)}>
            <SingleUploader
                value={singleValue}
                onChange={(url) => onChange(url)}
                aspectRatio={aspectRatio}
                label={label}
                disabled={disabled}
                inputId={inputId}
            />
        </div>
    );
}
