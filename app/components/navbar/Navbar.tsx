import Link from "next/link"
import Logo from "../logo/Logo"

function Navbar() {
  return (
    <nav className="px-[28px] sm:px-[64px] xl:px-[320px] py-[28px] flex items-center justify-between">
      <Link href="">
        <Logo cls="w-[40px] h-[40px]" aria-hidden />
      </Link>

      <div>
        <Link href="/features" className="font-bold text-black-100">
          Features
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
