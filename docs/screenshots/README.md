# Screenshots Directory

This directory contains screenshots for the README and documentation.

## Required Screenshots

To complete the README, add the following screenshots:

1. **landing.png** - Landing page screenshot (1920x1080 recommended)
2. **flow-builder.png** - Flow Builder interface with nodes visible
3. **dashboard.png** - Dashboard overview showing all 6 tabs
4. **chat.png** - Chat interface with some messages
5. **files.png** - File management page with uploaded files
6. **integrations.png** - Integrations page showing OAuth connections

## How to Take Screenshots

### For Landing Page
1. Navigate to `http://localhost:5173`
2. Take full-page screenshot
3. Save as `landing.png`

### For Dashboard Views
1. Sign in to dashboard
2. Navigate to each tab
3. Take screenshots at 1920x1080 resolution
4. Ensure dark theme is visible (#2D2D2D, #75FDA8, #27705D colors)

### For Flow Builder
1. Create a sample flow with multiple nodes
2. Show at least 3-4 connected nodes
3. Capture with minimap visible
4. Save as `flow-builder.png`

## Tools for Screenshots

- **Windows**: Windows + Shift + S (Snipping Tool)
- **Mac**: Cmd + Shift + 4
- **Linux**: gnome-screenshot or flameshot
- **Browser Extension**: Awesome Screenshot, GoFullPage

## Image Guidelines

- **Format**: PNG (better quality for UI)
- **Resolution**: 1920x1080 or higher
- **File Size**: Compress to < 500KB per image (use TinyPNG)
- **Content**: Show actual data, not empty states
- **Theme**: Ensure dark theme colors are visible

## Optimizing Images

Use [TinyPNG](https://tinypng.com/) or similar tools to compress:

```bash
# If you have imagemagick installed
convert landing.png -quality 85 -resize 1920x1080 landing-optimized.png
```

## Adding to README

Screenshots are already referenced in the README. Once you add the images here, they'll appear automatically.

Current references:
- `![Landing Page](./docs/screenshots/landing.png)`
- `![Flow Builder](./docs/screenshots/flow-builder.png)`
- `![Dashboard](./docs/screenshots/dashboard.png)`
- `![Chat Interface](./docs/screenshots/chat.png)`
- `![File Manager](./docs/screenshots/files.png)`
- `![Integrations](./docs/screenshots/integrations.png)`

---

**Note**: Screenshots are crucial for hackathon submissions. Judges often review READMEs first!
