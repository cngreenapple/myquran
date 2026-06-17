import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "system-ui",
            textAlign: "center",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", color: "#dc2626" }}>
            ⚠️ Terjadi Kesalahan
          </h1>
          <p style={{ color: "#64748b", maxWidth: "500px" }}>
            Aplikasi mengalami error. Silakan refresh halaman.
          </p>
          <details
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f1f5f9",
              borderRadius: "0.5rem",
              maxWidth: "600px",
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              Detail Error
            </summary>
            <pre
              style={{
                marginTop: "0.5rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "#047857",
              color: "white",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

// Register PWA service worker (autoUpdate)
if ("serviceWorker" in navigator) {
  // vite-plugin-pwa akan auto-register, ini hanya untuk safety
  window.addEventListener("load", () => {
    navigator.serviceWorker.ready.catch((err) => {
      console.warn("[PWA] Service worker registration failed:", err);
    });
  });
}