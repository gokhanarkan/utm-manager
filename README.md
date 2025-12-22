# UTM Manager

A lightweight, framework-agnostic library for managing UTM parameters. Capture, store, and retrieve UTM data with support for multiple attribution strategies.

[**Live Demo →**](https://gokhanarkan.github.io/utm-manager/demo/)

## Features

- **Zero dependencies** — ~2KB gzipped
- **Framework integrations** — React hooks and Next.js support
- **Attribution strategies** — First-touch, last-touch, or custom logic
- **Auto-capture** — Automatically captures UTMs from URL on page load
- **Cookie storage** — Configurable expiry and domain settings
- **TypeScript** — Full type definitions included

## Installation

```bash
npm install utm-manager
```

## Quick Start

### Standalone (Vanilla JS)

```html
<script src="https://unpkg.com/utm-manager/dist/utm-manager.min.js"></script>
```

The script automatically captures UTM parameters from the URL and stores them in cookies:

```javascript
// Get all parameters
const params = UTMManager.getAllUTMs();
// { utm_source: 'google', utm_medium: 'cpc', ... }

// Get specific parameter
const source = UTMManager.getUTM('utm_source');

// Listen for updates
window.addEventListener('utmParametersUpdated', (e) => {
  console.log('UTMs updated:', e.detail);
});
```

### React

```tsx
import { useUTMs } from 'utm-manager/react';

function App() {
  const { params, setParam, captureFromURL } = useUTMs({
    autoCapture: true,
    attribution: 'first',
    onUpdate: (params) => console.log('Updated:', params),
  });

  return <pre>{JSON.stringify(params, null, 2)}</pre>;
}
```

### Next.js

```tsx
import { useNextUTMs } from 'utm-manager/next';

function Page() {
  const { params } = useNextUTMs({ autoCapture: true });
  return <pre>{JSON.stringify(params, null, 2)}</pre>;
}
```

## Configuration

```javascript
UTMManager.configure({
  attribution: 'first',     // 'first' | 'last' | 'dynamic'
  expirationDays: 90,       // Cookie expiry in days
  domain: '.example.com',   // Cookie domain scope
});
```

## Attribution Strategies

| Strategy | Behaviour |
|----------|-----------|
| `first` | Keeps the first UTM values, ignores subsequent visits |
| `last` | Always overwrites with the most recent values (default) |
| `dynamic` | Uses a custom callback to decide |

**Dynamic attribution example:**

```javascript
UTMManager.configure({
  attribution: 'dynamic',
  attributionCallback: (current, incoming) => {
    // Prioritise paid traffic over organic
    return incoming.includes('cpc') ? incoming : current;
  },
});
```

## Supported Parameters

UTM Manager validates against the five standard UTM parameters:

| Parameter | Purpose |
|-----------|---------|
| `utm_source` | Traffic source (google, newsletter, twitter) |
| `utm_medium` | Marketing medium (cpc, email, social) |
| `utm_campaign` | Campaign identifier (spring_sale, product_launch) |
| `utm_term` | Paid search keywords |
| `utm_content` | Differentiate similar content or links |

Non-standard parameters will throw a validation error.

## API Reference

### Standalone

```javascript
UTMManager.configure(options)    // Set configuration
UTMManager.getAllUTMs()          // Get all stored parameters
UTMManager.getUTM(key)           // Get specific parameter
UTMManager.saveUTM(key, value)   // Save a parameter
UTMManager.autoCapture()         // Manually trigger URL capture
```

### React Hook

```typescript
const {
  params,         // Current UTM parameters object
  getParam,       // Get specific parameter
  setParam,       // Set single parameter
  setParams,      // Set multiple parameters
  configure,      // Update configuration
  captureFromURL, // Manually capture from URL
} = useUTMs(config);
```

## Common Use Cases

### Form Integration

Attach UTM data to form submissions:

```javascript
document.querySelector('form').addEventListener('submit', function() {
  const utms = UTMManager.getAllUTMs();

  Object.entries(utms).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    this.appendChild(input);
  });
});
```

### Analytics Integration

```javascript
window.addEventListener('utmParametersUpdated', (e) => {
  analytics.track('Campaign Visit', e.detail);
});
```

## WordPress

```html
<script src="path/to/utm-manager.min.js"></script>
<script src="path/to/wordpress/utm-manager.js"></script>
```

```javascript
window.addEventListener('utm_manager_ready', (e) => {
  console.log('UTMs:', e.detail);
});
```

## Browser Support

Chrome, Firefox, Safari, and Edge (latest versions).

## Licence

MIT — see [LICENSE](LICENSE) for details.

## Links

- [GitHub](https://github.com/gokhanarkan/utm-manager)
- [npm](https://www.npmjs.com/package/utm-manager)
- [Live Demo](https://gokhanarkan.github.io/utm-manager/demo/)
