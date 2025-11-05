import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button } from '../../../components/ui'
import Styles from './LoginForm.module.scss'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

interface LoginFormProps {
    onSwitchToRegister: () => void
}
export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

const [errors, setErrors] = useState<Record<string, string>>({})
const [isLoading, setIsLoading] = useState(false)
const login = useAuthStore(state => state.login)
const navigate = useNavigate()

const validatePasswords = () => {    

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
        // Envoi vers l'endpoint de login
        const { data } = await api.post('/api/users/login', formData)

        // User connecté et JWT deja en cookie httpOnly
        login(data.user)

        // Redirection selon le rôle
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
        <div className="loginForm">

            <form onSubmit={handleSubmit}>
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
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>

            </form>

            <p className={Styles.switchText}>Pas encore de compte ?</p>
                <Button type="button" variant="primary" size="S" onClick={onSwitchToRegister}>Créer un compte</Button>
        </div>
    )}
