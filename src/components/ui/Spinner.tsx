import { LoaderCircle } from 'lucide-react'

interface SpinnerProps {
  size?: 'small' | 'default'
  label?: string
}

const PX = { small: 14, default: 22 } as const

function Spinner({ size = 'default', label }: SpinnerProps) {
  return (
    <LoaderCircle
      className={`spinner${size === 'small' ? ' spinner--small' : ''}`}
      size={PX[size]}
      role="status"
      aria-label={label ?? 'Loading'}
    />
  )
}

export default Spinner
