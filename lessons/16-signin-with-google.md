# 16-signin-with-google

1. open https://console.cloud.google.com/apis/credentials
2. create a new OAuth 2.0 Client ID ans get its credentials
3. .env.local

   ```txt
        AUTH_GOOGLE_ID=xx.apps.googleusercontent.com
        AUTH_GOOGLE_SECRET=xx
   ```

4. lib/actions/user.actions.ts

   ```ts
   export const SignInWithGoogle = async () => {
     await signIn('google')
   }
   ```

5. auth.ts

   ```ts
   import Google from 'next-auth/providers/google'
   ...
   providers: [
     Google({
       allowDangerousEmailAccountLinking: true,
     }),
   ]
   ```

6. app/(auth)/sign-in/google-signin-form.tsx

   ```tsx
   'use client'
   import { useFormStatus } from 'react-dom'

   import { Button } from '@/components/ui/button'
   import { SignInWithGoogle } from '@/lib/actions/user.actions'

   export function GoogleSignInForm() {
     const SignInButton = () => {
       const { pending } = useFormStatus()
       return (
         <Button disabled={pending} className='w-full' variant='outline'>
           {pending ? 'Redirecting to Google...' : 'Sign In with Google'}
         </Button>
       )
     }
     return (
       <form action={SignInWithGoogle}>
         <SignInButton />
       </form>
     )
   }
   ```

7. app/(auth)/sign-in/page.tsx

   ```tsx
   import { GoogleSignInForm } from './google-signin-form'
   ...
   <div>
     <CredentialsSignInForm />
     <SeparatorWithOr />
     <div className='mt-4'>
       <GoogleSignInForm />
     </div>
   </div>
   ```

8. app/api/auth/[...nextauth]/route.ts

   ```ts
   import { handlers } from '@/auth'

   export const { GET, POST } = handlers
   ```

9. commit changes and push to GitHub
10. go to https://nextjs-amazona.vercel.app
