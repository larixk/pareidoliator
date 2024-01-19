import { useCallback, useEffect, useState } from "react";
import "./App.css";

type Node = {
  size: number;
  color: string;

  x: number;
  y: number;

  direction: number;
};

const useAnimationFrame = (callback: (delta: number) => void) => {
  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;

    function loop() {
      const time = performance.now();
      callback(time - lastTime);
      lastTime = time;
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [callback]);
};

const getCurrentColor = () => {
  const r = Math.sin(performance.now() / 1000) * 0.5 + 0.5;
  const g = Math.sin(performance.now() / 10000) * 0.5 + 0.5;
  const b = Math.sin(performance.now() / 1100) * 0.5 + 0.5;
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, 1)`;
};

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);

  const addNodeAt = useCallback(
    (x: number, y: number, direction: number, color: string) => {
      const newNode = {
        x,
        y,
        size: 0.1,
        color: color,
        direction: direction,
      };

      setNodes((nodes) => [...nodes, newNode]);
    },
    []
  );

  const update = useCallback((delta: number) => {
    delta *= (Math.sin(performance.now() / (60000 / 20)) + 1.05) * 0.8;
    setNodes((nodes) => {
      const speed = 0.00004;
      const decay = 0.00004;
      return nodes
        .map((node) => ({
          ...node,
          size: node.size - delta * decay,
          x: node.x + Math.cos(node.direction) * delta * speed,
          y: node.y + Math.sin(node.direction) * delta * speed,
        }))
        .filter((node) => node.size < 100 && node.size > 0);
    });
  }, []);

  useAnimationFrame(() => {
    const [x, y] = [Math.random(), Math.random()]; //mousePosition ?? [0.25, 0.25];
    const direction = Math.sin(performance.now() / 10) * Math.PI * 2;
    const color =
      Math.random() < 0.2
        ? getCurrentColor()
        : Math.random() < 0.05
        ? "rgba(255, 255, 255, 1)"
        : "rgba(0, 0, 0, 1)";

    addNodeAt(x, y, direction, color);
    if (Math.random() < 1) {
      addNodeAt(1 - x, y, -direction - Math.PI, color);
      if (Math.random() < 0.5) {
        addNodeAt(x, 1 - y, -direction, color);
        addNodeAt(1 - x, 1 - y, direction - Math.PI, color);
      }
    }
  });

  useAnimationFrame(update);

  return (
    <div>
      <svg
        width="100vw"
        height="100vh"
        style={{
          display: "block",
        }}
        filter="url(#goo)"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="25"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        <mask id="mask">
          <g filter={"url(#blur)"}>
            {Array.from({ length: 4 }).map((_, i) => (
              <circle
                key={i}
                cx={"50%"}
                cy={Math.sin((performance.now() * i) / 5000) * 50 + 50 + "%"}
                r={(i + 1) * (50 / 4) + "%"}
                fill={"white"}
              />
            ))}
          </g>
        </mask>
        <g mask="url(#mask)">
          {nodes.map((node, i) => {
            const size =
              node.size < 0.05 ? node.size : 0.05 - (node.size - 0.05);
            return (
              <circle
                key={i}
                cx={node.x * 100 + "%"}
                cy={node.y * 100 + "%"}
                r={size * 80 + "%"}
                fill={node.color}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default App;
