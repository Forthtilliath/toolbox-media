import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/remove-background', label: 'Remove BG' },
  { to: '/color-match', label: 'Uniformiser teintes' },
  { to: '/brightness-match', label: 'Uniformiser luminosité' },
  { to: '/compress-image', label: 'Compresser image' },
  { to: '/convert-image', label: 'Convertir image' },
  { to: '/crop-image', label: 'Rogner image' },
  { to: '/resize-image', label: 'Redimensionner image' },
  { to: '/rotate-flip-image', label: 'Pivoter / retourner' },
  { to: '/watermark', label: 'Filigrane' },
  { to: '/adjust-images', label: 'Luminosité/contraste/saturation' },
  { to: '/icon-pack', label: 'Favicon / pack icônes' },
  { to: '/srcset', label: 'Srcset responsive' },
  { to: '/lqip', label: 'Placeholder flou (LQIP)' },
  { to: '/base64-encode', label: 'Encoder en base64' },
  { to: '/spritesheet', label: 'Spritesheet CSS' },
  { to: '/svg-optimize', label: 'Optimiser SVG' },
  { to: '/svg-convert', label: 'Convertir SVG/PNG' },
  { to: '/trim-video', label: 'Couper vidéo' },
  { to: '/video-to-gif', label: 'Vidéo -> GIF' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>Toolbox Media</h1>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content">{children}</main>
    </div>
  )
}
