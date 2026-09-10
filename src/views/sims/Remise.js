import React, { useEffect, useState, useRef } from 'react'
// Datatables
import 'jquery'
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'
import 'datatables.net-select'
import 'datatables.net-buttons'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5.mjs'
import 'pdfmake'
import 'pdfmake/build/vfs_fonts'
import JSZip from 'jszip' // Required for .xlxs
DataTable.Buttons.jszip(JSZip)
import language from 'datatables.net-plugins/i18n/fr-FR.json'
import 'datatables.net-bs5/css/dataTables.bootstrap5.css'; // Import CSS
//
import { getData, updateItem } from '../../apiService'
import { CustomIndexAlert } from '../../components/CustomIndexAlert'

const Remise = ({ auth }) => {
  const tableRef = useRef()
  const tableDemandeRef = useRef()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [indexAlert, setIndexAlert] = useState(null)
  const [sims, setSims] = useState([])
  const [demandes, setDemandes] = useState([])

  const columns = [
    { title: '#', data: 'select' }, 
    { title: 'N°', data: 'id' },
    { title: 'NUMERO', data: 'simnumero' },
    { title: 'IMSI', data: 'simcode' },
  ]

  // Demandes et Répondant
  const demandesColumns = [
    //{ title: 'ID', data: 'id' },
    { title: 'CODE DEMANDE', data: 'id' },
    {
      title: 'DATE DEMANDE',
      data: null,
      render: (data, type, row) => {
        return row.dmddate !== null ? new Date(row.dmddate).toLocaleDateString() : ''
      },
    },
    { title: 'REPONDANT', data: 'repidentifiant' },
    { title: 'SITE', data: 'sitlibelle' },
    { title: 'IMSI SIM', data:'simcode'},
    { title: 'NUMERO SIM', data:'simnumero'},
    {
      title: 'DATE REMISE', 
      data: null, 
      render: (data, type, row) => {
	return row.dmddateremiseeffective !== null ? new Date(row.dmddateremiseeffective).toLocaleDateString() : ''
      },
    }, 
    {
      title: 'CHARGE REMISE', 
      data: null, 
      render: (data, type, row) => {
        let r = ''
        let alias = ''
        if (row.username !== null) {
          r = row.username
          alias = r.substr(0, 1) 
        }
        if (row.userlastname !== null) {
          r += ' ' + row.userlastname
          let userLastname = row.userlastname.split(' ')
          userLastname.forEach((element) => {
            alias += element.substr(0, 1)
          })
        }
	return alias 
      }, 
    },
    {
      title: 'ACTIONS',
      data: null,
      render: (data, type, row) => {
        if (row.username === null) {
            return `<a class="btn btn-outline-primary py-1 tableActionBtn tableActionBtnRemiseItem d-flex justify-content-center align-items-center disabled" data-id="${row.id}" title="Remettre la carte SIM"><i class="fa fa-paper-plane me-1" aria-hidden="true" aria-disabled="true" tabindex="-1"></i>Remettre</a>`; 
        } else {
	    // Get current date and extract the YYYY-MM-DD portion
    	    let today = new Date(); 
            let remiseDate = row.dmddateremiseeffective; 
	    //if (remiseDate !== null) {
	    //	return new Date(remiseDate) < today ? '' : `<a class="btn btn-danger py-1 tableActionBtn tableActionBtnDissocierItem d-flex justify-content-center align-items-center" data-id="${row.id}"data-simid="${row.id}" title="Dissocier la carte SIM"><i class="fa fa-close me-1" aria-hidden="true"></i>Dissocier</a>`;
	    //}
	    //return ''; 
            return `<a class="btn btn-danger py-1 tableActionBtn tableActionBtnDissocierItem d-flex justify-content-center align-items-center disabled" data-id="${row.id}" data-simid="${row.simid}" title="Dissocier la carte SIM"><i class="fa fa-close me-1" aria-hidden="true"></i>Dissocier</a>`; 
	}
      },
    },
  ]

  const fetchGet = async () => {
    const id = auth.region !== null ? auth.region.id : 0
    try {
      const data = await getData('simsremises/:region'.replace(':region', id))
      if (data.length > 0) {
        if (auth.region !== null) {
          const r = data.filter((item) => item.region_id === auth.region.id)
          setData(r)
        } else {
          setData(data)
        }
      }
    } catch (err) {
      console.log(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGetRepondant = async () => {
    const id = auth.region !== null ? auth.region.id : 0
    const response = await getData('demandesremises/:region'.replace(':region', id))
    if (response) {
      setDemandes(response)
    }
  }

  useEffect(() => {
    // let timerId = setInterval(() => {
    fetchGet()
    fetchGetRepondant()
    // }, delay)
    // return () => {
    //   clearInterval(timerId)
    // }
  }, [])

  // === Tableau des cartes sim attribuées à la région
  useEffect(() => {
    if (tableRef.current) {
      $(tableRef.current).DataTable({
        data: data,
        columns: columns,
        responsive: true,
        destroy: true,
	scroller: true, 
        scrollCollapse: true,
        paging: true,
	pageLength: 3, 
	lengthMenu: [3],
	fixedHeader: true, 
        info: true,
        autoWidth: true,
        language,
        columnDefs: [
	  { 
	    orderable: false, 
            className: 'select-checkbox', 
	    targets: 0, 
	    data: null, 
	    render: DataTable.render.select(), 
	  } 
	],
        select: {
	  style: 'os',
	  headerCheckbox: false,
        },
      })
    }
  }, [data, columns])
    
  // === Tableau des demandes et répondants associés
  useEffect(() => {
    if (tableDemandeRef.current) {
      $(tableDemandeRef.current).DataTable({
        data: demandes,
        columns: demandesColumns,
        responsive: true,
        destroy: true,
        scroller: true,
        scrollCollapse: true,
        paging: true,
	pageLength: 3,
 	lengthMenu: [3], 
	fixedHeader: true, 
        info: true,
        autoWidth: true,
        language,
        columnDefs: [{ targets: '_all', orderable: false }],
        select: false,
      })
    }
  }, [demandes, demandesColumns])

  // === Actions : Remettre, Remise
  // === Datatable select deselect
  $('#myTable')
    .DataTable()
    // .off('select deselect')
    .on('select deselect', function (e, dt, type, indexes) {
      var selectedRowCount = dt.rows({ selected: true }).count()
      var inputSimid = $('#simid')
      var btnRemise = $('.tableActionBtnRemiseItem')
      if (selectedRowCount === 1) {
        const selectedRowData = dt.rows({ selected: true }).data()[0]
        inputSimid.val(selectedRowData.id)
        btnRemise.removeClass('disabled')
      } else {
        inputSimid.val('')
        btnRemise.addClass('disabled')
      }
      setIndexAlert(null)
    })
  
  // Remettre carte sim
  $('#myTableDemande tbody').on('click', '.tableActionBtnRemiseItem', async function (e) {
    e.preventDefault()
    const simid = $('#simid').val()
    const demandeid = $(this).data('id') 
    const userid = auth.id
    
    if (parseInt(simid) > 0 && parseInt(demandeid) > 0) {
      await updateItem('sims/remise/associer/:sim'.replace(':sim', simid), {demandeid:demandeid, userid:userid})
        .then((response) => {
          if (response.status !== 500) {
            if (response.success) {
              setIndexAlert(response)
              $('#inputSimid').val('')
              //fetchGet()
              //fetchGetRepondant()
            } else {
    	      setIndexAlert(response)
            }
         } else {
	   setIndexAlert({type: "warning", message: "Echec : une erreur est survenue. Merci de réessayer ultérieurement !"})
         }
         fetchGet()
         fetchGetRepondant()
       })
       .catch((err) => console.log(err))
    } else {
      setIndexAlert({type: "warning", message: "Merci de sélectionner la carte sim !" })
    }
  })

  // Dissocier carte sim
  $('#myTableDemande tbody').on('click', '.tableActionBtnDissocierItem', async function (e) {
    e.preventDefault()
    const demandeid = $(this).data('id')
    const simid = $(this).data('simid')
    const response = await updateItem('sims/remise/dissocier/:sim'.replace(':sim', simid), {demandeid:demandeid})
    if (response.success) {
	setIndexAlert(response)
        $('#inputSimid').val('')
        fetchGet()
        fetchGetRepondant()
    } else {
        setIndexAlert(response)
    }
    
    if (response.status === 500) {
	setIndexAlert({type: "warning", message: "Echec : une erreur est survenue. merci de réessayer ultérieurement !"})
    } 
  })

  // ===

  // Datatable loading...
  if (loading) {
    return (
      <div className="text-center">
        <div
          className="spinner-border me-2"
          style={{ width: '3rem', height: '3rem' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <div
          className="spinner-grow"
          style={{ width: '3rem', height: '3rem', color: '#2e9ed5' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 offset-md-0">
	  {/* <form ref={remiseFormRef} onSubmit={handleSubmitRemiseForm} method="POST" encType=""> */}
          {/* List */}
          <div className="">
              <CustomIndexAlert alert={indexAlert} />
          </div>
          <div className="table-responsive p-2">
            {/* Liste des cartes SIM */}
            <div className="card simremiseSimCard mt-3">
              <div className="card-header fw-bolder">
        	Liste des cartes SIM attribuées à la région 
              </div>
              <div className="card-body p-y1" style={{ height: 'auto', overflowY: 'auto' }}>
                <table
                  ref={tableRef}
                  id="myTable"
                  className="display table table-sm table-striped table-hover myDatatable"
                ></table>
              </div>
            </div>
            {/* Liste des demandes */}
            <div className="card mt-4 simremiseDemandeCard">
              <div className="card-header fw-bolder">
		Liste des répondants attributaires de la région
              </div>
              <div className="card-body py-1" style={{ height: 'auto', overflowY: 'auto' }}>
                <input type="hidden" id="simid" name="simid" />
                <table
                  ref={tableDemandeRef}
                  id="myTableDemande"
                  className="display table table-sm table-striped table-hover myDatatable"
                ></table>
              </div>
            </div>
            {/*  */}
          </div>
          {/*  */}
	  {/* </form> */}
        </div>
      </div>
    </div>
  )
}

export default Remise
