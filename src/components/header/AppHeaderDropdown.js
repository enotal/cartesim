import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { AvatarFemme, AvatarHomme } from '../../assets/images/avatars/avatars'
import { cookieItems } from '../../constants'
import { logout } from '../../apiService'

const AppHeaderDropdown = ({ auth }) => {
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [avatar, setAvatar] = useState('')
  const [roles, setRoles] = useState('')
  const navigate = useNavigate()
  const handleLogout = async () => {
    const response = await logout(auth)
    localStorage.setItem(cookieItems[0], null)
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (auth) {
      // Name 
      setName(auth.name+ ' ' + auth.lastname)
      // Alias
      let an = auth.name.substr(0, 1)
      let authLastname = auth.lastname.split(' ')
      let al = '' 
      const authSexe = auth.sexe
      authLastname.forEach((element) => {
        al += element.substr(0, 1)
      })
      setAlias(an + '' + al)
      // Avatar
      if (authSexe === "Masculin") {
	setAvatar(AvatarHomme)
      } else if (authSexe === "Féminin") {
	setAvatar(AvatarFemme)
      } else {
        setAvatar("")
      }
      // Rôles
      setRoles(auth.roles.join(', '))
      //
    }
  }, [])

  return (
    <CDropdown variant="nav-item">
      <div className="text-light">
        <CDropdownToggle
          placement="bottom-end"
          className="py-0 pe-0 text-light"
          title={name}
          // caret={isAuthenticated ? true : false}
        >
          <CAvatar
            src={avatar}
            size="md"
          />
          <span className="">
            {alias}
          </span>
        </CDropdownToggle>
        <div className="">{roles}</div>
      </div>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profil
        </CDropdownItem>
        <CDropdownDivider /> */}
        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Déconnexion
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
