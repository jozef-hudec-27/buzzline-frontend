import Link from "next/link"
import Logo from "../logo/Logo"

function Navbar() {
  return (
    <nav className="px-[28px] sm:px-[64px] xl:px-[320px] py-[28px] flex items-center justify-between">
      <Link href="" aria-label="BuzzLine">
        <Logo cls="w-[40px] h-[40px]" aria-hidden />
      </Link>

      {/* <div>
        <Link href="/features" className="pb-[2px] font-bold text-black-100 hover:border-b-[3px] border-secondary">
          Features
        </Link>
      </div> */}
    </nav>
  )
}

export default Navbar
