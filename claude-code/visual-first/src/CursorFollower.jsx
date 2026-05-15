import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export default function CursorFollower() {
  const mouseX = useMotionValue(-40)
  const mouseY = useMotionValue(-40)

  // Low stiffness + high damping = heavy mercury-like lag
  const springX = useSpring(mouseX, { stiffness: 45, damping: 18, mass: 0.6 })
  const springY = useSpring(mouseY, { stiffness: 45, damping: 18, mass: 0.6 })

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX - 10)
      mouseY.set(e.clientY - 10)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mouseX, mouseY])

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        position: 'fixed',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '1.5px solid #f5f5f5',
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
      }}
    />
  )
}
