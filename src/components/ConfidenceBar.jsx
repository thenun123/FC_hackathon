/**
 * ConfidenceBar — Animated SVG radial confidence ring
 */

export default function ConfidenceBar({ value = 0, size = 120, children }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value * circumference;

  // Color based on confidence
  const hue = value * 120; // 0 = red, 60 = yellow, 120 = green
  const color = `hsl(${hue}, 80%, 55%)`;

  return (
    <div
      className="confidence-ring-container"
      style={{ width: size, height: size }}
    >
      <svg
        className="confidence-ring-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <circle
          className="confidence-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        {/* Animated fill ring */}
        <circle
          className="confidence-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: value > 0.8 ? `drop-shadow(0 0 6px ${color})` : "none",
          }}
        />
      </svg>
      <div
        className="confidence-ring-label"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
