import React, { useEffect, useState } from 'react'
import { getData, getDashboardData } from '../../apiService'
import { intervalDelays } from '../../constants'
import { data } from 'autoprefixer'

const Dashboard = ({ auth }) => {
  const [anneeacademique, setAnneeacademique] = useState(null)
  const [repondant, setRepondant] = useState({
    total: 0,
    admissible: 0,
    beneficiaire: 0,
    restant: 0,
  })
  const [site, setSite] = useState({ total: 0, active: 0, inactive: 0 })
  const [sim, setSim] = useState({ total: 0, associee: 0, attribuee: 0, libre: 0 })
  const [sessiondemande, setSessiondemande] = useState({ total: 0, active: 0, inactive: 0 })
  const [sessionremise, setSessionremise] = useState({ total: 0, active: 0, inactive: 0 })
  const [demande, setDemande] = useState({ total: 0, traitee: 0, encours: 0 })

  // Année académique en cours et données
  const fetchGetAnneeacademique = async () => {
    const response = await getDashboardData('anneeacademiques_getDashboardData')
    if (response.success) {
      const aca = response.data
      // Année académique
      const dd = aca.datedebut !== null ? new Date(aca.datedebut) : null
      const df = aca.datefin !== null ? new Date(aca.datefin) : null
      setAnneeacademique({
        id: aca.id,
        code: aca.code,
        datedebut: dd !== null ? dd.toLocaleDateString() : '',
        datefin: df !== null ? df.toLocaleDateString() : '',
      })
      // Sessions de demandes
      const sed = aca.sessiondemandes && aca.sessiondemandes
      setSessiondemande(sed)
      // Sessions de remises
      const ser = aca.sessionremises && aca.sessionremises
      setSessionremise(ser)
    } else {
      //
    }
  }

  // Répondants
  const fetchGetRepondant = async () => {
    const response = await getDashboardData('repondants_getDashboardData')
    if (response.success) {
      setRepondant(response.data)
    } else {
      //
    }
  }

  // Sites
  const fetchGetSite = async () => {
    const response = await getDashboardData('sites_getDashboardData')
    if (response.success) {
      setSite(response.data)
    } else {
      //
    }
  }

  // Sims
  const fetchGetSim = async () => {
    const response = await getDashboardData('sims_getDashboardData')
    if (response.success) {
      setSim(response.data)
    } else {
      //
    }
  }

  // Demandes
  const fetchGetDemande = async () => {
    const response = await getDashboardData('demandes_getDashboardData')
    if (response.success) {
      setDemande(response.data)
    } else {
      //
    }
  }

  useEffect(() => {
    let timerId = setInterval(() => {
      fetchGetAnneeacademique()
      fetchGetRepondant()
      fetchGetSite()
      fetchGetSim()
      fetchGetDemande()
     }, 5000)
     return () => {
       clearInterval(timerId)
     }
  }, [])

  return (
    <div className="container mt-4 dashboard">
      {/*  */}
      {/* Année académique en cours */}
      <div className="card dashboardHeader">
        <div className="card-body">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-0">
            <div className="col text-start">
              Année académique :
              <span className="ms-1">{anneeacademique && anneeacademique.code}</span>
            </div>
            <div className="col text-center">
              Date de début :
              <span className="ms-1">{anneeacademique && anneeacademique.datedebut}</span>
            </div>
            <div className="col text-end">
              Date de fin :
              <span className="ms-1">{anneeacademique && anneeacademique.datefin}</span>
            </div>
          </div>
        </div>
      </div>
      {/*  */}
      <div className="row mt-1 row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {/*  */}

        {/* <!-- Card 1 : Répondants --> */}
        <div className="col">
          <div className="card h-100 statisticCard">
            <div className="card-body">
              <h5 className="card-title d-flex statisticCardTitle">
                Répondants
                <span className="ms-auto">{repondant.total}</span>
              </h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-0 statisticCardValue">
                {/* admissibles */}
                <div className="col text-center">
                  <span className="">{repondant.admissible}</span>
                  <p className="py-0 my-0">admissibles</p>
                </div>
                {/* bénéficiaires */}
                <div className="col text-center">
                  <span className="">{repondant.beneficiaire}</span>
                  <p className="py-0 my-0">bénéficiaires</p>
                </div>
                {/* restants */}
                <div className="col text-center">
                  <span className="">{repondant.restant}</span>
                  <p className="py-0 my-0">restants</p>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Card 2 : Sites --> */}
        <div className="col">
          <div className="card h-100 statisticCard">
            <div className="card-body">
              <h5 className="card-title d-flex statisticCardTitle">
                Sites de remises
                <span className="ms-auto">{site.total}</span>
              </h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-0 statisticCardValue">
                {/* actives */}
                <div className="col text-center">
                  <span className="">{site.active}</span>
                  <p className="py-0 my-0">actives</p>
                </div>
                {/* inactives */}
                <div className="col text-center">
                  <span className="">{site.inactive}</span>
                  <p className="py-0 my-0">inactives</p>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Card 3 : Sims --> */}
        <div className="col">
          <div className="card h-100 statisticCard">
            <div className="card-body">
              <h5 className="card-title d-flex statisticCardTitle">
                Sims
                <span className="ms-auto">{sim.total}</span>
              </h5>
              <div className="row row-cols-1 row-cols-md-3 row-cols-lg-3 g-0 statisticCardValue">
                {/* associées */}
                <div className="col text-center">
                  <span className="">{sim.associee}</span>
                  <p className="py-0 my-0">associées</p>
                </div>
                {/* attribuées */}
                <div className="col text-center">
                  <span className="">{sim.attribuee}</span>
                  <p className="py-0 my-0">attribuées</p>
                </div>
                {/* libres */}
                <div className="col text-center">
                  <span className="">{sim.libre}</span>
                  <p className="py-0 my-0">libres</p>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Card 4 : Sessions de demandes --> */}
        <div className="col">
          <div className="card h-100 statisticCard">
            <div className="card-body">
              <h5 className="card-title d-flex statisticCardTitle">
                Sessions de demandes
                <span className="ms-auto">{sessiondemande.total}</span>
              </h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-0 statisticCardValue">
                {/* actives */}
                <div className="col text-center">
                  <span className="">{sessiondemande.active}</span>
                  <p className="py-0 my-0">actives</p>
                </div>
                {/* inactives */}
                <div className="col text-center">
                  <span className="">{sessiondemande.inactive}</span>
                  <p className="py-0 my-0">inactives</p>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Card 5 : Sessions de remises --> */}
        <div className="col">
          <div className="card h-100 statisticCard">
            <div className="card-body">
              <h5 className="card-title d-flex statisticCardTitle">
                Sessions de remises
                <span className="ms-auto">{sessionremise.total}</span>
              </h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-0 statisticCardValue">
                {/* actives */}
                <div className="col text-center">
                  <span className="">{sessionremise.active}</span>
                  <p className="py-0 my-0">actives</p>
                </div>
                {/* inactives */}
                <div className="col text-center">
                  <span className="">{sessionremise.inactive}</span>
                  <p className="py-0 my-0">inactives</p>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Card 6 : Demandes --> */}
        <div className="col">
          <div className="card h-100 statisticCard">
            <div className="card-body">
              <h5 className="card-title d-flex statisticCardTitle">
                Demandes
                <span className="ms-auto">{demande.total}</span>
              </h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-0 statisticCardValue">
                {/* traitées */}
                <div className="col text-center">
                  <span className="">{demande.traitee}</span>
                  <p className="py-0 my-0">traitées</p>
                </div>
                {/* en cours */}
                <div className="col text-center">
                  <span className="">{demande.encours}</span>
                  <p className="py-0 my-0">en cours</p>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>

        {/*  */}
      </div>
    </div>
  )
}

export default Dashboard
