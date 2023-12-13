import Navbar from '../components/navbar/Navbar'
import RegisterLoginForm from '../components/registerLoginForm/RegisterLoginForm'

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

          <RegisterLoginForm type="login" />
        </div>
      </section>
    </div>
  )
}

export default LoginPage
