import * as Dialog from '@radix-ui/react-dialog'
import Styles from './AuthModal.module.scss'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    children?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
    return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Portal>
        <Dialog.Overlay className={Styles.overlay} />
        <Dialog.Content className={Styles.drawer}>
            {title && <Dialog.Title className={Styles.title}>{title}</Dialog.Title>}
            {description && <Dialog.Description className={Styles.description}>{description}</Dialog.Description>}
            <Dialog.Close className={Styles.closeButton}>×</Dialog.Close>
            <div style={{ marginTop: '1rem' }}>{children}</div>
        </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
    )
}

export default Modal
