// Types User qui correspondent aux reponses du backend

export interface User {
    id_user: string
    firstname: string
    lastname: string
    username: string
    email: string
    avatar_url: string | null
    preferences: any
    last_login?: Date
    created_at: Date
    updated_at: Date
    roles: Role[]
    permissions: Permissions[]
}

export interface Role {
    id_role: string
    role_name: string
    description: string
    assigned_at: Date
}

export interface Permissions {
    id_permission: string
    label: string
    action: string | null
    resource: string | null
}