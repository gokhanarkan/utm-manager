# Standalone JavaScript Integration

## Basic Integration

Simply add the script to your HTML:

```html
<script src="https://unpkg.com/utm-manager/dist/utm-manager.min.js"></script>
```

That's it! The script will automatically:

- Initialize with default settings
- Capture UTM parameters from URLs
- Store them in cookies
- Trigger events when UTMs are updated

## Example Scenarios

1. Direct URL Parameters:

```
https://yourdomain.com/?utm_source=google&utm_campaign=spring2024
```

These parameters will be automatically captured and stored.

2. Custom Configuration:

```html
<script src="https://unpkg.com/utm-manager/dist/utm-manager.min.js"></script>
<script>
  // Optional: Override default configuration
  UTMManager.configure({
    attribution: "first",
    expirationDays: 90,
    domain: ".yourdomain.com",
  });
</script>
```

3. Track UTM Updates:

```html
<script>
  window.addEventListener("utmParametersUpdated", function (event) {
    console.log("New UTM Parameters:", event.detail);
    // Send to analytics, update UI, etc.
  });
</script>
```

## API Reference

The standalone version provides these methods:

```javascript
// Get all stored UTM parameters
const params = UTMManager.getAllUTMs();

// Get a specific UTM parameter
const campaign = UTMManager.getUTM("utm_campaign");

// Manually save a UTM parameter
UTMManager.saveUTM("utm_source", "newsletter");

// Manually trigger URL parameter capture
UTMManager.autoCapture();
```

## Verification

You can verify the integration is working by:

1. Opening your browser's console
2. Running `UTMManager.getAllUTMs()`
3. Checking your browser's cookies storage

## Common Use Cases

1. Campaign Tracking:

```javascript
window.addEventListener("utmParametersUpdated", function (event) {
  // Send to analytics
  analytics.track("Campaign Visit", event.detail);
});
```

2. Form Integration:

```javascript
document.querySelector("form").addEventListener("submit", function (e) {
  const utmParams = UTMManager.getAllUTMs();
  // Add UTM parameters to hidden form fields
  Object.entries(utmParams).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    this.appendChild(input);
  });
});
```
