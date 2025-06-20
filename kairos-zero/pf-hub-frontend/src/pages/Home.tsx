import { useState } from "react"

const Home = () => {
  const [data, setData] = useState<any>(null)

  const handleClick = async () => {
    const res = await fetch("/api/test-simple")
    const json = await res.json()
    setData(json)
  }

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Tester l'API
      </button>

      {data && (
        <pre className="mt-4 bg-gray-100 p-2 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default Home