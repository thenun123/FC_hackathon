/**
 * VideoFeed — Camera capture with hand skeleton overlay
 */

import { useRef, useEffect, useState } from "react";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import useStore from "../store";

export default function VideoFeed({ videoRef, canvasRef, fps, isDetecting, isLoading }) {
  const [cameraError, setCameraError] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const settings = useStore((s) => s.settings);
  const setCameraReady = useStore((s) => s.setCameraReady);

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
            deviceId: settings.cameraId ? { exact: settings.cameraId } : undefined,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraStarted(true);
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(err.message);
        setCameraReady(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setCameraReady(false);
    };
  }, [settings.cameraId, videoRef, setCameraReady]);

  if (cameraError) {
    return (
      <div className="glass-card video-container">
        <div className="camera-placeholder">
          <CameraOff size={48} />
          <p style={{ fontSize: "0.9rem", textAlign: "center", maxWidth: 280 }}>
            Camera access denied or unavailable.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {cameraError}
          </p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card video-container gradient-border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: cameraStarted ? "block" : "none" }}
      />
      <canvas ref={canvasRef} />

      {!cameraStarted && (
        <div className="camera-placeholder">
          <Camera size={48} style={{ animation: "float 2s ease-in-out infinite" }} />
          <p>Starting camera...</p>
        </div>
      )}

      {/* Overlays */}
      <div className="video-overlay">
        {settings.showFps && (
          <span className="fps-badge">{fps} FPS</span>
        )}
        <span
          className="status-badge"
          style={{
            color: isDetecting
              ? "var(--color-accent-success)"
              : "var(--color-text-muted)",
          }}
        >
          {isLoading
            ? "⏳ Loading model..."
            : isDetecting
            ? "✋ Hand detected"
            : "No hand detected"}
        </span>
      </div>

      <div className="video-overlay-right">
        <span className="badge badge-purple">
          {isLoading ? "LOADING" : "LIVE"}
        </span>
      </div>
    </div>
  );
}
