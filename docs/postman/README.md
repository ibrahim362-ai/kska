# Postman Collection

This directory contains the Postman collection for the Community Hub API.

## How to Use

### 1. Import into Postman

1. Open Postman
2. Click **Import** → **Upload Files**
3. Select `community-hub.postman_collection.json`
4. The collection "Community Hub API" will appear in your sidebar

### 2. Set Up Environment

The collection uses these variables (auto-set by test scripts):
- `{{baseUrl}}` — defaults to `http://localhost:5000/api`
- `{{accessToken}}` — auto-populated on signin/signup
- `{{refreshToken}}` — auto-populated on signin/signup
- `{{userId}}`, `{{postId}}`, `{{paymentId}}`, etc. — auto-populated

### 3. Recommended Flow

1. **Health** → verify backend is running
2. **Auth → Sign Up** → creates a new user, stores tokens
3. **Posts → Create Post** → creates a post, stores `postId`
4. **Posts → Like Post** → like the post
5. **Memberships → List Plans** → get membership options
6. **Payments (Manual) → Create Manual Payment** → create pending payment, stores `paymentId`
7. **Payments (Manual) → Submit Receipt Proof** → upload receipt
8. **Auth → Get Me** → verify authenticated request works

### 4. Testing Different Roles

The collection has both USER and ADMIN endpoints. For admin actions:
1. Manually create an admin user (modify seed.ts or use a script)
2. Sign in as that user
3. Run admin endpoints (e.g., "All Proofs (admin)")

### 5. Auto-Saving Tokens

After running **Sign Up** or **Sign In**, the response's `accessToken` and `refreshToken` are automatically saved to collection variables. All subsequent requests use these tokens via the collection's Bearer Auth.

### 6. Exporting Tests

You can run the entire collection via Newman (CLI):
```bash
npm install -g newman
newman run community-hub.postman_collection.json
```

Or with HTML reports:
```bash
newman run community-hub.postman_collection.json -r html
```

## Updating the Collection

When new endpoints are added, regenerate by:
1. Run the backend (`npm run dev`)
2. Open Swagger docs: http://localhost:5000/api/docs
3. Manually add the new request to the collection (or use Postman's "Generate from cURL")
4. Commit the updated JSON to this directory
