import { useRef } from 'react'
import { Button } from './ui/button'

interface SignatureCanvasProps {
  onSave: (signature: string) => void
  onCancel: () => void
}

export default function SignatureCanvas({ onSave, onCancel }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const context = canvas.getContext('2d')
    if (context) {
      context.beginPath()
      context.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const context = canvas.getContext('2d')
    if (context) {
      context.lineTo(x, y)
      context.strokeStyle = '#000'
      context.lineWidth = 2
      context.lineCap = 'round'
      context.stroke()
    }
  }

  const stopDrawing = () => {
    isDrawing.current = false
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signature = canvas.toDataURL('image/png')
    onSave(signature)
  }

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full border-2 border-border rounded bg-white cursor-crosshair"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={clearCanvas}
          className="flex-1"
        >
          Hapus
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          className="flex-1"
        >
          Simpan Tanda Tangan
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="w-full"
      >
        Batal
      </Button>
    </div>
  )
}
