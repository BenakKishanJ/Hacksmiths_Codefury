import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-100 dark:bg-neutral-800 p-4">
      <div className="max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Join our community of artists and art enthusiasts
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-md">
          <SignUp
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
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
