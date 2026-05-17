export function countUp(to: number, duration: number, onUpdate: (v: number) => void): () => void {
  if (to === 0) {
    onUpdate(0)
    return () => undefined
  }
  const start = performance.now()
  let raf: number
  const step = (now: number): void => {
    const t = Math.min((now - start) / duration, 1)
    onUpdate(to * (1 - Math.pow(1 - t, 3)))
    if (t < 1) raf = requestAnimationFrame(step)
    else onUpdate(to)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}
