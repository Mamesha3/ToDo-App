import { SignupForm } from "@/component/signup-form"

export default function Page() {
  return (
    <div className="flex shadow-2xl min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
