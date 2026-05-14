---
name: Mundial 2026 Design System
colors:
  surface: '#111412'
  surface-dim: '#111412'
  surface-bright: '#373a37'
  surface-container-lowest: '#0c0f0d'
  surface-container-low: '#1a1c1a'
  surface-container: '#1e201e'
  surface-container-high: '#282b28'
  surface-container-highest: '#333533'
  on-surface: '#e2e3df'
  on-surface-variant: '#c4c6cc'
  inverse-surface: '#e2e3df'
  inverse-on-surface: '#2f312e'
  outline: '#8e9196'
  outline-variant: '#44474c'
  surface-tint: '#bac8dc'
  primary: '#bac8dc'
  on-primary: '#243141'
  primary-container: '#0d1b2a'
  on-primary-container: '#768497'
  inverse-primary: '#525f71'
  secondary: '#ffb955'
  on-secondary: '#452b00'
  secondary-container: '#dc9100'
  on-secondary-container: '#4f3100'
  tertiary: '#59de9b'
  on-tertiary: '#003921'
  tertiary-container: '#001f10'
  on-tertiary-container: '#00955f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e4f9'
  primary-fixed-dim: '#bac8dc'
  on-primary-fixed: '#0f1c2c'
  on-primary-fixed-variant: '#3a4859'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#78fbb6'
  tertiary-fixed-dim: '#59de9b'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005232'
  background: '#111412'
  on-background: '#e2e3df'
  surface-variant: '#333533'
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Archivo Narrow
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system targets a high-stakes, premium audience of football enthusiasts and bettors. The brand personality is authoritative, energetic, and exclusive, capturing the "stadium at night" atmosphere.

The aesthetic blends **Corporate Modern** precision with **Glassmorphism** accents to create a sense of depth and value. The visual language must feel expensive and trustworthy, utilizing high-contrast elements to ensure critical data points—such as odds and match timers—are immediately legible. The UI should evoke the adrenaline of a live tournament through sharp typography and a focused, dark-mode-first interface.

## Colors

The palette is anchored by **Deep Navy (#0D1B2A)**, providing a sophisticated foundation that differentiates it from standard black-themed apps.

- **Primary Accents:** **Gold (#F5A623)** is reserved for primary actions, winning predictions, and premium indicators. It represents the trophy and the stakes.
- **Data & Positive States:** **Emerald Green (#00A86B)** is used exclusively for "in-the-green" states, successful bets, and live match indicators.
- **Surface Strategy:** Use nested shades of navy (e.g., #1B263B) to create card hierarchy against the background.
- **Typography:** Pure White is used for headings to maximize contrast, while a slightly muted Neutral (#E0E1DD) is used for secondary labels to reduce eye strain.

## Typography

The typography system uses a high-impact pairing to balance tournament energy with analytical clarity.

- **Headlines:** **Archivo Narrow** provides a condensed, "sports broadcast" feel. It allows for longer team names and scores to fit in tight horizontal spaces without losing impact.
- **Body & Data:** **Hanken Grotesk** is used for its clean, professional geometry, ensuring that betting terms and app navigation are easy to digest.
- **Specialized Data:** **JetBrains Mono** is utilized for odds, timers, and financial figures to ensure every digit is distinct and carries a technical, precise character.

## Layout & Spacing

This design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile.

The rhythm is based on a **4px baseline**, emphasizing tight groupings for related data (like a match-up pair) and generous "breathing room" (24px+) between distinct sections like "Live Matches" and "Upcoming Odds." Use generous horizontal padding (20px) on mobile to ensure content doesn't feel cramped against the screen edges. Data-heavy tables should utilize the 8px "sm" spacing for rows to maximize information density while maintaining legibility.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and subtle **Glassmorphism**.

1. **Background:** Deep Navy (#0D1B2A).
2. **Cards/Containers:** Elevated using a lighter Navy (#1B263B) with a subtle 1px inner border (opacity 10% white) to define edges against the dark background.
3. **Floating Elements (Modals/Dropdowns):** Use a backdrop blur (12px) with a semi-transparent fill of the Surface color.
4. **Shadows:** Avoid heavy black shadows. Instead, use "Ambient Glows" for active states—a soft, low-opacity Gold or Emerald outer glow to indicate a selected bet or a live event.

## Shapes

The shape language is consistently **Rounded**, softening the "high-stakes" intensity to maintain a premium, modern feel.

Standard components like input fields and small cards use a **0.5rem (8px)** radius. Primary action buttons and featured "Match of the Day" cards utilize a more pronounced **1rem (16px)** radius. Score badges and "Live" indicators should use **pill-shaped** geometry to distinguish them from structural UI elements.

## Components

- **Buttons:** Primary buttons are Gold with Navy text, using a `rounded-lg` (16px) shape. Secondary buttons use a ghost style with a Gold 2px border.
- **Match Cards:** Use a sleek, horizontal layout. The background should be the #1B263B surface color. Teams are separated by a subtle vertical divider.
- **Odds Chips:** Small, high-contrast capsules. When selected, they transition from Navy to Gold, flipping the text color to Navy for maximum visibility.
- **Input Fields:** Darker than the surface color with a 1px border that glows Gold on focus.
- **Progress Bars:** Used for "Win Probability" or "Tournament Progress." These should use a gradient from Emerald Green to Navy, never a flat gray.
- **Live Indicator:** A pill-shaped badge with a pulsing Emerald Green dot next to "LIVE" in `label-caps`.

## Idioma

Toda la UI debe estar en **español**. Las plantillas de Stitch están en inglés solo como referencia visual; los textos deben adaptarse a español natural y orientado a producto público (no enterprise).

## Banderas

Usar `flagcdn.com` para todas las banderas, mapeando código ISO 3 letras de la app (definido en `src/lib/bracket/groups.ts`, p.ej. `MEX`, `BRA`) a su ISO 2 letras (`mx`, `br`). Tamaños recomendados: 40px para chips, 48px para tarjetas de match, 96px para hero/podio.

URL pattern: `https://flagcdn.com/w80/<iso2>.png` (con `w160`/`w320` para retina si hace falta).

## Compartir bracket (viralidad)

El bracket debe poderse exportar a PNG (ya existe `html-to-image`). El PNG debe incluir:
- Logo "MUNDIAL 2026" arriba en oro
- Nombre del usuario y nombre del grupo
- Bracket completo con banderas y ganadores
- URL/CTA: "Únete: porra2026.app/g/<slug>" abajo
- Marca de agua sutil

El botón de compartir debe usar Web Share API si está disponible (móvil) y caer a descargar PNG si no.
