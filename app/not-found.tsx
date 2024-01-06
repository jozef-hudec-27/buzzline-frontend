'use client'

function NotFoundPage() {
  return (
    <div className="h-[100vh] flex justify-center items-center">
      <div className="flex flex-col gap-[32px] px-[16px]">
        <h1 className="gradient-text text-center">Ooops, page not found...</h1>

        <button className="btn primary" onClick={() => (window.location.replace('/'))}>
          Go home
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
