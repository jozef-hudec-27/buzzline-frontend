type ActionModalProps = {
  title: string
  subtitle: string
  confirmText: string
  confirmAction: () => void
  cancelText: string
  cancelAction: () => void
  actionPending?: boolean
}

function ActionModal({
  title,
  subtitle,
  confirmText,
  confirmAction,
  cancelText,
  cancelAction,
  actionPending,
}: ActionModalProps) {
  return (
    <div>
      <div className="flex flex-col gap-[12px]">
        <h3>{title}</h3>

        <p>{subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-[8px] mt-[12px]">
          <button
            className={`btn btn--primary flex-1 ${actionPending ? 'cursor-wait' : ''}`}
            onClick={confirmAction}
            disabled={!!actionPending}
          >
            {confirmText}
          </button>
          <button
            className="btn btn--primary !bg-transparent !text-black-100 flex-1"
            onClick={cancelAction}
            disabled={!!actionPending}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionModal
