import { useState } from "react"
import { Link } from "react-router-dom"

const UploadGPX = () => {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFile(e.target.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload-gpx", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      setResult(`Fichier ${json.filename} reçu (${json.size} octets)`)
    } catch (error) {
      setResult("Erreur lors de l'upload")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Uploader un fichier GPX</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sélectionner un fichier GPX</label>
            <input 
              type="file" 
              onChange={handleChange} 
              accept=".gpx"
              className="form-input"
              style={{ padding: '8px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="loading" style={{ marginRight: '8px' }}></div>
                  Upload en cours...
                </>
              ) : (
                'Envoyer'
              )}
            </button>
            
            <Link to="/prediction-result" className="btn btn-secondary">
              Voir le résultat de la prédiction
            </Link>
          </div>
        </form>
        
        {result && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#00d4ff', fontWeight: '600' }}>{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadGPX