import { useRef, useEffect, useState, useCallback } from 'react';

const COLORS = [
  '#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261',
  '#a8dadc', '#6a4c93', '#f77f00', '#4cc9f0', '#b5179e',
];

interface WheelProps {
  names: string[];
}

export default function Wheel({ names }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const sliceAngle = (2 * Math.PI) / names.length;

    ctx.clearRect(0, 0, size, size);

    // Draw slices
    names.forEach((name, i) => {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#16171d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Name label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(11, Math.min(15, 120 / names.length))}px system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(name, radius - 12, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#16171d';
    ctx.fill();
    ctx.strokeStyle = '#a5b4c8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer arrow (outside wheel at top, pointing down into wheel)
    const arrowTip = cy - radius + 2;   // tip just inside the wheel edge
    const arrowBase = arrowTip - 36;    // base 36px above the tip
    const arrowHalfWidth = 16;
    ctx.beginPath();
    ctx.moveTo(cx, arrowTip);                          // tip
    ctx.lineTo(cx - arrowHalfWidth, arrowBase);        // bottom-left
    ctx.lineTo(cx + arrowHalfWidth, arrowBase);        // bottom-right
    ctx.closePath();
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#16171d';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [names]);

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  const spin = () => {
    if (spinning || names.length === 0) return;
    setWinner(null);
    setSpinning(true);

    const sliceAngle = (2 * Math.PI) / names.length;
    // Pick a random winner index
    const winnerIndex = Math.floor(Math.random() * names.length);
    // Total rotation: several full spins + land on winner
    // Pointer is at top (−π/2). We want the middle of the winner slice at top.
    // Angle of winner slice center from rotation=0: winnerIndex * sliceAngle + sliceAngle/2
    // We need: rotation + winnerIndex * sliceAngle + sliceAngle/2 = -π/2 + 2πk
    const targetAngle = -Math.PI / 2 - (winnerIndex * sliceAngle + sliceAngle / 2);
    const extraSpins = 6 * 2 * Math.PI; // 6 full rotations
    const totalRotation = extraSpins + ((targetAngle - rotationRef.current) % (2 * Math.PI));

    const startRotation = rotationRef.current;
    const endRotation = startRotation + totalRotation + 2 * Math.PI * 3;
    const duration = 4000; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startRotation + (endRotation - startRotation) * eased;
      rotationRef.current = current;
      drawWheel(current);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = endRotation;
        setSpinning(false);
        setWinner(names[winnerIndex]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  if (names.length === 0) {
    return <p className="wheel__empty">Add team members to spin the wheel!</p>;
  }

  return (
    <div className="wheel">
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        className="wheel__canvas"
      />
      <button
        type="button"
        className="wheel__spin-btn"
        onClick={spin}
        disabled={spinning}
      >
        {spinning ? 'Spinning…' : 'Spin!'}
      </button>
      {winner && !spinning && (
        <p className="wheel__result">
          💀 <strong>{winner}</strong> gets the PR!
        </p>
      )}
    </div>
  );
}
