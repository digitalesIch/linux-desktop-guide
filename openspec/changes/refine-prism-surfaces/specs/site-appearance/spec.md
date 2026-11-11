# Spec Delta

## Purpose

Keep the guide readable through neutral theme surfaces, restrained branding, and bounded decorative effects.

## ADDED Requirements

### Requirement: Neutral reading surfaces
The site SHALL use pure white reading backgrounds in light mode with neutral gray secondary surfaces and SHALL preserve a readable dark theme.

#### Scenario: Light reading view
- **WHEN** a reader selects light mode
- **THEN** the page, navigation, and sidebar backgrounds are white without a page-wide colored wash

#### Scenario: Offline view
- **WHEN** the offline page appears with a light color preference
- **THEN** its reading background is white without a page-wide colored wash

### Requirement: Local pointer decoration
Pointer-following decoration SHALL be visible only inside the hero or cards, SHALL NOT obscure text or controls, and SHALL NOT track the pointer when reduced motion is requested.

#### Scenario: Pointer leaves decorated surfaces
- **WHEN** the pointer moves from a card or hero to the surrounding page
- **THEN** no pointer-following glow appears on the surrounding page

#### Scenario: Reduced motion
- **WHEN** a reader requests reduced motion
- **THEN** decoration does not follow the pointer and content remains visible

### Requirement: Restrained header branding
The logo SHALL be predominantly monochrome with at most a small spectrum accent, and the site-title link SHALL use neutral theme text colors.

#### Scenario: Header in either theme
- **WHEN** a reader views the header in light or dark mode
- **THEN** the title is readable in a neutral color and the logo has no rainbow-filled outer surface
