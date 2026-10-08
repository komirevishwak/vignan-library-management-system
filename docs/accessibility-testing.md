# Accessibility Testing

Test keyboard-only navigation through every authenticated and public workflow. Every control must have a visible focus state, icon-only button must have an accessible name, and dialogs must announce a title and support Escape.

## Assistive technology

- Windows: install NVDA, use Browse Mode for landmarks and Forms Mode for controls.
- Windows: optionally validate with JAWS and Chrome or Edge.
- macOS: enable VoiceOver with `Command+F5`, then check headings, landmarks, form labels, and status messages.
- Run axe DevTools on public, student, reader, and admin pages.

## Release checklist

- [ ] Skip link reaches the main content.
- [ ] Heading levels are logical.
- [ ] All images have useful alternative text or are explicitly decorative.
- [ ] Keyboard focus is visible and never trapped outside an open dialog.
- [ ] Errors and async updates use an appropriate live region.
- [ ] Text and controls meet WCAG 2.1 AA contrast and target-size requirements.
- [ ] Test at 320px width and 200% browser zoom.
