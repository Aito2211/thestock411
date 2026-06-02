import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'The Stock411 | Global Market Intelligence',
  description: 'Real-time stocks, ETFs, earnings, screener and global market news.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>)
}