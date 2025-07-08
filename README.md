# FCM + BullMQ

This microservice helps you to schedule FCM notifications

## Generating Private Key/ Public Key pair for authentication

```bash
  # Generate a private key
  openssl genpkey -algorithm RSA -out private.key -pkeyopot rsa_keygen_bits:2048
  # Generating public key from the private key
  openssl rsa -pubout -in private.key -out public.key
```

> Copy the private key to your app and use it to sign JWT tokens, and use the public key to verify the the requests in this service

> **Make sure that you sign tokens with short lifespan (max 5m)**
