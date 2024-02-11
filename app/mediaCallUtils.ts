import { toast } from 'react-hot-toast'

export function accessUserMediaCatchHandler(e: any, video = false) {
  switch (e.name) {
    case 'NotAllowedError':
      toast(`Please allow the microphone ${video ? 'and camera' : ''} access.`, { icon: '❌' })
      break
    case 'NotReadableError': // Media already in use
      toast('Could not access microphone or camera.', { icon: '❌' })
      break
    default:
      toast('An error occurred.', { icon: '❌' })
  }
}
