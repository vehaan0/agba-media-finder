export async function searchByImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/search/image`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!res.ok) {
    throw new Error("Search failed")
  }

  return res.json()
}