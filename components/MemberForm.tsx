'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './Toast'
import { motion, AnimatePresence } from 'framer-motion'

interface MemberFormProps {
  onMemberAdded?: () => void
}

export default function MemberForm({ onMemberAdded }: MemberFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    quartier: '',
    commune: '',
    ville: '',
    telephone: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis'
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis'
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis'
    } else if (!/^[0-9]{10}$/.test(formData.telephone)) {
      newErrors.telephone = 'Le téléphone doit contenir 10 chiffres'
    }
    if (!formData.ville.trim()) newErrors.ville = 'La ville est requise'
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('error', 'Veuillez corriger les erreurs du formulaire')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'enregistrement')
      }

      setFormData({
        nom: '',
        prenom: '',
        quartier: '',
        commune: '',
        ville: '',
        telephone: ''
      })
      
      showToast('success', 'Membre enregistré avec succès !')
      
      if (onMemberAdded) {
        onMemberAdded()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Ajouter un nouveau membre
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'nom', label: 'Nom', type: 'text' },
          { name: 'prenom', label: 'Prénom', type: 'text' },
          { name: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '0123456789' },
          { name: 'ville', label: 'Ville', type: 'text' },
          { name: 'commune', label: 'Commune', type: 'text' },
          { name: 'quartier', label: 'Quartier', type: 'text' }
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              placeholder={field.placeholder || ''}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                errors[field.name]
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <AnimatePresence>
              {errors[field.name] && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors[field.name]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement en cours...
            </>
          ) : (
            'Enregistrer le membre'
          )}
        </motion.button>
      </div>
    </motion.form>
  )
}