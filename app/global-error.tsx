"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#161618", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: 420, width: "100%", background: "#1e1e20", border: "1px solid #333", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.75rem" }}>
              Something went wrong
            </div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              {error?.message || "A critical error occurred."}
            </p>
            {error?.digest && (
              <p style={{ color: "#555", fontSize: "0.75rem", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => { try { reset() } catch { window.location.reload() } }}
              style={{ marginTop: "1rem", background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.25rem", fontSize: "0.875rem", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
