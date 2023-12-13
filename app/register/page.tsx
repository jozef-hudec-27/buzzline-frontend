import Link from 'next/link'
import Navbar from '../components/navbar/Navbar'

function RegisterPage() {
  return (
    <div>
      <Navbar />
      <section className="mt-[48px] sm:mt-[96px] px-0 sm:px-[24px] xl:px-[240px]">
        <div className="flex flex-col xl:flex-row items-center gap-[96px]">
          <div className="flex flex-col gap-[32px]">
            <h1 className="gradient-text text-[60px] sm:text-[90px] leading-none">
              Chat
              <br /> anytime,
              <br /> anywhere
            </h1>

            <form className="w-full flex flex-col gap-[12px]">
              <input type="email" placeholder="Email address" className="input" autoComplete="email" />
              <input type="password" placeholder="Password" className="input" autoComplete="new-password" />
              <input type="password" placeholder="Confirm password" className="input" autoComplete="new-password" />

              <div className="w-fit mt-[12px] flex items-center gap-[24px]">
                <button className="btn primary">Sign up</button>

                <Link href="/login" className="underline">
                  Already have an account?
                </Link>
              </div>
            </form>
          </div>

          <div className="p-[24px] flex flex-col gap-[32px] sm:gap-[64px] cursor-default w-11/12 sm:w-3/4 xl:w-[59%]">
            <p className="px-[24px] py-[16px] text-[16px] sm:text-[24px] bg-secondary rounded-[24px] max-w-[640px] text-white shadow-lg self-end">
              Hey there! 👋 I was wondering whether or not you're down to a party tonight? It's gonna be a blast!
            </p>

            <p className="px-[24px] py-[16px] text-[16px] sm:text-[24px] bg-black-10 rounded-[24px] max-w-[640px] shadow-lg">
              Yo, absolutely! I'm down for whatever. Just let me know when and where.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RegisterPage
