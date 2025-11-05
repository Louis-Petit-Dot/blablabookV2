import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button } from '../../../components/ui'
import Styles from './RegisterForm.module.scss'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

interface RegisterFormProps {
    onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
            const [formData, setFormData] = useState({
                firstname: '',
                lastname: '',
                username: '',
                email: '',
                password: '',
                passwordConfirm: ''
            })

const [errors, setErrors] = useState<Record<string, string>>({})
const [isLoading, setIsLoading] = useState(false)
const login = useAuthStore(state => state.login)
const navigate = useNavigate()

    // Validation frontend temps réel
const validatePasswords = () => {
    if (formData.password !== formData.passwordConfirm) {
        setErrors(prev => ({
        ...prev,
        passwordConfirm: 'Les mots de passe ne correspondent pas'
        }))
        return false
    }

    if (formData.password.length < 8) {
        setErrors(prev => ({
        ...prev,
        password: 'Le mot de passe doit contenir au moins 8 caractères'
        }))
        return false
    }

    return true
    }

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    })
}

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

      // Validation frontend avant envoi
    if (!validatePasswords()) return

    setIsLoading(true)

    try {
        // Envoi avec passwordConfirm (backend vérifie aussi)
        const { data } = await api.post('/api/users', formData)

        // User cree et JWT deja en cookie httpOnly
        login(data.user)

        // Redirection selon le rôle (normalement toujours USER à l'inscription)
        const isAdmin = data.user.roles?.some((role: any) => role.role_name === 'ADMIN')
        if (isAdmin) {
            navigate('/admin')
        } else {
            navigate('/user')
        }
    } catch (error: any) {
        // Erreurs backend (Zod validation)
        if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error })
        }
    } finally {
        setIsLoading(false)
    }
    }

    return (
        <div className="registerForm">

        <form onSubmit={handleSubmit}>

            {errors.general && <p className="error">{errors.general}</p>}

            <Input  
                label="Nom"
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
            />
            <Input
                label="Prénom"
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
            />
            <Input
                label="Nom d'utilisateur"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
            />
            <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                helperText="Le mot de passe doit contenir au moins 8 caractères"
                required
            />
            <Input
                label="Confirmer le mot de passe"
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                error={errors.passwordConfirm}
                required
            />
            
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Button>

            <p className={Styles.switchText}>Vous avez déjà un compte ?</p>
            <Button type="button" variant="primary" size="S" onClick={onSwitchToLogin}>Connectez-vous</Button>



        </form>

        </div>

            
    )
}