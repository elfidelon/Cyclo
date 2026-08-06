import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export interface TextSegment {
  text: string
  className?: string
}

export default function WordsPullUpMultiStyle({
  segments,
  containerClassName = '',
}: {
  segments: TextSegment[]
  containerClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  let wordIndex = 0

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${containerClassName}`}>
      {segments.map((segment, segIdx) =>
        segment.text.split(' ').map((word, i) => {
          const delay = wordIndex * 0.08
          wordIndex += 1
          return (
            <span key={`${segIdx}-${i}`} className="inline-block mr-[0.28em]">
              <motion.span
                className={`inline-block ${segment.className ?? ''}`}
                initial={{ y: 20, opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          )
        }),
      )}
    </div>
  )
}
