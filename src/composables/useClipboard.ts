import { ref, onUnmounted } from 'vue'
import type { ToastState } from '@/types'

export function useClipboard(email: string) {
    const copyBtnText = ref('Copy Email')
    const toast = ref<ToastState>({ visible: false, message: '', isError: false })

    let toastTimeout: ReturnType<typeof setTimeout> | null = null
    let labelTimeout: ReturnType<typeof setTimeout> | null = null

    const showToast = (message: string, isError = false) => {
        if (toastTimeout) clearTimeout(toastTimeout)
        toast.value = { visible: true, message, isError }
        toastTimeout = setTimeout(() => {
            toast.value.visible = false
            toastTimeout = null
        }, 3500)
    }

    const copyEmailToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(email)
            if (labelTimeout) clearTimeout(labelTimeout)
            copyBtnText.value = 'Copied!'
            showToast('Email address copied to clipboard!')
            labelTimeout = setTimeout(() => {
                copyBtnText.value = 'Copy Email'
                labelTimeout = null
            }, 2000)
        } catch {
            showToast('Press Ctrl+C to copy manually', true)
        }
    }

    onUnmounted(() => {
        if (toastTimeout) clearTimeout(toastTimeout)
        if (labelTimeout) clearTimeout(labelTimeout)
    })

    return { copyBtnText, toast, copyEmailToClipboard, showToast }
}
