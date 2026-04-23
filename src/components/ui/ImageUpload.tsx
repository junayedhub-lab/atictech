import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket?: string
  label?: string
  helperText?: string
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'banner-images',
  label = 'Upload Image',
  helperText = 'JPG, PNG or WebP. Max 2MB.'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large (max 2MB)')
      return
    }

    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 block">{label}</label>
      
      <div className="relative group">
        {value ? (
          <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-700">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-all"
                title="Change image"
              >
                <Upload size={18} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500/70 transition-all"
                title="Remove image"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-40 border-2 border-dashed border-slate-700/50 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 hover:bg-slate-800/20 transition-all group disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={32} className="text-blue-500 animate-spin" />
                <span className="text-sm text-slate-400">Uploading...</span>
              </>
            ) : (
              <>
                <div className="p-3 bg-slate-800 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <ImageIcon size={24} className="text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">Click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">{helperText}</p>
                </div>
              </>
            )}
          </button>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  )
}
