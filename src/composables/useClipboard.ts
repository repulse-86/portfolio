import { ref } from 'vue'
import type { ToastState } from '@/types'

export function useClipboard(email: string) {
    const copyBtnText = ref('Copy Email')
    const toast = ref<ToastState>({ visible: false, message: '', isError: false })

    let toastTimeout: ReturnType<typeof setTimeout> | null = null

    const showToast = (message: string, isError = false) => {
        if (toastTimeout) clearTimeout(toastTimeout)
        toast.value = { visible: true, message, isError }
        toastTimeout = setTimeout(() => {
            toast.value.visible = false
        }, 3500)
    }

    const copyEmailToClipboard = () => {
        const dummy = document.createElement('textarea')
        document.body.appendChild(dummy)
        dummy.value = email
        dummy.select()

        try {
            const successful = document.execCommand('copy')
            if (successful) {
                copyBtnText.value = 'Copied!'
                showToast('Email address copied to clipboard!')
                setTimeout(() => {
                    copyBtnText.value = 'Copy Email'
                }, 2000)
            } else {
                throw new Error('Copy command failed')
            }
        } catch {
            showToast('Press Ctrl+C to copy manually', true)
        } finally {
            document.body.removeChild(dummy)
        }
    }

    return { copyBtnText, toast, copyEmailToClipboard, showToast }
}
