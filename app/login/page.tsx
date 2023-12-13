import Link from 'next/link'
import Navbar from '../components/navbar/Navbar'

function LoginPage() {
  return (
    <div>
      <Navbar />

      <section className="mt-[48px] sm:mt-[96px]">
        <div className="flex flex-col gap-[32px] w-fit mx-auto">
          <h1 className="gradient-text text-[60px] sm:text-[90px] leading-none">
            Log in to
            <br /> BuzzLine
          </h1>

          <form className="w-full flex flex-col gap-[12px]">
            <input type="email" placeholder="Email address" className="input" autoComplete="email" />
            <input type="password" placeholder="Password" className="input" autoComplete="new-password" />

            <div className="w-fit mt-[12px] flex items-center gap-[24px]">
              <button className="btn primary">Log in</button>

              <Link href="/register" className="underline">
                Don't have an account yet?
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
