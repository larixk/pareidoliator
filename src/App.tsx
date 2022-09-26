import { useCallback, useEffect, useState } from "react";
import "./App.css";

type Node = {
  size: number;
  color: string;

  x: number;
  y: number;

  direction: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mapRange = (
  value: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number
) => {
  return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
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

const useLoadImageData = (src: string) => {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setImageData(ctx.getImageData(0, 0, img.width, img.height));
      }
    };
  }, [src]);

  return imageData;
};

const getCurrentColor = () => {
  const r = Math.sin(performance.now() / 1000) * 0.5 + 0.5;
  const g = Math.sin(performance.now() / 10000) * 0.5 + 0.5;
  const b = Math.sin(performance.now() / 1100) * 0.5 + 0.5;
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, 1)`;
};

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);

  // const imageData = useLoadImageData("test.png");

  const addNodeAt = useCallback(
    (x: number, y: number, direction: number, color: string) => {
      // const { data, width, height } = imageData ?? {};
      // const getColorFor = (x: number, y: number) => {
      //   return getCurrentColor();

      //   // if (data && width && height) {
      //   //   const index = Math.floor(y * width * height + x * width) * 4;
      //   //   return `rgb(${data[index]}, ${data[index + 1]}, ${data[index + 2]})`;
      //   // }
      //   // return "black";
      // };

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
    delta *= Math.sin(performance.now() / (60000 / 50)) + 1;
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

  const [mousePosition, setMousePosition] = useState<[number, number] | null>(
    null
  );

  useAnimationFrame(() => {
    const [x, y] = [Math.random(), Math.random()]; //mousePosition ?? [0.25, 0.25];
    const direction = Math.sin(performance.now() / 10) * Math.PI * 2;
    const color =
      Math.random() < 0.8
        ? getCurrentColor()
        : Math.random() < 0.5
        ? "rgba(255, 255, 255, 1)"
        : "rgba(0, 0, 0, 1)";

    addNodeAt(x, y, direction, color);
    if (Math.random() < 1) {
      addNodeAt(1 - x, y, -direction - Math.PI, color);
      if (Math.random() < 0.8) {
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
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          setMousePosition([x, y]);
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
        </defs>
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x * 100 + "%"}
            cy={node.y * 100 + "%"}
            r={
              (node.size < 0.05 ? node.size : 0.05 - (node.size - 0.05)) * 100 +
              "%"
            }
            fill={node.color}
            style={{ opacity: Math.min(1, 1000 / node.size) }}
          />
        ))}
      </svg>
    </div>
  );
}

export default App;
