import { useSyncExternalStore } from "react"

function getServerSnapshot(): boolean {
  return false
}

export default function useScroll(threshold: number) {
  const subscribe = (callback: () => void) => {
    window.addEventListener("scroll", callback)
    return () => window.removeEventListener("scroll", callback)
  }

  const getSnapshot = () => {
    return window.scrollY > threshold
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
