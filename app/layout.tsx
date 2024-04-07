import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import ReactQueryProvider from './ReactQueryProvider'
import FetchUser from './FetchUser'

import 'react-h5-audio-player/lib/styles.css'
import 'intro.js/introjs.css'
import '../styles/globals.scss'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuzzLine',
  description: 'Chat anytime, anywhere.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <FetchUser />

      <ReactQueryProvider>
        <body className={inter.className}>
          <Toaster toastOptions={{ className: '!text-black-75 !rounded-[16px]', duration: 5000 }} />

          <div id="root">{children}</div>
        </body>
      </ReactQueryProvider>
    </html>
  )
}
