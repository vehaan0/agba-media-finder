import {
  Search,
  Camera,
  Sparkles,
  Image,
  Video,
} from "lucide-react"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import ImageUploadZone from "@/components/ImageUploadZone"
import TipsCard from "@/components/TipsCard"
import { searchByImage } from "@/lib/api"

const EVENTS = [{ id: "agba-2026", name: "AGBA 2026" }]

export default function Index() {
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("agba-2026")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  /**
   * ✅ Single source of truth:
   * Image → backend → images + videos → Results page
   */
  const handleSearch = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload one clear face photo")
      return
    }

    if (uploadedFiles.length > 1) {
      alert("Upload only ONE clear face photo")
      return
    }

    setLoading(true)
    try {
      const data = await searchByImage(uploadedFiles[0])

      navigate("/results", {
        state: {
          images: data.images || [],
          videos: data.videos || [],
          event: "AGBA 2026",
        },
      })
    } catch (err) {
      console.error(err)
      alert("Face search failed. Try a clearer photo.")
    } finally {
      setLoading(false)
    }
  }, [uploadedFiles, navigate])

  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            AGBA Media Finder
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Photo & Video Search
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Find Your Event
            <br />
            <span className="text-primary">Photos & Videos</span>
          </h1>

          <p className="text-lg text-muted-foreground">
            Upload one photo to find all your moments from AGBA 2026 using facial
            recognition.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-card rounded-2xl shadow-elevated p-6 space-y-6">
          {/* Event Selector */}
          <div className="flex items-center gap-3">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENTS.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Only AGBA 2026 available
            </span>
          </div>

          {/* Disabled text search */}
          <div className="relative opacity-50 cursor-not-allowed">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Text search coming soon"
              className="pl-12 h-14"
              disabled
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">
              upload one face photo
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Upload */}
          <ImageUploadZone
            files={uploadedFiles}
            onFilesChange={setUploadedFiles}
          />

          <p className="text-xs text-muted-foreground">
            ℹ️ Facial recognition works best with one clear, front-facing photo.
          </p>

          {/* CTA */}
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full h-14 text-base font-semibold gradient-primary"
          >
            {loading ? "Searching faces…" : "Find My Photos"}
          </Button>

          {loading && (
            <p className="text-center text-sm text-muted-foreground">
              This may take a few seconds…
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8">
          <TipsCard />
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: Image, label: "Photos Indexed", value: "12,450+" },
            { icon: Video, label: "Video Moments", value: "850+" },
            { icon: Camera, label: "Events Covered", value: "1" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}