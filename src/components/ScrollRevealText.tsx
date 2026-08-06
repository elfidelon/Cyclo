import { useRef } from 'react'
import { useScroll } from 'framer-motion'
import AnimatedLetter from './AnimatedLetter'

export default function ScrollRevealText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const totalChars = text.length
  const words = text.split(' ')
  let globalIndex = 0

  return (
    <p ref={ref} className={className}>
      {words.map((word, wi) => {
        const wordEl = (
          <span key={wi} className="inline-block">
            {word.split('').map((char, ci) => {
              const charProgress = globalIndex / totalChars
              globalIndex += 1
              const range: [number, number] = [charProgress - 0.1, charProgress + 0.05]
              return <AnimatedLetter key={ci} char={char} progress={scrollYProgress} range={range} />
            })}
          </span>
        )
        globalIndex += 1 // account for the space between words
        return wi < words.length - 1 ? (
          <span key={`w-${wi}`}>
            {wordEl}{' '}
          </span>
        ) : (
          wordEl
        )
      })}
    </p>
  )
}
