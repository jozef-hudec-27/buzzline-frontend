import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ClipboardFill } from 'react-bootstrap-icons'

import useUserStore from '@/app/zustand/userStore'

import Avatar from '@/app/components/avatar/Avatar'
import Modal, { ModalProps } from '@/app/components/Modal/Modal'
import api from '@/app/api/axiosInstance'

function AboutMeModal({ isOpen, setIsOpen }: ModalProps) {
  const user = useUserStore((state) => state.user)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)

      await api(true).post('/api/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onError: () => {
      toast('Something went wrong. Please try again later.', { icon: '❌' })
    },
    onSuccess: () => {
      setIsOpen(false)
      toast('Avatar updated successfully. Refresh the page to see changes.', { icon: '🎉' })
    },
  })

  useEffect(() => {
    setFile(null)
    setPreviewUrl('')
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} contentLabel="Update user avatar modal">
      <div className="flex flex-col gap-[32px] items-center">
        <h2>{`${user.firstName} ${user.lastName}`}</h2>

        <Avatar src={previewUrl || user.avatarUrl} alt="My avatar" size={200} cls="shadow-lg w-[200px] h-[200px]" />

        <div className="flex gap-[16px]">
          <button className="btn primary" onClick={() => fileInputRef.current?.click()} disabled={!!file}>
            Upload image
          </button>

          <button
            className={`btn primary ${updateAvatarMutation.isPending ? 'cursor-wait' : ''}`}
            disabled={!file || updateAvatarMutation.isPending}
            onClick={() => {
              if (!file) return

              updateAvatarMutation.mutate(file)
            }}
          >
            Update
          </button>
        </div>

        <button
          className="btn primary flex items-center gap-[8px]"
          aria-label="Copy chat token to clipboard"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(user.chatToken)
              toast('Chat token copied to clipboard.', { icon: '📋' })
            } catch (err) {
              toast('Unable to copy chat token to clipboard.', { icon: '❌' })
            }
          }}
        >
          <ClipboardFill aria-hidden /> Chat token
        </button>

        <input
          type="file"
          name="avatar"
          id="avatar"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0]

            if (!file || !file.type.startsWith('image') || file.size > 5 * 1024 * 1024) {
              return toast('Avatar must be an image type, smaller than 5MB.', { icon: '❌' })
            }

            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setFile(file)
          }}
        />
      </div>
    </Modal>
  )
}

export default AboutMeModal
