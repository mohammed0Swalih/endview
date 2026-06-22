import { redirect } from 'next/dist/client/components/navigation';
import { ReactNode } from 'react'
import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
    if (isUserAuthenticated) redirect("/"); // If user is authenticated and try to access signin page from homepage redirect to home page itself
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}

export default AuthLayout