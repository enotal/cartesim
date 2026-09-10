import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppGuestHeader, AppGuestFooter } from '../../components'
import { CustomIndexAlert } from '../../components/CustomIndexAlert'
import { CustomRequired } from '../../components/CustomRequired'
import { guestGetItemBy } from '../../apiService'
import { colors } from '../../constants'

const DemandeGuestSuivre = () => {
  const navigate = useNavigate()
  const formRef = useRef()
  const [demandes, setDemandes] = useState([])
  const [alert, setAlert] = useState(null)

  // Redirection vers la page d'accueil
  const handleHome = (e) => {
    navigate('/', { replace: true })
  }

  // Cancel
  const handleCancel = () => {
    $('#code').val('')
    setAlert(null)
    setDemande(null)
  }

  // Search
  const handleSubmit = async (e) => {
    e.preventDefault()
    const submitterName = e.nativeEvent.submitter.name
    // Search
    if (submitterName === 'btn-search') {
      // récupération des données du formulaire
      const formData = new FormData(formRef.current)
      const formValues = Object.fromEntries(formData)
      const response = await guestGetItemBy('demandes/guestfollow', formValues)
      if (response.success) {
	const dmds = response.data ? response.data.demandes : []
        const items = []
        dmds.map((dmd) => {
          let d = dmd.dmddate !== null ? new Date(dmd.dmddate) : null
          let serdd = dmd.sessionremise !== null && dmd.sessionremise.seractive === "oui" ? (dmd.sessionremise.serdatedebut !== null ? new Date(dmd.sessionremise.serdatedebut) : null) : null
          let serdf = dmd.sessionremise !== null && dmd.sessionremise.seractive === "oui" ? (dmd.sessionremise.serdatefin !== null ? new Date(dmd.sessionremise.serdatefin) : null) : null
          let simde = dmd.sim !== null ? (dmd.sim.simdateremiseeffective !== null ? new Date(dmd.sim.simdateremiseeffective) : null) : null
          items.push({
            id: dmd.id, 
            date: d !== null ? d.toLocaleDateString() : '', 
            site: dmd.site && dmd.site.sitlibelle, 
            simnumero: dmd.sim !== null ? 'Composer *444#, puis valider' : '',  
            simcode: dmd.sim !== null ? dmd.sim.simcode : '',
	    sessionremise: serdd !== null && serdf !== null ? serdd.toLocaleDateString() + ' - ' + serdf.toLocaleDateString() : '' , 
            remise: dmd.dmddateremise !== null ? dmd.dmddateremise : '',  
            dateeffectiveremise: simde !== null ? simde.toLocaleDateString() : null,  
          })
        })
        setDemandes(items)
      } else {
        setDemandes([])
      }
      setAlert(response)
    }
  }

  return (
    <div className="home-main-container min-vh-100">
      <AppGuestHeader />
      <div className="container pt-5">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <form
              ref={formRef}
              className=""
              role="search"
              action=""
              method="GET"
              onSubmit={handleSubmit}
              encType=""
            >
              {/* Alerts */}
              {alert && (
                <div
                  className="card mb-2"
                  style={{
                    backgroundColor: colors[alert.type],
                    borderColor: colors[alert.type],
                  }}
                >
                  <div className="card-body py-1">
                    <CustomIndexAlert alert={alert} />
                  </div>
                </div>
              )}
              {/* Search */}
              <div className="card">
                <div className="card-header py-1 d-flex justify-content-center align-content-center">
                  <div className="card-header-custom-title align-content-center">
                    <i className="fa fa-eye me-1" aria-hidden="true"></i>Suivre ma demande
                  </div>
                  <button
                    type="button"
                    className="btn ms-auto custom-btn-secondary"
                    onClick={handleHome}
                  >
                    <i className="fa fa-home me-1" aria-hidden="true"></i>Accueil
                  </button>
                </div>
                <div className="card-body pt-1">
                  <CustomRequired tagP={true} />
                  {/* Identifiant */}
                  <div className="my-2">
                    <label htmlFor="code" className="form-label mb-0 fw-bolder">
                      Identifiant (INE)
                      <CustomRequired />
                    </label>
                    <div className="d-flex">
                      <div className=" flex-grow-1">
                        <input
                          className="form-control me-2"
                          type="search"
                          placeholder="Code de la demande"
                          aria-label="Search"
                          id="code"
                          name="code"
                          required
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn custom-btn-success ms-3 text-nowrap"
                        name="btn-search"
                      >
                        <i className="fa fa-search me-1" aria-hidden="true"></i>Rechercher
                      </button>
                    </div>
                  </div>
                </div>
              </div>
	      {/* Result */}
              {demandes.length > 0 && (
                <div className="card mt-2 show-follow-result-card">
                  <div className="card-header">{demandes.length + ' demande(s) associée(s)'}</div>
                  <div className="card-body py-1">
                    <div className="row row-cols-1 row-cols-md-1 row-cols-lg-1 g-2">
                      {demandes.map((demande, index) => (
                        <div className="col" key={'demande-item-' + index}>
                          <div className="card h-100">
                            <div className="card-header py-1">{'# demande ' + (index + 1)}</div>
                            <div className="card-body py-1">
                              {/* Code */}
                              <div className="d-flex border-bottom">
                                <div className="show-follow-title">Code</div>
                                <div className="show-follow-value ms-auto">{demande.id}</div>
                              </div>
                              {/* Date */}
                              <div className="d-flex border-bottom">
                                <div className="show-follow-title">Date de la demande</div>
                                <div className="show-follow-value ms-auto">{demande.date}</div>
                              </div>
			      {/* Site désiré pour la remise */}
                              <div className="d-flex border-bottom">
                                <div className="show-follow-title">Site désiré pour la remise</div>
                                <div className="show-follow-value ms-auto">{demande.site}</div>
                              </div>
                              <div className="d-flex border-bottom">
                               <div className="show-follow-title">Période, Horaires et Lieu de remise</div>
                               <div className="show-follow-value ms-auto">{demande.remise}</div>
                              </div>
                              {/* Code de la SIM */}
                              <div className="d-flex border-bottom">
                                <div className="show-follow-title">Code de la SIM</div>
                                <div className="show-follow-value ms-auto">{demande.simcode}</div>
                              </div>
                              {/* Numéro d'abonné */}
                              <div className="d-flex border-bottom">
                                <div className="show-follow-title">Numéro d'abonné</div>
                                <div className="show-follow-value ms-auto text-danger">{demande.simnumero}</div>
                              </div>
                              {/* Session de remise */}
                              {/*<div className="d-flex border-bottom">
                                <div className="show-follow-title">Session de remise</div>
                                <div className="show-follow-value ms-auto">{demande.sessionremise}</div>
                              </div>*/}
                              {/* Date prévisionnelle de remise */}
			      {/*<div className="d-flex border-bottom">
			        <div className="show-follow-title">Date prévisionnelle de remise</div>
                                <div className="show-follow-value ms-auto">{demande.dateprevisionnelleremise}</div>
                              </div>*/}
			      {/* Date effective de remise  */}
			      <div className="d-flex">
				<div className="show-follow-title">Date de remise</div>
				<div className="show-follow-value ms-auto">{demande.dateeffectiveremise}</div>
			      </div>
                              {/*  */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/*  */}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemandeGuestSuivre
