import { useState, useEffect } from "react";
import { Select, SelectOption } from "../../../components/ui/select";
import { Card, CardHeader, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Loader } from "../../../components/ui/loader/Loader";
import api from "../../../services/api";
import {
    PersonIcon,
    CheckCircledIcon,
    Cross2Icon
} from "@radix-ui/react-icons";
import styles from "../pages/AdminDash.module.scss";
import adminPageStyles from "../../../styles/layouts/AdminPage.module.scss";

interface UserManagementSectionProps {
    adminRoleId: string;
}

export function UserManagementSection({ adminRoleId }: UserManagementSectionProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);

    // Fetch users
    const fetchUsers = async () => {
        if (users.length > 0) return; // Already loaded
        setIsLoadingUsers(true);
        try {
            const { data } = await api.get('/api/admin/users');
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const refreshUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const { data } = await api.get('/api/admin/users');
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error refreshing users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Filter users by role
    useEffect(() => {
        if (roleFilter === 'all') {
            setFilteredUsers(users);
        } else if (roleFilter === 'admin') {
            setFilteredUsers(users.filter((u: any) =>
                u.roles?.some((r: any) => r.role_name === 'ADMIN')
            ));
        } else {
            setFilteredUsers(users.filter((u: any) =>
                !u.roles?.some((r: any) => r.role_name === 'ADMIN')
            ));
        }
    }, [users, roleFilter]);

    // Handlers
    const handlePromoteToAdmin = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir promouvoir cet utilisateur en admin ?')) return;

        setChangingRoleUserId(userId);
        try {
            await api.post('/api/user-roles/make-admin', { id_user: userId });
            await refreshUsers();
        } catch (error: any) {
            console.error('Error promoting user:', error);
            alert(error.response?.data?.error || 'Erreur lors de la promotion');
        } finally {
            setChangingRoleUserId(null);
        }
    };

    const handleDemoteFromAdmin = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir rétrograder cet administrateur ?')) return;
        if (!adminRoleId) {
            alert('Erreur : Impossible de récupérer l\'ID du rôle ADMIN');
            return;
        }

        setChangingRoleUserId(userId);
        try {
            await api.delete('/api/user-roles/unassign', {
                data: { id_user: userId, id_role: adminRoleId }
            });
            await refreshUsers();
        } catch (error: any) {
            console.error('Error demoting user:', error);
            alert(error.response?.data?.error || 'Erreur lors de la rétrogradation');
        } finally {
            setChangingRoleUserId(null);
        }
    };

    // Computed values
    const selectedUser = users.find((u: any) => u.id_user === selectedUserId);
    const isSelectedUserAdmin = selectedUser?.roles?.some((r: any) => r.role_name === 'ADMIN');

    const userOptions: SelectOption[] = filteredUsers.map((u: any) => ({
        value: u.id_user,
        label: `@${u.username} - ${u.firstname || ''} ${u.lastname || ''}`.trim()
    }));

    return (
        <section className={`${adminPageStyles.section} ${adminPageStyles.adminSection}`}>
            <div className={adminPageStyles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <PersonIcon />
                    Gestion des Utilisateurs
                </h2>
                <span className={adminPageStyles.adminBadge}>Administration</span>
            </div>

            <div className={styles.filtersContainer}>
                <Select
                    label="Filtrer par rôle"
                    options={[
                        { value: 'all', label: 'Tous les rôles' },
                        { value: 'admin', label: 'Administrateurs seulement' },
                        { value: 'user', label: 'Utilisateurs seulement' }
                    ]}
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value as 'all' | 'admin' | 'user');
                        if (users.length === 0) fetchUsers();
                    }}
                    icon={<PersonIcon />}
                />

                {users.length > 0 && (
                    <Select
                        label="Sélectionner un utilisateur"
                        placeholder="Choisir un utilisateur..."
                        options={userOptions}
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    />
                )}
            </div>

            {isLoadingUsers && <div className={adminPageStyles.loading}><Loader /></div>}

            {selectedUser && !isLoadingUsers && (
                <Card variant="bordered" className={styles.card}>
                    <CardHeader>
                        <div className={styles.cardHeaderContent}>
                            <div className={styles.cardHeaderLeft}>
                                <PersonIcon className={styles.userIcon} />
                                <span className={styles.username}>@{selectedUser.username}</span>
                            </div>
                            {isSelectedUserAdmin && (
                                <span className={`${adminPageStyles.adminBadge} ${styles.adminBadge} ${styles.small}`}>
                                    <CheckCircledIcon /> Admin
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.cardDetails}>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            {selectedUser.firstname && <p><strong>Prénom:</strong> {selectedUser.firstname}</p>}
                            {selectedUser.lastname && <p><strong>Nom:</strong> {selectedUser.lastname}</p>}
                            <p><strong>Rôle:</strong> {isSelectedUserAdmin ? 'Administrateur' : 'Utilisateur'}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {isSelectedUserAdmin ? (
                            <Button
                                variant="danger"
                                size="S"
                                onClick={() => handleDemoteFromAdmin(selectedUser.id_user)}
                                disabled={changingRoleUserId === selectedUser.id_user}
                                icon={<Cross2Icon />}
                            >
                                {changingRoleUserId === selectedUser.id_user ? 'Rétrogradation...' : 'Rétrograder en User'}
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="S"
                                onClick={() => handlePromoteToAdmin(selectedUser.id_user)}
                                disabled={changingRoleUserId === selectedUser.id_user}
                                icon={<CheckCircledIcon />}
                            >
                                {changingRoleUserId === selectedUser.id_user ? 'Promotion...' : 'Promouvoir Admin'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}
        </section>
    );
}
