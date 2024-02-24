import Image from 'next/image'

import defaultAvatar from '/public/assets/images/default-avatar.svg'

type AvatarProps = {
  src: string | undefined
  size: number
  alt: string
  cls?: string
}

function Avatar({ src, size, alt, cls }: AvatarProps) {
  return (
    <Image
      src={src || defaultAvatar || ''}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full aspect-square ${cls || ''}`}
    />
  )
}

export default Avatar
