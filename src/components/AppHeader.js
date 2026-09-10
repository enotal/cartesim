import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'

const AppHeader = ({ auth }) => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader
      position="sticky"
      className="mb-4 p-0 AppHeader fixed-top"
      ref={headerRef}
      style={{ backgroundColor: '#056709' }}
    >
      <CContainer className="border-bottom px-4 py-0" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" className="text-light" />
        </CHeaderToggler>
        <CHeaderNav className="ms-auto me-3">
          {/*<CNavItem>
            <CNavLink href="/#/dashboard" className="text-light">
              <CIcon icon={cilBell} size="lg" className="me-1" />
              Notifications
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/#/dashboard" className="text-light">
              <CIcon icon={cilEnvelopeOpen} size="lg" className="me-1" />
              Messages
            </CNavLink>
          </CNavItem>*/}
        </CHeaderNav>
        <CHeaderNav>
          <AppHeaderDropdown auth={auth} />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
