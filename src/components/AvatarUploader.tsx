import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fileToAvatarDataUrl } from '@/utils/avatar'
import { GameButton } from '@/components/ui/GameButton'

interface AvatarUploaderProps {
  current?: string
  onChange: (avatar?: string) => void
  label?: string
}

/**
 * 头像上传器：选择图片 → 压缩为 dataURL → 预览；可移除自定义头像。
 */
export function AvatarUploader({ current, onChange, label = '上传头像' }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleFile = async (file?: File | null) => {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      onChange(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '头像处理失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <GameButton variant="spirit" icon="fa-solid fa-image" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? '处理中……' : label}
        </GameButton>
        {current && (
          <GameButton variant="ghost" icon="fa-solid fa-rotate-left" onClick={() => onChange(undefined)}>
            移除
          </GameButton>
        )}
      </div>
      {error && (
        <motion.p className="text-xs text-red-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.p>
      )}
    </div>
  )
}