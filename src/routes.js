import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboards/Dashboard'))
const Anneeacademique = React.lazy(() => import('./views/anneeacademiques/Anneeacademique'))
const Typerepondant = React.lazy(() => import('./views/typerepondants/Typerepondant'))
const Repondant = React.lazy(() => import('./views/repondants/Repondant'))
const Sim = React.lazy(() => import('./views/sims/Sim'))
const Remise = React.lazy(() => import('./views/sims/Remise'))
const Region = React.lazy(() => import('./views/regions/Region'))
const Province = React.lazy(() => import('./views/provinces/Province'))
const Site = React.lazy(() => import('./views/sites/Site'))
const Demande = React.lazy(() => import('./views/demandes/Demande'))
const Sessiondemande = React.lazy(() => import('./views/sessiondemandes/Sessiondemande'))
const Sessionremise = React.lazy(() => import('./views/sessionremises/Sessionremise'))
const Role = React.lazy(() => import('./views/utilisateurs/Role'))
const Utilisateur = React.lazy(() => import('./views/utilisateurs/Utilisateur'))
// const Permission = React.lazy(() => import('./views/utilisateurs/Permission'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/anneeacademiques', name: 'Années académiques', element: Anneeacademique },
  { path: '/typerepondants', name: 'Type Répondants', element: Typerepondant },
  { path: '/repondants', name: 'Répondants', element: Repondant },
  { path: '/sims', name: 'Sims', element: Sim },
  { path: '/remises', name: 'Remises', element: Remise },
  { path: '/regions', name: 'Régions', element: Region },
  { path: '/provinces', name: 'Provinces', element: Province },
  { path: '/sites', name: 'Sites', element: Site },
  { path: '/demandes', name: 'Demandes', element: Demande },
  { path: '/sessiondemandes', name: 'Sessiondemandes', element: Sessiondemande },
  { path: '/sessionremises', name: 'Sessionremises', element: Sessionremise },
  { path: '/roles', name: 'Rôles', element: Role },
  { path: '/utilisateurs', name: 'Utilisateurs', element: Utilisateur },
  // { path: '/permissions', name: 'Permissions', element: Permission },
]

export default routes
