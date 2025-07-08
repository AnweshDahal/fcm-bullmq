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

## Registering a new job

Make an API call to the endpoint mentioned below

**Endpoint:** POST `/queue/add`

**Authorization:** Sign a JWT using the private key generated above and send it on `Headers/Authorization`

**Body:**

```json
{
  "FCMToken": "XYZ", # The device's FCM token fetched using firebase
  "title": "Your order is ready", # Title for the notification
  "body": "Blah Blah Blah...", # Body message
  "triggerOn": 178965412, # When you want to send the notification
}
```

> In case you want to extend the notification payload you will have to fork it since this setup is for bare-bone notification system
