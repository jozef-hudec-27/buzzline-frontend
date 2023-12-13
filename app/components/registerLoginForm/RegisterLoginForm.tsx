import Link from 'next/link'

type RegisterProps = {
  type: 'register'
  page: 0 | 1
  setPage: React.Dispatch<React.SetStateAction<0 | 1>>
}

type LoginProps = {
  type: 'login'
}

function RegisterLoginForm(props: RegisterProps | LoginProps) {
  return (
    <form className="w-full flex flex-col gap-[12px]">
      {props.type === 'register' ? (
        // REGISTER
        <>
          {props.page === 0 ? (
            <>
              <input type="text" placeholder="First name" className="input" autoComplete="given-name" />
              <input type="text" placeholder="Last name" className="input" autoComplete="family-name" />
              <input type="email" placeholder="Email address" className="input" autoComplete="email" />
            </>
          ) : (
            <>
              <input type="password" placeholder="Password" className="input" autoComplete="new-password" />
              <input
                type="password"
                placeholder="Confirm password"
                className="input mb-[60px]"
                autoComplete="new-password"
              />
            </>
          )}

          <div className="w-fit mt-[12px] flex items-center gap-[24px]">
            <button
              className="btn primary"
              onClick={(e) => {
                e.preventDefault()

                if (props.page === 0) {
                  props.setPage(1)
                } else {
                  //   FETCH
                }
              }}
            >
              {props.page === 0 ? 'Continue' : 'Sign up'}
            </button>

            {props.page === 0 ? (
              <Link href="/login" className="underline">
                Already have an account?
              </Link>
            ) : (
              <Link
                href=""
                className="underline"
                onClick={(e) => {
                  e.preventDefault()

                  props.setPage(0)
                }}
              >
                Go back
              </Link>
            )}
          </div>
        </>
      ) : (
        // LOGIN
        <>
          <input type="email" placeholder="Email address" className="input" autoComplete="email" />
          <input type="password" placeholder="Password" className="input" autoComplete="new-password" />

          <div className="w-fit mt-[12px] flex items-center gap-[24px]">
            <button className="btn primary">Log in</button>

            <Link href="/register" className="underline">
              Don't have an account yet?
            </Link>
          </div>
        </>
      )}
    </form>
  )
}

export default RegisterLoginForm
