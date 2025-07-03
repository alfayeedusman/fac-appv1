import { useEffect, useRef } from "react";

interface UserQRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export default function UserQRCode({
  data,
  size = 200,
  className = "",
}: UserQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code generator for demo purposes
    // In a real app, you'd use a proper QR code library like qrcode
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Create a simple pattern based on the data
    const gridSize = 25;
    const cellSize = size / gridSize;

    // Generate a hash-like pattern from the data
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Set random seed based on hash
    let seed = Math.abs(hash);
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    // Draw QR-like pattern
    ctx.fillStyle = "#000000";

    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      // Outer border
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        (x + 1) * cellSize,
        (y + 1) * cellSize,
        5 * cellSize,
        5 * cellSize,
      );
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        (x + 2) * cellSize,
        (y + 2) * cellSize,
        3 * cellSize,
        3 * cellSize,
      );
    };

    // Draw finder patterns in corners
    drawFinderPattern(0, 0);
    drawFinderPattern(gridSize - 7, 0);
    drawFinderPattern(0, gridSize - 7);

    // Draw data pattern
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Skip finder pattern areas
        const inFinderPattern =
          (x < 9 && y < 9) ||
          (x >= gridSize - 9 && y < 9) ||
          (x < 9 && y >= gridSize - 9);

        if (!inFinderPattern && random() > 0.5) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add timing patterns
    ctx.fillStyle = "#000000";
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [data, size]);

  return (
    <div className={`inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
