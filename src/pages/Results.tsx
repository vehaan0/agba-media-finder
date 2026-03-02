import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Download, Check, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ImageResult = {
  image: string
  url: string
  similarity: number
}

type VideoResult = {
  video: string
  url: string
}

type ResultsState = {
  images: ImageResult[]
  videos: VideoResult[]
  event: string
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ResultsState | null

  useEffect(() => {
    if (!state) navigate("/")
  }, [state, navigate])

  if (!state) return null

  const { images, videos, event } = state

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [downloadLog, setDownloadLog] = useState<string | null>(null)

  const toggleSelect = (image: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(image) ? next.delete(image) : next.add(image)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(images.map((i) => i.image)))
  }

  const clearAll = () => {
    setSelected(new Set())
  }

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadLog("⏳ Preparing your high-resolution images…")

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: Array.from(selected).map((key) => {
              const img = images.find((i) => i.image === key)
              return {
                name: img?.image,
                url: img?.url,
              }
            }),
          }),
        }
      )

      if (!res.ok) throw new Error("Download failed")

      setDownloadLog("⬇️ Download will start automatically…")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "agba-media.zip"
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)

      setDownloadLog("✅ Download started successfully")

      setTimeout(() => setDownloadLog(null), 3000)

    } catch (err) {
      console.error(err)
      setDownloadLog("❌ Failed to prepare download. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div>
              <h1 className="font-display font-bold text-lg">
                Face Match Results
              </h1>
              <p className="text-sm text-muted-foreground">
                {images.length} photos • {videos.length} videos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={selectAll}>
              Select All
            </Button>

            <Button size="sm" variant="outline" onClick={clearAll}>
              Clear
            </Button>

            {selected.size > 0 && (
              <Button
                size="sm"
                className="gradient-primary gap-2"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="w-4 h-4" />
                Download {selected.size}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* CENTER DOWNLOAD OVERLAY */}
      {downloadLog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-xl shadow-xl px-8 py-6 text-center">
            <p className="text-lg font-medium">{downloadLog}</p>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* PHOTOS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📸 Photos</h2>

          {images.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No photos found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => {
                const isSelected = selected.has(img.image)

                return (
                  <div
                    key={img.image}
                    onClick={() => toggleSelect(img.image)}
                    className="relative rounded-xl overflow-hidden border bg-card cursor-pointer hover:shadow-medium transition"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.image}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute top-2 left-2">
                      <Badge className="bg-success text-success-foreground">
                        {img.similarity.toFixed(2)}%
                      </Badge>
                    </div>

                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-card/70"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-sm font-medium truncate">
                        {img.image}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* VIDEOS */}
        {videos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              🎥 Videos Featuring You
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((v) => (
                <video
                  key={v.video}
                  src={v.url}
                  controls
                  className="w-full rounded-xl shadow"
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}