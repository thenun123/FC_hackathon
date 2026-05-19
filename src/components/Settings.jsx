/**
 * Settings — Configuration panel
 */

import { useState, useEffect } from "react";
import { Sliders, Monitor, Volume2, Eye, RotateCcw } from "lucide-react";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import useStore from "../store";

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const { voices } = useSpeechSynthesis();
  const [cameras, setCameras] = useState([]);

  // Enumerate cameras
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoDevices);
      } catch (e) {
        console.warn("Cannot enumerate cameras:", e);
      }
    }
    getCameras();
  }, []);

  return (
    <div className="settings-container">
      {/* Detection Settings */}
      <div className="glass-card settings-section">
        <h3>
          <Sliders
            size={14}
            style={{
              display: "inline",
              marginRight: "0.4rem",
              verticalAlign: "middle",
            }}
          />
          Detection
        </h3>

        <div className="setting-row">
          <span className="setting-label">Confidence Threshold</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="range"
              min="30"
              max="95"
              value={settings.confidenceThreshold * 100}
              onChange={(e) =>
                updateSettings({ confidenceThreshold: e.target.value / 100 })
              }
            />
            <span className="setting-value">
              {(settings.confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-label">Smoothing Window</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="range"
              min="5"
              max="25"
              value={settings.smoothingFrames}
              onChange={(e) =>
                updateSettings({ smoothingFrames: parseInt(e.target.value) })
              }
            />
            <span className="setting-value">{settings.smoothingFrames} frames</span>
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-label">Confirm Threshold</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="range"
              min="3"
              max="15"
              value={settings.confirmThreshold}
              onChange={(e) =>
                updateSettings({ confirmThreshold: parseInt(e.target.value) })
              }
            />
            <span className="setting-value">{settings.confirmThreshold} votes</span>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="glass-card settings-section">
        <h3>
          <Eye
            size={14}
            style={{
              display: "inline",
              marginRight: "0.4rem",
              verticalAlign: "middle",
            }}
          />
          Display
        </h3>

        <div className="setting-row">
          <span className="setting-label">Show Skeleton Overlay</span>
          <label
            style={{
              position: "relative",
              width: 44,
              height: 24,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={settings.showSkeleton}
              onChange={(e) => updateSettings({ showSkeleton: e.target.checked })}
              style={{ display: "none" }}
            />
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: settings.showSkeleton
                  ? "var(--color-accent-primary)"
                  : "var(--color-bg-primary)",
                transition: "background 0.2s",
                border: "1px solid rgba(124, 58, 237, 0.3)",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "white",
                  position: "absolute",
                  top: 3,
                  left: settings.showSkeleton ? 23 : 3,
                  transition: "left 0.2s",
                }}
              />
            </div>
          </label>
        </div>

        <div className="setting-row">
          <span className="setting-label">Show FPS Counter</span>
          <label
            style={{
              position: "relative",
              width: 44,
              height: 24,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={settings.showFps}
              onChange={(e) => updateSettings({ showFps: e.target.checked })}
              style={{ display: "none" }}
            />
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: settings.showFps
                  ? "var(--color-accent-primary)"
                  : "var(--color-bg-primary)",
                transition: "background 0.2s",
                border: "1px solid rgba(124, 58, 237, 0.3)",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "white",
                  position: "absolute",
                  top: 3,
                  left: settings.showFps ? 23 : 3,
                  transition: "left 0.2s",
                }}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Camera */}
      {cameras.length > 1 && (
        <div className="glass-card settings-section">
          <h3>
            <Monitor
              size={14}
              style={{
                display: "inline",
                marginRight: "0.4rem",
                verticalAlign: "middle",
              }}
            />
            Camera
          </h3>
          <div className="setting-row">
            <span className="setting-label">Select Camera</span>
            <select
              value={settings.cameraId || ""}
              onChange={(e) =>
                updateSettings({ cameraId: e.target.value || null })
              }
            >
              <option value="">Default</option>
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Voice Settings */}
      <div className="glass-card settings-section">
        <h3>
          <Volume2
            size={14}
            style={{
              display: "inline",
              marginRight: "0.4rem",
              verticalAlign: "middle",
            }}
          />
          Voice (TTS)
        </h3>

        <div className="setting-row">
          <span className="setting-label">Speed</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.ttsRate * 100}
              onChange={(e) =>
                updateSettings({ ttsRate: e.target.value / 100 })
              }
            />
            <span className="setting-value">{settings.ttsRate.toFixed(1)}x</span>
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-label">Pitch</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.ttsPitch * 100}
              onChange={(e) =>
                updateSettings({ ttsPitch: e.target.value / 100 })
              }
            />
            <span className="setting-value">{settings.ttsPitch.toFixed(1)}</span>
          </div>
        </div>

        {voices.length > 0 && (
          <div className="setting-row">
            <span className="setting-label">Voice</span>
            <select
              value={settings.ttsVoice || ""}
              onChange={(e) =>
                updateSettings({ ttsVoice: e.target.value || null })
              }
              style={{ maxWidth: 180 }}
            >
              <option value="">Default</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.replace(/\(.+\)/, "").trim()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* About */}
      <div className="glass-card settings-section">
        <h3>About</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <strong className="gradient-text">ASL Translator</strong> — Real-time American Sign Language
          fingerspelling recognition powered by MediaPipe and browser-native AI.
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          Everything runs 100% in your browser. No backend, no API keys, no cost.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <span className="badge badge-purple">MediaPipe</span>
          <span className="badge badge-cyan">ONNX Runtime</span>
          <span className="badge badge-green">Browser AI</span>
        </div>
      </div>
    </div>
  );
}
