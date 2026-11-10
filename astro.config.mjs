// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://linux-desktop.guide',
	integrations: [
		starlight({
			title: 'Linux Desktop Guide',
			description:
				'A practical field guide to building fast, accessible, deeply integrated native apps for Ubuntu and the wider Linux desktop.',
			logo: {
				src: './src/assets/mark.svg',
				alt: 'Linux Desktop Guide',
			},
			favicon: '/favicon.svg',
			customCss: ['./src/styles/custom.css'],
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			expressiveCode: {
				themes: ['github-dark-default', 'github-light-default'],
			},
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Why Linux Is Different', slug: 'start/why-linux' },
						{ label: 'Choose Your Stack', slug: 'start/choose-stack' },
						{ label: 'Build Your First App', slug: 'start/first-app' },
						{ label: 'The Native Standard', slug: 'start/native-standard' },
					],
				},
				{
					label: 'Platform',
					items: [
						{ label: 'Wayland & Display', slug: 'platform/wayland' },
						{ label: 'The XDG Contract', slug: 'platform/xdg' },
						{ label: 'System Integration', slug: 'platform/integration' },
						{ label: 'Flatpak & Portals', slug: 'platform/flatpak-portals' },
						{ label: 'Packaging & Distribution', slug: 'platform/packaging' },
						{ label: 'Security & Privacy', slug: 'platform/security' },
					],
				},
				{
					label: 'Design',
					items: [
						{ label: 'Design Principles', slug: 'design/principles' },
						{ label: 'Visual Language', slug: 'design/visual-language' },
						{ label: 'Layout & Navigation', slug: 'design/layout' },
						{ label: 'Interaction & Feedback', slug: 'design/interaction' },
						{ label: 'Accessibility', slug: 'design/accessibility' },
						{ label: 'Localization', slug: 'design/localization' },
					],
				},
				{
					label: 'Engineering',
					items: [
						{ label: 'Architecture', slug: 'engineering/architecture' },
						{ label: 'GTK & libadwaita', slug: 'engineering/gtk' },
						{ label: 'Qt & Kirigami', slug: 'engineering/qt' },
						{ label: 'Rust on the Desktop', slug: 'engineering/rust' },
						{ label: 'Performance', slug: 'engineering/performance' },
						{ label: 'Testing', slug: 'engineering/testing' },
						{ label: 'Reliability & Logging', slug: 'engineering/reliability' },
					],
				},
				{
					label: 'Ship',
					items: [
						{ label: 'AppStream & Metadata', slug: 'ship/appstream' },
						{ label: 'Flathub', slug: 'ship/flathub' },
						{ label: 'Release Checklist', slug: 'ship/release-checklist' },
						{ label: 'The Quality Bar', slug: 'ship/quality-bar' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Checklists', slug: 'reference/checklists' },
						{ label: 'Glossary', slug: 'reference/glossary' },
						{ label: 'Resources', slug: 'reference/resources' },
					],
				},
			],
		}),
	],
});
