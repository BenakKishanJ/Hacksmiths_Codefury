import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex w-full justify-center items-center min-h-screen bg-neutral-100 dark:bg-neutral-800 p-4">
      <div className="max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to your account to continue
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-md">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200",
                formFieldInput:
                  "border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white",
                footerActionLink:
                  "text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
