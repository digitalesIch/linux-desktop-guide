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
Pointer-following decoration SHALL be visible only inside the hero, cards, or agent panel, SHALL NOT obscure text or controls, and SHALL NOT track the pointer when reduced motion is requested.

#### Scenario: Pointer leaves decorated surfaces
- **WHEN** the pointer moves from a decorated surface to the surrounding page
- **THEN** no pointer-following glow appears on the surrounding page

#### Scenario: Reduced motion
- **WHEN** a reader requests reduced motion
- **THEN** decoration does not follow the pointer and content remains visible

### Requirement: Restrained header branding
The logo SHALL be predominantly monochrome with at most a small spectrum accent, and the site-title link SHALL use neutral theme text colors.

#### Scenario: Header in either theme
- **WHEN** a reader views the header in light or dark mode
- **THEN** the title is readable in a neutral color and the logo has no rainbow-filled outer surface

### Requirement: Landing layout rhythm
The landing page SHALL keep inherited document spacing from shifting custom layouts, and the agent section SHALL be a distinct panel.

#### Scenario: Desktop header spacing
- **WHEN** a reader views a page on a desktop viewport
- **THEN** the search control keeps visible space above the header hairline

#### Scenario: Wide landing layout
- **WHEN** a reader views the landing page on a wide desktop viewport
- **THEN** paired cards match the feature card edges, metric headings share a row baseline, and step links align at the bottom of their columns with clear divider gutters


### Requirement: Focused landing signals
The landing page SHALL present the target matrix once and SHALL NOT include a decorative standards ticker or a fabricated testimonial.

#### Scenario: Landing content signals
- **WHEN** a reader views the landing page
- **THEN** the target chips are the only target list and no standards ticker or quote panel appears


### Requirement: Hero illustration presentation
The hero illustration SHALL sit on the hero surface without a heavy outer drop shadow.

#### Scenario: Hero in either theme
- **WHEN** a reader views the hero in light or dark mode
- **THEN** the illustration is separated by its own border and the hero surface without a heavy shadow
