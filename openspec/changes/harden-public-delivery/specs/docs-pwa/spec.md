# Spec Delta

## ADDED Requirements

### Requirement: Deployed PWA verification

The project SHALL verify the PWA on the deployed HTTPS site, not only in the local build.

#### Scenario: Deployed manifest and service worker

- **WHEN** the deployed site is checked
- **THEN** the manifest is served with a manifest JSON content type, the service worker is served from the configured base path, and registration uses the base scope

#### Scenario: Device install test

- **WHEN** a maintainer installs the site on Android and iOS
- **THEN** the result, date, browser versions, and any caveat are recorded in `PUBLIC_RELEASE.md`

#### Scenario: Offline behavior on the deployed host

- **WHEN** a previously visited page is opened offline after installation
- **THEN** the service worker serves the cached page or the offline fallback from the configured base
