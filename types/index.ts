// types/index.ts

// Types d'utilisateurs
export type UserRole = 'user' | 'admin'

// Interface pour un utilisateur (table utilisateurs)
export interface User {
  id: string
  username: string
  phone: string
  branche: string
  password: string
  role: UserRole
  created_at: string
}

// Interface pour un admin (table admin)
export interface Admin {
  id: string
  username: string
  phone: string
  branche: string
  password: string
  role: UserRole
  created_at: string
}

// Interface pour un membre (table membres)
export interface Member {
  id: string
  nom: string
  prenom: string
  quartier: string
  commune: string
  ville: string
  telephone: string
  created_by: string  // ID de l'utilisateur qui a créé le membre
  created_at: string
}

// Interface pour un membre avec les informations du créateur
export interface MemberWithCreator extends Member {
  creator?: {
    username: string
    branche: string
    phone?: string
  } | null
}

// Interface pour la réponse de l'API auth/me
export interface AuthMeResponse {
  user: {
    userId: string
    username: string
    role: UserRole
  } | null
}

// Interface pour la réponse de l'API login
export interface LoginResponse {
  message: string
  user: Omit<User, 'password'>
}

// Interface pour la réponse de l'API register
export interface RegisterResponse {
  message: string
  user: Omit<User, 'password'>
}

// Interface pour les statistiques (optionnel)
export interface MemberStats {
  total: number
  byUser: {
    [userId: string]: number
  }
  byDate?: {
    [date: string]: number
  }
}

// Interface pour les données du dashboard
export interface DashboardData {
  members: Member[]
  stats?: {
    total: number
    recentCount: number
  }
}

// Interface pour les données de l'admin dashboard
export interface AdminDashboardData {
  members: MemberWithCreator[]
  users: Array<{
    id: string
    username: string
    phone: string
    branche: string
    role: UserRole
    created_at: string
    membersCount?: number
  }>
  stats: {
    totalMembers: number
    totalUsers: number
    totalAdmins: number
    recentMembers: number
  }
}

// Interface pour le formulaire d'ajout de membre
export interface MemberFormData {
  nom: string
  prenom: string
  quartier: string
  commune: string
  ville: string
  telephone: string
}

// Interface pour le formulaire d'inscription
export interface RegisterFormData {
  username: string
  phone: string
  branche: string
  password: string
  confirmPassword: string
}

// Interface pour le formulaire de connexion
export interface LoginFormData {
  username: string
  password: string
}

// Type pour les erreurs API
export interface ApiError {
  error: string
  status?: number
  details?: any
}

// Type pour les props du composant Navbar
export interface NavbarProps {
  userRole?: UserRole
}

// Type pour les props du composant MembersList
export interface MembersListProps {
  members: Member[] | MemberWithCreator[]
  showCreator?: boolean
  onMemberClick?: (member: Member) => void
}

// Type pour les props du composant MemberForm
export interface MemberFormProps {
  onMemberAdded?: () => void
  initialData?: Partial<MemberFormData>
}

// Énumération pour les branches (optionnel)
export enum Branche {
  ADMINISTRATION = 'Administration',
  JEUNESSE = 'Jeunesse',
  FEMMES = 'Femmes',
  HOMMES = 'Hommes',
  CHORALE = 'Chorale',
  ENSEIGNEMENT = 'Enseignement',
  ACCOUIL = 'Accueil',
  INTERCESSION = 'Intercession'
}

// Type pour les options de filtrage
export interface FilterOptions {
  branche?: string
  ville?: string
  dateDebut?: string
  dateFin?: string
  createdBy?: string
}

// Type pour les options de tri
export type SortOption = 'date_desc' | 'date_asc' | 'nom_asc' | 'nom_desc'

// Interface pour la pagination
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}