/**
 * @modified 03/07/2026
 * @author César González
 * @requirement Desmitificar la "Seguridad" del FrontEnd
 * @changes Se agregó un aviso de seguridad en la consola del navegador (self-XSS protection).
 *          Similar al que usan Facebook, Discord y otros sitios para advertir a los usuarios
 *          sobre el riesgo de pegar código malicioso en la consola de DevTools.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── Self-XSS Protection — Aviso de seguridad en consola ──────────────────────
// Este mensaje aparece cuando alguien abre DevTools (F12) en la aplicación.
// Previene ataques de "self-XSS" donde un atacante engaña al usuario para que
// pegue código malicioso en la consola del navegador.
console.log(
  '%c⚠ ADVERTENCIA DE SEGURIDAD',
  'color:#FF0000; font-size:24px; font-weight:bold; background:#FFF3CD; padding:8px 16px; border-radius:4px;'
)
console.log(
  '%cDon\'t paste code into the DevTools Console that you don\'t understand or haven\'t reviewed yourself. This could allow attackers to steal your identity or take control of your computer.\n\nPlease type "allow pasting" below and press Enter to allow pasting.',
  'color:#212529; font-size:14px; line-height:1.6;'
)
console.log(
  '%cEsta es una función del navegador destinada a desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función o "hackear" la cuenta de alguien, es un engaño y te robará información.',
  'color:#856404; font-size:13px; font-style:italic; background:#FFF8E1; padding:6px 12px; border-left:4px solid #FFC107;'
)
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
