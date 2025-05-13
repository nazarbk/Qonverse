import { useEffect, useRef } from "react";

export const useRadialMagnetEffect = () => {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - elCenterX;
      const dy = e.clientY - elCenterY;
      let dist = Math.sqrt(dx * dx + dy * dy);

      const maxRadius = 140;
      const activationRadius = 200;

      // Evita divisiones por cero
      if (dist < 1) dist = 1;

      if (dist < activationRadius) {
        const strength = -1;//(activationRadius - dist) / activationRadius;
        const offsetX = dx * strength;// * (maxRadius / dist);
        const offsetY = dy * strength;// * (maxRadius / dist);

        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      } else {
        el.style.transform = "translate(0, 0)";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return ref;
};
