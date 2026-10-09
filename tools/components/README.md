# HeyNuo Component Architecture (`tools/components/`)

This directory houses the single source of truth for global, canonical site components across the HeyNuo platform.

## Components Overview

1. **`header.html`**:
   - Semantic landmark `<header role="banner">` and `<nav aria-label="Main navigation">`
   - High-contrast, WCAG 2.4.1 AAA compliant **Skip to main content** link (`.skip-to-content`)
   - Interactive brand logo (`.logo`) linking directly to `index.html` with SVG emblem (`.logo-mark`)
   - Omnipresent Quick Search trigger (`#navSearchBtn`) with keyboard prompt (`Ctrl K`)
   - Core navigational links (`#nav-links`) with automated active-state replacements (`data-nav`)
   - Dedicated Mobile Slide-Out Drawer Header (`.nav-mobile-head`) with direct close button (`#navCloseBtn`)
   - Direct Quick Shortcuts trigger (`#headerShortcutsBtn`) in the top utility cluster
   - GitHub icon link with security attributes (`target="_blank" rel="noopener noreferrer"`)
   - Theme toggle button (`#theme-toggle`) with view-transition circular reveal and animation
   - Mobile hamburger button (`#menu-btn`) with `aria-controls="nav-links"`

2. **`footer.html`**:
   - Semantic `<footer role="contentinfo">` with rich 4-column modern responsive layout
   - **Brand Column**: Identity, platform mission, and live verified trust badges (Pure Vanilla, Ad-Free, MIT Licensed)
   - **Sacred Sciences Column**: Quran Audio Player, 108 Master Verses, Ruqyah Sanctuary, Jinn Islamic Theology
   - **Engineering Column**: Spring Boot Enterprise Architecture, Java OOP Masterclass, Web Dev Guide
   - **Site & Author Column**: Home Dashboard, About Zahiruddin, Direct Contact, GitHub Repository
   - **Trust & Feed Column**: Privacy & Academic Sources, RSS 2.0 Syndication Feed, XML Sitemap
   - **Bottom Utility Bar**: Copyright notice and Shortcuts trigger (`#shortcutHelpBtn`)

3. **`shortcuts-modal.html`**:
   - WCAG 2.1.4 compliant keyboard modal dialog (`#shortcutsModal`)
   - Dedicated toggle switch (`#toggleSingleShortcuts`) for speech-to-text / assistive technology users
   - Categorized shortcuts layout:
     - 🌐 Navigation & Commands (`Ctrl+K`, `/`, `H`, `A`, `C`, `?`, `Esc`)
     - 🎨 Display & Reading Comfort Modes (`T`, Sepia, Slate)
     - 🎧 Quran & Media Player (`Space`, `→`/`←`, `Q`, `F`, `V`)
   - Smooth custom-scrolling body with tactile `<kbd>` styling

## Synchronization & Automation

To stamp changes across all 12 platform pages, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\sync-components.ps1
```

To validate site integrity, internal links, balanced markup, and component presence, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\validate-site.ps1
```
