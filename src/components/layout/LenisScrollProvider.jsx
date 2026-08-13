import React, { useEffect } from "react";
import Lenis from "lenis";

export function scrollToTop(smooth = false) {
  if (window.lenis) {
    window.lenis.scrollTo(0, { immediate: !smooth });
  }
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? "smooth" : "instant",
  });
}

export function LenisScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;
    window.scrollToTop = scrollToTop;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.lenis;
      delete window.scrollToTop;
    };
  }, []);

  return <>{children}</>;
}
