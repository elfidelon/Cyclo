const SPIRAL_PATH =
  'M50 88C24 88 3 67 3 41c0-24 19-43 43-39 22 4 34 24 30 46-4 20-22 30-40 24-16-6-22-22-16-36 6-14 22-18 34-10 10 6 12 20 4 28-6 6-16 4-20-4-4-6 0-14 8-14'

export default function Logo({ className = 'w-6 h-6', stroke = '#008998' }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path d={SPIRAL_PATH} stroke={stroke} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
