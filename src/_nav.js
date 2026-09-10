import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPieChart,
  faUsers,
  faObjectGroup,
  faPaperPlane,
  faCogs,
  faHashtag,
  faPooStorm,
  faTasks,
  faFile,
  faCubes,
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// const auth = JSON.parse(localStorage.getItem('cartesim.auth'))
// const roles = auth ? auth.roles : null

const _nav = [
  {
    component: CNavItem,
    name: 'Tableau de bord',
    to: '/dashboard',
    role: '*',
    icon: <FontAwesomeIcon icon={faPieChart} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Années académiques',
    to: '/anneeacademiques',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faUsers} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Types Répondants',
    to: '/typerepondants',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faUsers} className="me-1" />,
  },
  {
    component: CNavItem,
    name: 'Répondants',
    to: '/repondants',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faUsers} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Régions',
    to: '/regions',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faObjectGroup} className="me-1" />,
  },
  {
    component: CNavItem,
    name: 'Provinces',
    to: '/provinces',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faObjectGroup} className="me-1" />,
  },
  {
    component: CNavItem,
    name: 'Sites',
    to: '/sites',
    role: 'administrateur,cpm,agent-cpm,point focal',
    icon: <FontAwesomeIcon icon={faObjectGroup} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Sims',
    to: '/sims',
    role: 'administrateur,cpm,daf,agent-cpm,agent-daf,point focal',
    icon: <FontAwesomeIcon icon={faPaperPlane} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Sessions demandes',
    to: '/sessiondemandes',
    role: 'administrateur,cpm,daf,agent-cpm,agent-daf,point focal',
    icon: <FontAwesomeIcon icon={faCogs} className="me-1" />,
  },
  {
    component: CNavItem,
    name: 'Sessions remises',
    to: '/sessionremises',
    role: 'administrateur,cpm,daf,agent-cpm,agent-daf,point focal',
    icon: <FontAwesomeIcon icon={faCogs} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Demandes',
    to: '/demandes',
    role: 'administrateur,cpm,daf,agent-cpm,agent-daf,point focal',
    icon: <FontAwesomeIcon icon={faHashtag} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Remises',
    to: '/remises',
    role: 'administrateur,cpm,agent-cpm,point focal,chargé de remise',
    icon: <FontAwesomeIcon icon={faHashtag} className="me-1" />,
  },
  {
    component: CNavItem,
    name: <hr className="my-0" />,
  },
  {
    component: CNavItem,
    name: 'Rôles',
    to: '/roles',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faCubes} className="me-1" />,
  },
  {
    component: CNavItem,
    name: 'Utilisateurs',
    to: '/utilisateurs',
    role: 'administrateur',
    icon: <FontAwesomeIcon icon={faCubes} className="me-1" />,
  },
  /*
  {
    component: CNavItem,
    name: 'Permissions',
    to: '/permissions',
    user: '*',
    icon: <FontAwesomeIcon icon={faCubes} className="me-1" />,
  },*/
]

export default _nav
