import React, { useState, useEffect } from 'react'
import { useReadingLists } from '../hooks/useReadingLists'
import { useAuthStore } from '../../../store/authStore'
import { Select } from '../../../components/ui/select'
import { BookmarkIcon } from '@radix-ui/react-icons'
import api from '../../../services/api'
import Styles from './ReadingList.module.scss'

interface CreateListFormProps {
    mode?: 'create' | 'edit'
    listId?: string
    initialData?: {
        list_name: string
        description: string
        is_public: boolean
        id_library?: string
    }
    onCreated?: (list: any) => void
    onCancel?: () => void
    libraryId?: string
}

export function CreateListForm({ mode = 'create', listId, initialData, onCreated, onCancel, libraryId }: CreateListFormProps) {
    const { createReadingList, updateReadingList, isLoading, error } = useReadingLists()
    const { user } = useAuthStore()

    const [formData, setFormData] = useState({
        list_name: initialData?.list_name || '',
        description: initialData?.description || '',
        is_public: initialData?.is_public || false,
        id_library: initialData?.id_library || libraryId || ''
    })

    const [libraries, setLibraries] = useState<any[]>([])
    const [loadingLibraries, setLoadingLibraries] = useState(false)

    // Charger les bibliothèques de l'utilisateur
    useEffect(() => {
        const fetchLibraries = async () => {
            if (!user?.id_user || mode === 'edit') return

            setLoadingLibraries(true)
            try {
                const { data } = await api.get(`/api/libraries?user_id=${user.id_user}`)
                setLibraries(data.libraries || [])
            } catch (err) {
                console.error('Error fetching libraries:', err)
            } finally {
                setLoadingLibraries(false)
            }
        }

        fetchLibraries()
    }, [user?.id_user, mode])

    useEffect(() => {
        if (initialData) {
            setFormData({
                list_name: initialData.list_name,
                description: initialData.description,
                is_public: initialData.is_public,
                id_library: initialData.id_library || libraryId || ''
            })
        }
    }, [initialData, libraryId])

    const [formError, setFormError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        // Validation
        if (!formData.list_name.trim()) {
            setFormError('Le nom de la liste est requis')
            return
        }

        if (formData.list_name.length < 3) {
            setFormError('Le nom doit contenir au moins 3 caractères')
            return
        }

        if (mode === 'create' && !formData.id_library) {
            setFormError('Vous devez sélectionner une bibliothèque')
            return
        }

        try {
            let result
            if (mode === 'edit' && listId) {
                // Mode édition
                result = await updateReadingList(listId, {
                    list_name: formData.list_name.trim(),
                    description: formData.description.trim() || undefined,
                    is_public: formData.is_public
                })
            } else {
                // Mode création
                result = await createReadingList({
                    list_name: formData.list_name.trim(),
                    description: formData.description.trim() || undefined,
                    is_public: formData.is_public,
                    id_library: formData.id_library
                })
            }

            // Réinitialiser le formulaire en mode création
            if (mode === 'create') {
                setFormData({
                    list_name: '',
                    description: '',
                    is_public: false,
                    id_library: ''
                })
            }

            // Callback de succès
            if (onCreated) {
                onCreated(result)
            }
        } catch (err) {
            console.error('Error submitting form:', err)
            // L'erreur est déjà gérée dans le hook
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    return (
        <form className={Styles.createListForm} onSubmit={handleSubmit}>
            <h3>{mode === 'edit' ? 'Modifier la liste de lecture' : 'Créer une liste de lecture'}</h3>

            {(formError || error) && (
                <div className={Styles.error}>
                    {formError || error}
                </div>
            )}

            {mode === 'create' && (
                <div className={Styles.formGroup}>
                    <label htmlFor="id_library">
                        Bibliothèque <span className={Styles.required}>*</span>
                    </label>
                    <Select
                        id="id_library"
                        name="id_library"
                        value={formData.id_library}
                        onChange={(e) => handleChange(e)}
                        options={[
                            { value: '', label: 'Sélectionnez une bibliothèque' },
                            ...libraries.map((lib) => ({
                                value: lib.id_library,
                                label: lib.lib_name
                            }))
                        ]}
                        icon={<BookmarkIcon />}
                        aria-label="Sélectionner une bibliothèque"
                        disabled={isLoading || loadingLibraries}
                    />
                </div>
            )}

            <div className={Styles.formGroup}>
                <label htmlFor="list_name">
                    Nom de la liste <span className={Styles.required}>*</span>
                </label>
                <input
                    type="text"
                    id="list_name"
                    name="list_name"
                    value={formData.list_name}
                    onChange={handleChange}
                    placeholder="Ex: Mes livres à lire cet été"
                    maxLength={100}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={Styles.formGroup}>
                <label htmlFor="description">Description (optionnel)</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre liste de lecture..."
                    rows={3}
                    maxLength={500}
                    disabled={isLoading}
                />
            </div>

            <div className={Styles.formGroup}>
                <label className={Styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <span>Liste publique (visible par tous)</span>
                </label>
            </div>

            <div className={Styles.formActions}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className={Styles.cancelButton}
                        disabled={isLoading}
                    >
                        Annuler
                    </button>
                )}
                <button
                    type="submit"
                    className={Styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? (mode === 'edit' ? 'Mise à jour...' : 'Création...') : (mode === 'edit' ? 'Mettre à jour' : 'Créer la liste')}
                </button>
            </div>
        </form>
    )
}
