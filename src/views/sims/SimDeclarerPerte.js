import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppGuestHeader, AppGuestFooter } from '../../components'
import { CustomRequired } from '../../components/CustomRequired'
import { CustomIndexAlert } from '../../components/CustomIndexAlert'
import { guestGetItemBy, guestUpdateItem } from '../../apiService'
import $ from 'jquery'
import { colors } from '../../constants'

const SimDeclarerPerte = () => {
  const navigate = useNavigate()
  const formRef = useRef()
  const [demandes, setDemandes] = useState([])
  const [alert, setAlert] = useState(null)

  // Redirection vers la page d'accueil
  const handleHome = (e) => {
    navigate('/', { replace: true })
  }

  // Search & Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    const submitterName = e.nativeEvent.submitter.name
    const submitterValue = e.nativeEvent.submitter.value
    // Récupération des données du formulaire
    const formData = new FormData(formRef.current)
    const formValues = Object.fromEntries(formData)
    // Search
    if (submitterName === 'btn-search') {
      const response = await guestGetItemBy('demandes/simdeclarerperte', formValues)
      if (response.status === 200) {
        const dmds = response.data ? response.data : []
        const items = []
        dmds.map((dmd) => {
          let d = dmd.dmddate !== null ? new Date(dmd.dmddate) : ''
          items.push({
            code: dmd.id,
            date: d.toLocaleString(),
            sim: dmd.simnumero,
          })
        })
        setDemandes(items)
      }
      if (response.status === 201) {
        setDemandes([])
      }
      setAlert(response)
    }
    // Submit
    if (submitterName === 'btn-submit') {
      formValues.sim = submitterValue
      const response = await guestUpdateItem('simdeclarerperte/:id'.replace(':id', submitterValue), formValues)
      // Succès
      if (response.success) {
        //setDemandes([])
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
            {/* Search & Submit form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              method="POST"
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
              <div className="card mb-2" style={{ backgroundColor:"#970000", color:"#fff", border:"5px solid #970000" }}>
                <div className="card-body d-flex fw-bold py-1 justify-content-center align-items-center">
                  <i className="fa fa-exclamation-triangle me-1"></i>Fonctionnalité en maintenance !
                </div>
              </div>
              <div className="card">
                <div className="card-header py-1 d-flex justify-content-center align-content-center">
                  <div className="card-header-custom-title align-content-center">
                    <i className="fa fa-question-circle me-1" aria-hidden="true"></i>Déclarer une
                    perte
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
                  {/* Code */}
                  <div className="my-2">
                    <label htmlFor="code" className="form-label mb-0 fw-bolder">
                      Identifiant (INE) ou Code de la demande
                      <CustomRequired />
                    </label>
                    <div className="d-flex">
                      <div className=" flex-grow-1">
                        <input
                          type="text"
                          className="form-control"
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
                <div className="card mt-2 show-declare-result-card">
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
                                <div className="show-follow-value ms-auto">{demande.code}</div>
                              </div>
                              {/* Date */}
                              <div className="d-flex border-bottom">
                                <div className="show-follow-title">Date de la demande</div>
                                <div className="show-follow-value ms-auto">{demande.date}</div>
                              </div>
                              {/* Numéro d'abonné */}
                              <div className="d-flex">
                                <div className="show-follow-title">Numéro d'abonné</div>
                                <div className="show-follow-value ms-auto">{demande.sim}</div>
                              </div>
                              {/*  */}
                            </div>
                            <div className="card-footer py-1 text-end">
                              <button
                                type="submit"
                                className="btn custom-btn-success"
                                name="btn-submit"
                                value={demande.simid}
				disabled
                              >
                                <i className="fa fa-paper-plane me-1" aria-hidden="true"></i>
                                Soumettre
                              </button>
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
            {/*  */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimDeclarerPerte
