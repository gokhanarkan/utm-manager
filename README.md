# UTM Manager

A framework-agnostic UTM parameter management solution for JavaScript applications. Provides comprehensive UTM tracking with built-in support for vanilla JavaScript, React, and Next.js.

## Features

- Framework-agnostic core with React and Next.js integrations
- Multiple attribution strategies (first-touch, last-touch, dynamic)
- Secure cookie handling with configurable options
- Cross-domain and subdomain support
- TypeScript support with comprehensive type definitions
- Zero dependencies for the core package
- Server-side rendering support for Next.js

## Installation

```bash
npm install utm-manager
# or
yarn add utm-manager
# or
pnpm add utm-manager
```

## Usage

### Standalone JavaScript

For traditional websites, include the script directly:

```html
<script src="https://unpkg.com/utm-manager/dist/utm-manager.min.js"></script>
```

The script automatically:
- Captures UTM parameters from the URL
- Stores them in cookies
- Triggers `utmParametersUpdated` events

#### Standalone API

```javascript
// Get all stored UTM parameters
const params = UTMManager.getAllUTMs();

// Get a specific UTM parameter
const campaign = UTMManager.getUTM("utm_campaign");

// Manually save a UTM parameter
UTMManager.saveUTM("utm_source", "newsletter");

// Configure options
UTMManager.configure({
  attribution: "first",   // 'first' | 'last' | 'dynamic'
  expirationDays: 90,
  domain: ".yourdomain.com",
});

// Listen for UTM updates
window.addEventListener("utmParametersUpdated", (event) => {
  console.log("UTM Parameters:", event.detail);
});
```

#### Form Integration Example

```javascript
document.querySelector("form").addEventListener("submit", function() {
  const utmParams = UTMManager.getAllUTMs();
  Object.entries(utmParams).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    this.appendChild(input);
  });
});
```

### React Integration

```tsx
import { useUTMs } from "utm-manager/react";

function App() {
  const { params, setParam, captureFromURL } = useUTMs({
    autoCapture: true,
    attribution: "first",
    expirationDays: 30,
    onUpdate: (params) => {
      analytics.track("UTM Updated", params);
    },
  });

  return (
    <div>
      <h1>Current UTM Parameters:</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <button onClick={captureFromURL}>Capture UTMs</button>
    </div>
  );
}
```

### Next.js Integration

```tsx
import { useNextUTMs, withUTMs } from "utm-manager/next";

function Campaign() {
  const { params, setParam } = useNextUTMs({
    autoCapture: true,
    enableSSR: true,
    onUpdate: (params) => {
      analytics.track("UTM Updated", params);
    },
  });

  return (
    <div>
      <h1>Campaign Tracking</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}

export default withUTMs(Campaign);
```

### WordPress Integration

Load the main script first, then the WordPress integration:

```html
<script src="path/to/utm-manager.min.js"></script>
<script src="path/to/wordpress/utm-manager.js"></script>
```

Listen for the WordPress-specific event:

```javascript
window.addEventListener("utm_manager_ready", (event) => {
  console.log("UTMs ready:", event.detail);
});

// Or with jQuery
jQuery(document).on("utm_manager_ready", (event, params) => {
  console.log("UTMs ready:", params);
});
```

## Configuration Options

```typescript
interface UTMConfig {
  // Attribution strategy: 'first' | 'last' | 'dynamic'
  attribution: AttributionStrategy;

  // Cookie expiration in days (default: 30)
  expirationDays: number;

  // Cookie domain (e.g., '.example.com')
  domain?: string;

  // Callback for dynamic attribution
  attributionCallback?: (currentValue: string, newValue: string) => string;
}
```

### Attribution Strategies

**First Touch** - Only saves UTM parameters if not already set:
```javascript
UTMManager.configure({ attribution: "first" });
```

**Last Touch** - Always overwrites with new values:
```javascript
UTMManager.configure({ attribution: "last" });
```

**Dynamic** - Custom logic to determine which value to keep:
```javascript
UTMManager.configure({
  attribution: "dynamic",
  attributionCallback: (current, newValue) => {
    return newValue.includes("google") ? newValue : current;
  },
});
```

## React Hook API

```typescript
const {
  params,          // Current UTM parameters
  getParam,        // Get specific parameter
  setParam,        // Set single parameter
  setParams,       // Set multiple parameters
  configure,       // Update configuration
  captureFromURL,  // Manually capture from URL
} = useUTMs(config);
```

## TypeScript Support

```typescript
import type { UTMParams, UTMConfig, AttributionStrategy } from "utm-manager";

interface CampaignProps {
  initialUTMs?: UTMParams;
  onUTMUpdate?: (params: UTMParams) => void;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security

- Cookies use `Secure` and `SameSite=Lax` attributes by default
- All cookie values are properly encoded/decoded
- Input validation for UTM parameter names

## Contributing

Contributions are welcome! Please run `npm run lint` and `npm test` before submitting PRs.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- GitHub Issues: [github.com/gokhanarkan/utm-manager/issues](https://github.com/gokhanarkan/utm-manager/issues)
- Email: hello@gokhanarkan.com
