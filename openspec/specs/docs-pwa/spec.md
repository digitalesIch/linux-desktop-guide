# docs-pwa Specification

## Purpose
Make the guide installable as a Progressive Web App on Android and iOS, with a validated manifest, icons, production service worker, and offline fallback.

## Requirements

### Requirement: Installable web app

The guide SHALL be installable as a Progressive Web App on Android and iOS.

#### Scenario: Android installation

- **WHEN** a visitor opens the site over HTTPS in a supporting Android browser
- **THEN** the browser can install it with the manifest name, standalone display, theme colors, and 192/512/maskable icons, and the installed app can appear in the app launcher

#### Scenario: iOS home screen

- **WHEN** a visitor uses Add to Home Screen in iOS Safari
- **THEN** the app uses the Apple touch icon, the standalone display mode, and the configured app title

#### Scenario: Offline fallback

- **WHEN** a navigation request fails and no cached page is available
- **THEN** the service worker serves the offline page

#### Scenario: Previously visited page offline

- **WHEN** a visitor revisits a page that was cached while offline
- **THEN** the service worker serves the cached page

#### Scenario: Secure context

- **WHEN** the site is served over plain HTTP on a LAN address
- **THEN** the documentation explains that installation and service workers require HTTPS or localhost

### Requirement: PWA output validation

The project SHALL validate the PWA output locally.

#### Scenario: Manifest is complete

- **WHEN** `check:pwa` runs
- **THEN** it verifies the manifest name, start URL, scope, display mode, colors, and 192/512/maskable icons

#### Scenario: Icons have the right dimensions

- **WHEN** `check:pwa` reads an icon
- **THEN** it verifies the PNG dimensions match the declared size

#### Scenario: Head tags are present

- **WHEN** `check:pwa` reads the built index page
- **THEN** it finds the manifest link, theme color, Apple touch icon, iOS meta tags, and service-worker registration

#### Scenario: Service worker is complete

- **WHEN** `check:pwa` reads the service worker
- **THEN** it finds install, activate, and fetch handlers and the offline cache entry
