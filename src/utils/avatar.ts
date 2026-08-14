/**
 * 头像工具：将用户选择的图片压缩为正方形头像 dataURL（256×256 JPEG q0.8）。
 * 压缩后体积约 20~50KB，适合存 localStorage（上限约 5MB）。
 */

const AVATAR_SIZE = 256
const AVATAR_QUALITY = 0.8

/**
 * 将图片文件压缩为正方形头像 dataURL。
 * @throws 非图片或读取失败时抛出 Error
 */
export function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('图片解析失败'))
      img.onload = () => {
        try {
          resolve(drawAvatar(img))
        } catch {
          reject(new Error('图片压缩失败'))
        }
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 将图像绘制为居中裁剪的正方形缩略图，返回 JPEG dataURL。
 */
function drawAvatar(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 不可用')

  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
  return canvas.toDataURL('image/jpeg', AVATAR_QUALITY)
}