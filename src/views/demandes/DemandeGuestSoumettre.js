import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppGuestHeader, AppGuestFooter } from '../../components'
import { CustomRequired } from '../../components/CustomRequired'
import { getItem, getItemBy, guestCreateItem } from '../../apiService'
import { CustomIndexAlert } from '../../components/CustomIndexAlert'
import { isEmpty } from 'validator'
import $ from 'jquery'
import { colors } from '../../constants'

  const DemandeGuestSoumettre = () => {
  const navigate = useNavigate()
  const formRef = useRef()
  const btnResetRef = useRef()
  const tableRef = useRef()
  const [alert, setAlert] = useState(null)
  const [dates, setDates] = useState({ datedebut: '', datefin: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessiondemande, setSessiondemande] = useState([])
  const [regions, setRegions] = useState([])
  const [sites, setSites] = useState([])
  const [show, setShow] = useState(false)

  const fetchGetSessiondemande = async () => {
    const response = await getItem('sessiondemandes_getactive')
    if (response.success) {
      const t = response.data && response.data.typerepondant 
      if (t.tyrlibelle === 'étudiant') {
      	setSessiondemande(response.data)
      	const dd = response.data.seddatedebut !== null ? new Date(response.data.seddatedebut) : ''
      	const df = response.data.seddatefin !== null ? new Date(response.data.seddatefin) : ''
      	setDates({
          datedebut: dd !== null ? dd.toLocaleDateString() : '',
          datefin: df !== null ? df.toLocaleDateString() : '',
        })
        setShow(response.success)
      } else {
	//
      }
    } else {
      //
    }
  }

  const fetchGetRegion = async () => {
    const response = await getItem('regions_getactive')
    if (response.success) {
      setRegions(response.data)
    }
  }

  const fetchGetSite = async () => {
    const response = await getItem('sites_getactive')
    if (response.success) {
      setSites(response.data)
    }
  }

  useEffect(() => {
    //let timerId = setInterval(() => {
      fetchGetSessiondemande()
      //fetchGetRegion()
      fetchGetSite()
   /* }, 600000)
    return () => {
      clearInterval(timerId)
    }*/
  }, [])

  // Redirection vers la page d'accueil
  const handleHome = (e) => {
    navigate('/', { replace: true })
  }

  // Search & Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    // récupération des données du formulaire
    const formData = new FormData(formRef.current)
    const formValues = Object.fromEntries(formData)
    formValues.sessiondemande = sessiondemande && sessiondemande.id
    const response = await guestCreateItem('demandes/guestsubmit', formValues)
    if (response.status === 500) {
       setAlert({type:'warning', message:'Une erreur est survenue. Merci de réessayer ultérieurement !'})
    } else {
      setAlert(response)
      if (response.success) {
	 if (btnResetRef.current) {
	    btnResetRef.current.click()
         }
      }
    }
  }

  const handleDemandeGuestSuivre = (e) => {
    navigate('/demandes/suivre', { replace: true })
  }

  return (
    <div className="demandeGuestSoumettre min-vh-100">
      <AppGuestHeader />
      <div className="container pt-5">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            {show ? (
              <form ref={formRef} onSubmit={handleSubmit} method="POST" encType="">
                {/* Notifications & Alerts */}
                {/* Notifications */}
                <div className="card mb-1 sessionInfo">
                  <div className="card-body py-1 fw-bolder text-center">
                    <i className="fa fa-exclamation-circle me-2" aria-hidden="true"></i>
                    {'La session est ouverte du ' +
                      dates.datedebut +
                      ' au ' +
                      dates.datefin +
                      ' inclus !'}
                  </div>
                </div>

		{/* Invite à suivre la demande */}
            	<div className="card bg-light mb-1" style={{ backgroundColor: '#970000', border: '5px solid #970000' }}>
              	  <div className="card-body py-1 text-justify">
                      Des dysfonctionnements peuvent survenir lors de la soumission. Au cas où vous ne parvenez pas à soumettre votre demande, merci de vérifier d'abord via le bouton 
                      <button type="button" className="btn btn-sm custom-btn-success ms-1" name="suivre-demande" onClick={handleDemandeGuestSuivre}>
                        <i className="fa fa-eye me-1" aria-hidden="true"></i>Suivre ma demande
                      </button>
	              {/* <div className="">Au cas échéant, merci de renseigner le formulaire disponible au lien <a href="https://cloud.uv.bf/index.php/apps/forms/s/rHqCXrzFKntwPf3nwewgfwqJ">m'aider à soumettre !</a></div> */} 
                  </div>
                </div>

                {/* Alerts */}
                {alert && (
                  <div
                    className="card mb-1"
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
                {/* Submit */}
                <div className="card">
                  <div className="card-header py-1 d-flex justify-content-center align-content-center">
                    <div className="card-header-custom-title align-content-center">
                      <i className="fa fa-edit me-1" aria-hidden="true"></i>Soumettre ma demande
                    </div>
                    <button
                      type="button"
                      className="btn ms-auto custom-btn-secondary"
                      onClick={handleHome}
                    >
                      <i className="fa fa-home me-1" aria-hidden="true"></i>Accueil
                    </button>
                  </div>
                  <div className="card-body py-1">
                    <CustomRequired tagP={true} />

                    {/* INE */}
                    <div className="my-2">
                      <label htmlFor="identifiant" className="form-label mb-0 fw-bolder">
                        INE
                        <CustomRequired />
                      </label>
                      <div className="">
                        <input
                          type="text"
                          className="form-control"
                          id="identifiant"
                          name="identifiant"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Site désiré pour la remise */}
                    <div className="my-2">
                      <label htmlFor="site" className="form-label mb-0 fw-bolder">
                        Site désiré pour la remise
                        <CustomRequired />
                      </label>
                      <div className="">
                        <select
                          className="form-select"
                          aria-label="Default select example"
                          id="site"
                          name="site"
                          required
 
                        >
                          <option value="">Sélectionner ici !</option>
                          {sites.map((site, index) => (
                            <option value={site.id} key={'site-item-' + index}>
                              {index + 1 + '. ' + site.sitlibelle}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/*  */}
                  </div>
                  <div className="card-footer py-1 d-flex align-content-center ">
                    <button ref={btnResetRef} type="reset" className="btn d-none" name="btn-reset">
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn custom-btn-success ms-auto"
                      name="btn-submit"
                    >
                      <i className="fa fa-paper-plane me-1" aria-hidden="true"></i>Soumettre
                    </button>
                  </div>
                </div>
                {/*  */}
              </form>
            ) : (
              <div className="card">
                <div className="card-header py-1 d-flex justify-content-center align-content-center">
                  <div className="card-header-custom-title align-content-center">
                    <i className="fa fa-edit me-1" aria-hidden="true"></i>Soumettre ma demande
                  </div>
                  <button
                    type="button"
                    className="btn ms-auto custom-btn-secondary"
                    onClick={handleHome}
                  >
                    <i className="fa fa-home me-1" aria-hidden="true"></i>Page d'accueil
                  </button>
                </div>
                <div className="card-body text-center sorryBecauseNone">
                  <i className="fa fa-exclamation-triangle me-3" aria-hidden="true"></i>Désolé,
                  aucune de session de demande en cours !
                </div>
              </div>
            )}
          </div>
        </div>
        {/*  */}	

      </div>
    </div>
  )
}

export default DemandeGuestSoumettre
