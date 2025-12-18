
# Supabase Authentication Setup

To make the app send a **6-digit Code** instead of a **Magic Link**, you must configure the Email Templates in your Supabase Dashboard.

## Step 1: Go to Email Templates
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** (in the sidebar) -> **Configuration** -> **Email Templates**.

## Step 2: Update "Magic Link" Template
This template is used when an *existing* user logs in.

1. Click on **Magic Link**.
2. Change the **Subject** to: `Your Login Code`
3. Change the **Body** to only include the token.
   *   **Source**: Switch to "Source" view (or just plain text).
   *   **Content**: 
       ```html
       <h2>Sign in to DidYouDoIt</h2>
       <p>Your login code is:</p>
       <h1>{{ .Token }}</h1>
       ```
   *   **Important**: Remove `{{ .ConfirmationURL }}` and replace it with `{{ .Token }}`.

## Step 3: Update "Confirm Signup" Template
This template is used when a *new* user logs in for the first time.

1. Click on **Confirm Signup**.
2. Change the **Subject** to: `Your Login Code`
3. Change the **Body**:
   ```html
   <h2>Welcome to DidYouDoIt</h2>
   <p>Your verification code is:</p>
   <h1>{{ .Token }}</h1>
   ```
4. **Important**: Remove `{{ .ConfirmationURL }}` and replace it with `{{ .Token }}`.

## Step 4: Verify Settings
1. Go to **Providers** -> **Email**.
2. Ensure **Enable Email Provider** is ON.
3. Ensure **Confirm Email** is ON.
