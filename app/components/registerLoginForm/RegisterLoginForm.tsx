import Link from 'next/link'

import { LoginFormState, RegisterFormState } from '@/app/register/types'

type RegisterProps = {
  type: 'register'
  page: 0 | 1
  setPage: React.Dispatch<React.SetStateAction<0 | 1>>
  formState: RegisterFormState
  setFormState: React.Dispatch<React.SetStateAction<RegisterFormState>>
}

type LoginProps = {
  type: 'login'
  formState: LoginFormState
  setFormState: React.Dispatch<React.SetStateAction<LoginFormState>>
}

function RegisterLoginForm(props: RegisterProps | LoginProps) {
  const { type, formState, setFormState } = props

  const changeState = <T extends LoginFormState | RegisterFormState>(key: keyof T, value: string) => {
    // @ts-ignore
    setFormState((prevState: T) => ({ ...prevState, [key]: value } as T))
  }

  return (
    <form
      className="w-full flex flex-col gap-[12px]"
      onSubmit={(e) => {
        e.preventDefault()

        if (type === 'register') {
          if (props.page === 0) {
            props.setPage(1)
          } else {
            //   FETCH
          }
        } else {
        }
      }}
    >
      {type === 'register' ? (
        // REGISTER
        <>
          {props.page === 0 ? (
            <>
              <input
                type="text"
                placeholder="First name"
                className="input"
                autoComplete="given-name"
                value={formState.firstName}
                onChange={(e) => changeState<RegisterFormState>('firstName', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last name"
                className="input"
                autoComplete="family-name"
                value={formState.lastName}
                onChange={(e) => changeState<RegisterFormState>('lastName', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                className="input"
                autoComplete="email"
                value={formState.email}
                onChange={(e) => changeState<RegisterFormState>('email', e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="Password"
                className="input"
                autoComplete="new-password"
                value={formState.password}
                onChange={(e) => changeState<RegisterFormState>('password', e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="input mb-[60px]"
                autoComplete="new-password"
                value={formState.confirmPassword}
                onChange={(e) => changeState<RegisterFormState>('confirmPassword', e.target.value)}
                required
              />
            </>
          )}

          <div className="w-fit mt-[12px] flex items-center gap-[24px]">
            <button className="btn primary">{props.page === 0 ? 'Continue' : 'Sign up'}</button>

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
          <input
            type="email"
            placeholder="Email address"
            className="input"
            autoComplete="email"
            value={formState.email}
            onChange={(e) => changeState<LoginFormState>('email', e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input"
            autoComplete="current-password"
            value={formState.password}
            onChange={(e) => changeState<LoginFormState>('password', e.target.value)}
            required
          />

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
