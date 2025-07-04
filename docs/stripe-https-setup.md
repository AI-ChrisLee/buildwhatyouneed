# Stripe HTTPS Setup for Local Development

## Option 1: Use HTTPS in Development (Recommended)

### Using Next.js with HTTPS

1. Install mkcert to create local SSL certificates:
```bash
# macOS
brew install mkcert
mkcert -install

# Create certificates
mkdir certificates
cd certificates
mkcert localhost
```

2. Update your package.json to use HTTPS:
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https"
  }
}
```

Or use custom certificates:
```json
{
  "scripts": {
    "dev:https": "next dev --experimental-https-key ./certificates/localhost-key.pem --experimental-https-cert ./certificates/localhost.pem"
  }
}
```

3. Run the development server:
```bash
npm run dev:https
```

## Option 2: Use ngrok (Quick Solution)

1. Install ngrok:
```bash
brew install ngrok
```

2. Run your dev server normally:
```bash
npm run dev
```

3. In another terminal, expose it via ngrok:
```bash
ngrok http 3000
```

4. Use the HTTPS URL provided by ngrok.

## Option 3: Ignore in Development

The warning doesn't prevent Stripe from working in test mode. You can:

1. **Manually enter test card**: 4242 4242 4242 4242
2. **Use any future date** for expiry
3. **Use any 3 digits** for CVC
4. **Use any 5 digits** for ZIP

## Note for Production

This issue only occurs in development. Your production deployment will use HTTPS automatically, and autofill will work normally.