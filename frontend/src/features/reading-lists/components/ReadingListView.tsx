import { useEffect, useState } from 'react'
import { useReadingLists } from '../hooks/useReadingLists'
import { SearchBookCard } from '../../search/components/SearchBookCard'
import { Modal } from '../../../components/ui/modal/Modal'
import { Button } from '../../../components/ui/button'
import { CreateListForm } from './CreateListForm'
import { useNavigate, useLocation } from 'react-router-dom'
import { Pencil1Icon, TrashIcon, Cross2Icon, GlobeIcon, LockClosedIcon, ReaderIcon } from '@radix-ui/react-icons'
import Styles from './ReadingList.module.scss'
import { Loader } from '../../../components/ui/loader/Loader'

interface ReadingListViewProps {
    listId: string
    onDelete?: () => void
}

export function ReadingListView({ listId, onDelete }: ReadingListViewProps) {
    const navigate = useNavigate()
    const location = useLocation()

    // Déterminer si on est dans le contexte admin ou user
    const isAdminContext = location.pathname.startsWith('/admin')
    const listsRoute = isAdminContext ? '/admin/lists' : '/user/lists'

    const {
        readingList,
        books,
        totalBooks,
        isLoading,
        error,
        fetchReadingList,
        fetchListBooks,
        removeBookFromList,
        deleteReadingList
    } = useReadingLists(listId)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteBookId, setDeleteBookId] = useState<string | null>(null)
    const [showDeleteListModal, setShowDeleteListModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        if (listId) {
            fetchReadingList(listId)
            fetchListBooks(listId)
        }
    }, [listId, fetchReadingList, fetchListBooks])

    const handleBookClick = (book: any) => {
        if (book.id_book) {
            navigate(`/book/${book.id_book}`)
        }
    }

    const handleRemoveBook = (bookListId: string) => {
        setDeleteBookId(bookListId)
        setShowDeleteModal(true)
    }

    const confirmRemoveBook = async () => {
        if (!deleteBookId) return

        try {
            await removeBookFromList(deleteBookId)
            setShowDeleteModal(false)
            setDeleteBookId(null)
        } catch (err) {
            console.error('Error removing book:', err)
        }
    }

    const handleDeleteList = () => {
        setShowDeleteListModal(true)
    }

    const confirmDeleteList = async () => {
        try {
            await deleteReadingList(listId)
            setShowDeleteListModal(false)

            // Callback pour redirection
            if (onDelete) {
                onDelete()
            } else {
                // Fallback: retourner à la page des listes selon le contexte
                navigate(listsRoute)
            }
        } catch (err) {
            console.error('Error deleting list:', err)
        }
    }

    const handleEditList = () => {
        setShowEditModal(true)
    }

    const handleEditSuccess = async () => {
        setShowEditModal(false)
        // Refetch la liste pour avoir les données à jour
        await fetchReadingList(listId)
    }

    if (isLoading && !readingList) {
        return <div className={Styles.loading}><Loader /></div>
    }

    if (error) {
        return (
            <div className={Styles.errorMessage}>
                <p>{error}</p>
            </div>
        )
    }

    if (!readingList) {
        return (
            <div className={Styles.emptyState}>
                <p>Liste de lecture introuvable</p>
            </div>
        )
    }

    return (
        <div className={Styles.readingListView}>
            <div className={Styles.header}>
                <div className={Styles.info}>
                    <h1>{readingList.list_name}</h1>
                    {readingList.description && <p>{readingList.description}</p>}
                    <div className={Styles.badges}>
                        <span className={Styles.badge}>
                            {readingList.is_public ? (
                                <><GlobeIcon /> Publique</>
                            ) : (
                                <><LockClosedIcon /> Privée</>
                            )}
                        </span>
                        <span className={Styles.badge}>
                            <ReaderIcon /> {totalBooks} {totalBooks > 1 ? 'livres' : 'livre'}
                        </span>
                    </div>
                </div>

                <div className={Styles.actions}>
                    <Button
                        variant="secondary"
                        size="M"
                        onClick={handleEditList}
                        icon={<Pencil1Icon />}
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="danger"
                        size="M"
                        onClick={handleDeleteList}
                        icon={<TrashIcon />}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>

            {totalBooks === 0 ? (
                <div className={Styles.emptyState}>
                    <p>Aucun livre dans cette liste pour le moment</p>
                    <p>Utilisez le bouton "Ajouter à une liste" sur une page livre</p>
                </div>
            ) : (
                <div className={Styles.booksGrid}>
                    {books.map((bookInList) => (
                        <div key={bookInList.id_reading_list_book} className={Styles.bookItem}>
                            <SearchBookCard
                                title={bookInList.book?.title || 'Titre inconnu'}
                                author={bookInList.book?.author_name}
                                coverUrl={bookInList.book?.image}
                                bookId={bookInList.book?.id_book}
                                onClick={() => handleBookClick(bookInList.book)}
                            />
                            <Button
                                variant="danger"
                                size="S"
                                onClick={() => handleRemoveBook(bookInList.id_reading_list_book)}
                                icon={<Cross2Icon />}
                                className={Styles.removeButton}
                            >
                                Retirer
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal suppression livre */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Retirer le livre"
            >
                <p className={Styles.modalText}>Êtes-vous sûr de vouloir retirer ce livre de la liste ?</p>
                <div className={Styles.modalActions}>
                    <Button variant="ghost" size="M" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" size="M" onClick={confirmRemoveBook} icon={<Cross2Icon />}>
                        Retirer
                    </Button>
                </div>
            </Modal>

            {/* Modal suppression liste */}
            <Modal
                isOpen={showDeleteListModal}
                onClose={() => setShowDeleteListModal(false)}
                title="Supprimer la liste"
            >
                <p className={Styles.modalText}>Êtes-vous sûr de vouloir supprimer cette liste de lecture ?</p>
                <p className={Styles.warningText}>
                    Cette action est irréversible et supprimera tous les livres de la liste.
                </p>
                <div className={Styles.modalActions}>
                    <Button variant="ghost" size="M" onClick={() => setShowDeleteListModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" size="M" onClick={confirmDeleteList} icon={<TrashIcon />}>
                        Supprimer définitivement
                    </Button>
                </div>
            </Modal>

            {/* Modal édition liste */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier la liste"
            >
                <CreateListForm
                    mode="edit"
                    listId={listId}
                    initialData={{
                        list_name: readingList.list_name,
                        description: readingList.description || '',
                        is_public: readingList.is_public,
                        id_library: readingList.id_library
                    }}
                    onCreated={handleEditSuccess}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>
        </div>
    )
}
