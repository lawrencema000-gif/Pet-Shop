"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Link2, Trash2, ArrowUp, ArrowDown, Star, Loader2, ImagePlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

interface Props {
  productId: string;
}

export function ProductImagesManager({ productId }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order");
    setImages((data ?? []) as ProductImage[]);
  }, [productId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validate
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Use JPG, PNG, WebP, or GIF.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Max 5MB.`);
        return;
      }
    }

    setError(null);
    setUploading(true);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        setUploadProgress(null);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      // Insert into product_images table
      await supabase.from("product_images").insert({
        product_id: productId,
        url: urlData.publicUrl,
        display_order: images.length + i,
        is_primary: images.length === 0 && i === 0,
      });
    }

    setUploading(false);
    setUploadProgress(null);
    await loadImages();
  }

  async function addImageUrl() {
    if (!urlInput.trim()) return;
    try {
      const parsed = new URL(urlInput);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        setError("URL must start with https:// or http://");
        return;
      }
    } catch {
      setError("Invalid URL format");
      return;
    }

    setError(null);
    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: productId,
      url: urlInput.trim(),
      display_order: images.length,
      is_primary: images.length === 0,
    });

    if (insertError) {
      setError("Failed to add image: " + insertError.message);
      return;
    }

    setUrlInput("");
    setUrlMode(false);
    await loadImages();
  }

  async function deleteImage(img: ProductImage) {
    // If it's a Supabase Storage URL, delete from storage too
    const storageBase = "/storage/v1/object/public/product-images/";
    if (img.url.includes(storageBase)) {
      const path = decodeURIComponent(img.url.split(storageBase)[1]);
      await supabase.storage.from("product-images").remove([path]);
    }

    await supabase.from("product_images").delete().eq("id", img.id);

    // If deleted image was primary, set first remaining as primary
    if (img.is_primary) {
      const remaining = images.filter((i) => i.id !== img.id);
      if (remaining.length > 0) {
        await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", remaining[0].id);
      }
    }

    await loadImages();
  }

  async function setPrimary(imgId: string) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
    await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imgId);
    await loadImages();
  }

  async function moveImage(imgId: string, direction: "up" | "down") {
    const idx = images.findIndex((i) => i.id === imgId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const a = images[idx];
    const b = images[swapIdx];

    await Promise.all([
      supabase.from("product_images").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("product_images").update({ display_order: a.display_order }).eq("id", b.id),
    ]);

    await loadImages();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-sale/10 border border-sale/20 rounded-lg p-3 flex items-start gap-2">
          <p className="text-sm text-sale flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-sale/60 hover:text-sale">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/40"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-accent animate-spin" />
            <p className="text-sm text-muted">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ImagePlus size={32} className="text-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag & drop images here, or
              </p>
              <p className="text-xs text-muted mt-0.5">
                JPG, PNG, WebP, GIF up to 5MB each
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors"
              >
                <Upload size={14} /> Upload Files
              </button>
              <button
                onClick={() => setUrlMode(!urlMode)}
                className="inline-flex items-center gap-2 border border-border text-foreground px-4 py-2 text-sm font-medium rounded-md hover:bg-surface transition-colors"
              >
                <Link2 size={14} /> Paste URL
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* URL Input */}
      {urlMode && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
          />
          <button
            onClick={addImageUrl}
            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark"
          >
            Add
          </button>
          <button
            onClick={() => { setUrlMode(false); setUrlInput(""); }}
            className="px-3 py-2 text-sm border border-border rounded-md hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                img.is_primary ? "border-accent" : "border-border"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt_text ?? `Product image ${idx + 1}`}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f1f1f1'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EBroken%3C/text%3E%3C/svg%3E";
                }}
              />

              {/* Badge */}
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                #{idx + 1}
              </span>

              {img.is_primary && (
                <span className="absolute top-2 right-2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Star size={10} className="fill-current" /> Primary
                </span>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-1.5">
                  {idx > 0 && (
                    <button
                      onClick={() => moveImage(img.id, "up")}
                      className="p-2 bg-white text-foreground rounded-md hover:bg-surface text-xs"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      onClick={() => moveImage(img.id, "down")}
                      className="p-2 bg-white text-foreground rounded-md hover:bg-surface text-xs"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  )}
                  {!img.is_primary && (
                    <button
                      onClick={() => setPrimary(img.id)}
                      className="p-2 bg-white text-foreground rounded-md hover:bg-surface text-xs"
                      title="Set as primary"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(img)}
                    className="p-2 bg-sale text-white rounded-md hover:bg-sale/90 text-xs"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-center text-sm text-muted py-4">
          No images yet. Upload files or paste a URL to get started.
        </p>
      )}
    </div>
  );
}
