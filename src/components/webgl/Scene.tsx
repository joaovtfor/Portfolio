"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WebGLSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  eventSource?: React.RefObject<HTMLElement | null>;
}

export function WebGLScene({ children, className, eventSource, ...props }: WebGLSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "50px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("w-full h-full relative", className)}
      {...props}
    >
      <Canvas
        eventSource={(eventSource || containerRef) as unknown as React.RefObject<HTMLElement>}
        eventPrefix="client"
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </Canvas>
    </div>
  );
}
