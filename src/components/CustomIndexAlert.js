import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

export const CustomIndexAlert = ({ alert, alignment }) => {
  const indexAlertBg = {
    success: '#056709',
    danger: '#970000',
    //warning: '#C7CF00',
    warning: '#e1b505', 
  }

  return (
    <div className={alignment ? alignment : 'ms-auto'}>
      {alert && (
        <span className="p-1 text-white" style={{ backgroundColor: indexAlertBg[alert.type] }}>
          <FontAwesomeIcon icon={alert.type === 'success' ? faCheck : faExclamationTriangle} />
          {alert.message}
        </span>
      )}
    </div>
  )
}
