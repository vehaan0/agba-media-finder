import { useState } from "react"
import { searchByImage } from "@/lib/api"

export default function TestSearch() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    if (!file) return alert("Upload an image")

    setLoading(true)
    try {
      const data = await searchByImage(file)

      // Deduplicate images
      const map: any = {}
      data.matches.forEach((m: any) => {
        if (!map[m.image] || map[m.image].similarity < m.similarity) {
          map[m.image] = m
        }
      })

      setResults(Object.values(map))
    } catch {
      alert("Search failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">AGBA Snap Finder (Test)</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleSearch}
        className="ml-3 px-4 py-2 bg-teal-600 text-white rounded"
      >
        {loading ? "Searching..." : "Find My Photos"}
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {results.map((r, i) => (
          <div key={i} className="border rounded p-2">
            <img src={r.url} className="w-full rounded" />
            <p className="text-xs mt-1">
              Similarity: {r.similarity}%
            </p>
            <a
              href={r.url}
              download
              className="text-sm text-teal-600 underline"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}