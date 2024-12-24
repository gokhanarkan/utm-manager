# UTM Manager

A robust, framework-agnostic UTM parameter management solution for modern JavaScript applications. This package provides a comprehensive solution for handling UTM parameters across different JavaScript environments, with built-in support for vanilla JavaScript, React, and Next.js applications.

## Features

UTM Manager offers a complete solution for UTM parameter tracking and management:

- Framework-agnostic core with dedicated React and Next.js integrations
- Multiple attribution strategies (first-touch, last-touch, and custom)
- Secure cookie handling with configurable options
- Cross-domain and subdomain support
- TypeScript support with comprehensive type definitions
- Zero dependencies for the core package
- Server-side rendering support for Next.js applications

## Installation

Install the package using your preferred package manager:

```bash
npm install utm-manager
# or
yarn add utm-manager
# or
pnpm add utm-manager
```

## Usage Examples

### Standalone JavaScript

For traditional websites or vanilla JavaScript applications, you can include UTM Manager directly in your HTML:

```html
<!-- Auto-capture UTMs on load -->
<script src="dist/utm-manager.min.js" data-auto-capture="true"></script>

<!-- Manual initialization -->
<script src="dist/utm-manager.min.js"></script>
<script>
  // Configure UTM handling
  UTMManager.configure({
    attribution: "last",
    expirationDays: 30,
    domain: ".yourdomain.com",
  });

  // Auto-capture UTMs from URL
  UTMManager.autoCapture();

  // Listen for UTM updates
  window.addEventListener("utmParametersUpdated", function (event) {
    console.log("UTM Parameters:", event.detail);
  });
</script>
```

### React Integration

The React integration provides a hook-based API for managing UTM parameters:

```tsx
import { useUTMs } from "utm-manager/react";

function App() {
  const { params, setParam, captureFromURL } = useUTMs({
    // Configuration options
    autoCapture: true,
    attribution: "first",
    expirationDays: 30,
    onUpdate: (params) => {
      // Handle UTM updates
      analytics.track("UTM Updated", params);
    },
  });

  return (
    <div>
      <h1>Current UTM Parameters:</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>

      {/* Manual UTM capture button */}
      <button onClick={captureFromURL}>Capture UTMs</button>
    </div>
  );
}
```

### Next.js Integration

The Next.js integration adds server-side rendering support and integrates with Next.js routing:

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

// Enable server-side UTM handling
export default withUTMs(Campaign);
```

## Configuration Options

### Core Configuration

The UTM Manager accepts several configuration options:

```typescript
interface UTMConfig {
  // Attribution strategy: 'first' | 'last' | 'dynamic'
  attribution: AttributionStrategy;

  // Cookie expiration time in days
  expirationDays: number;

  // Cookie domain (e.g., '.example.com')
  domain?: string;

  // Callback for dynamic attribution
  attributionCallback?: (currentValue: string, newValue: string) => string;
}
```

### Attribution Strategies

The package supports three attribution strategies:

1. First Touch ('first'): Only saves UTM parameters if they haven't been set before

```javascript
UTMManager.configure({
  attribution: "first",
  expirationDays: 30,
});
```

2. Last Touch ('last'): Always overwrites existing UTM parameters with new values

```javascript
UTMManager.configure({
  attribution: "last",
  expirationDays: 30,
});
```

3. Dynamic Attribution ('dynamic'): Uses a custom callback to determine attribution logic

```javascript
UTMManager.configure({
  attribution: "dynamic",
  attributionCallback: (current, newValue) => {
    // Custom logic to determine which value to keep
    return newValue.includes("google") ? newValue : current;
  },
});
```

## React Hook API

The `useUTMs` hook provides a complete UTM management solution:

```typescript
const {
  // Current UTM parameters
  params: UTMParams,

  // Get a specific UTM parameter
  getParam: (key: string) => string | undefined,

  // Set a specific UTM parameter
  setParam: (key: string, value: string, days?: number) => void,

  // Set multiple UTM parameters
  setParams: (params: Record<string, string>, days?: number) => void,

  // Update configuration
  configure: (strategy: AttributionStrategy, config?: Partial<UTMConfig>) => void,

  // Manually capture UTMs from URL
  captureFromURL: () => void
} = useUTMs(config);
```

## Next.js Integration Features

The Next.js integration extends the base React functionality with:

```typescript
const {
  // All features from useUTMs, plus:
  ...useUTMs(),

  // Enhanced URL capture that works with Next.js routing
  captureFromURL: () => void
} = useNextUTMs({
  // Enable automatic UTM capture on route changes
  autoCapture?: boolean,

  // Enable server-side rendering support
  enableSSR?: boolean,

  // Other UTM configuration options
  ...UTMConfig
});
```

## Security Considerations

UTM Manager implements several security best practices:

- Secure cookie settings by default
- XSS protection through proper encoding
- SameSite cookie attributes
- CSRF protection
- Input validation for UTM parameters

## Browser Support

The package supports all modern browsers and includes fallbacks:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11 (with polyfills)

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import type { UTMParams, UTMConfig, AttributionStrategy } from "utm-manager";

// Example type usage
interface CampaignProps {
  initialUTMs?: UTMParams;
  onUTMUpdate?: (params: UTMParams) => void;
}
```

## Contributing

Contributions are welcome! Feel free to submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or feature requests:

- GitHub Issues: [github.com/gokhanarkan/utm-manager/issues](https://github.com/gokhanarkan/utm-manager/issues)
- Email: hello@gokhanarkan.com

---

Made with ❤️ by [Gökhan Arkan](https://github.com/gokhanarkan)
