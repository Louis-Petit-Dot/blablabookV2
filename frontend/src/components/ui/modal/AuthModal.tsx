import * as Dialog from "@radix-ui/react-dialog"
import { LockClosedIcon, PersonIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { LoginForm, RegisterForm } from "../../../features/auth"
import Styles from "./AuthModal.module.scss"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    mode: "login" | "register"
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {

    const [currentMode, setCurrentMode] = useState(mode);
    useEffect(() => {
        setCurrentMode(mode);
    }, [mode]);
    
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>

            <Dialog.Portal>

                <Dialog.Overlay className={Styles.overlay} />

                    <Dialog.Content className={Styles.drawer}>

                            <Dialog.Title className={Styles.title}>
                                {currentMode === "login" ? (
                                    <>
                                        <LockClosedIcon width={20} height={20} />
                                        Se connecter
                                    </>
                                ) : (
                                    <>
                                        <PersonIcon width={20} height={20} />
                                        S'inscrire
                                    </>
                                )}
                            </Dialog.Title>

                            <Dialog.Description className={Styles.description}>
                                {currentMode === "login" ? "Connectez-vous à votre compte" : "Créez un nouveau compte"}
                            </Dialog.Description>

                            <Dialog.Close className={Styles.closeButton}>
                                <p>X</p>
                            </Dialog.Close>

                        {currentMode === "login" ? (
                            <LoginForm onSwitchToRegister={() => setCurrentMode("register")} />
                            
                        ) : (
                            <RegisterForm onSwitchToLogin={() => setCurrentMode("login")} />
                            
                            
                        )}
                    </Dialog.Content>

            </Dialog.Portal>

        </Dialog.Root>
    )
}
