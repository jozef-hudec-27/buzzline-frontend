import Image from 'next/image'

type AvatarProps = {
  src: string
  size: number
  alt: string
  cls?: string
}

function Avatar({ src, size, alt, cls }: AvatarProps) {
  return (
    <Image
      src={src || process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || ''}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${cls || ''}`}
    />
  )
}

export default Avatar
