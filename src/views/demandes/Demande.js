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
import JSZip from 'jszip'  // Required for .xlxs 
DataTable.Buttons.jszip(JSZip)
import language from 'datatables.net-plugins/i18n/fr-FR.json'
//
import { getData, getItem, createItem, updateItem, deleteItem } from '../../apiService'
import { CustomRequired } from '../../components/CustomRequired'
import { CustomIndexAlert } from '../../components/CustomIndexAlert'
import { CustomCreateAlert } from '../../components/CustomCreateAlert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons'
import { colors, importAttributeColumnToImport } from '../../constants'
import * as XLSX from 'xlsx'
//import { isEmpty } from 'validator'
//

const Demande = ({ auth }) => {
  const tableRef = useRef()
  const unlinksimFormRef = useRef()
  const linksimtodemandeFormRef = useRef()
  const createFormRef = useRef()
  const deleteFormRef = useRef()
  const createFormBtnLaunchRef = useRef()
  const createFormBtnCloseRef = useRef()
  const createFormBtnResetRef = useRef()
  const showModalBtnLaunchRef = useRef()
  const deleteFormBtnLaunchRef = useRef()
  const deleteFormBtnCloseRef = useRef()
  const unlinksimFormBtnLaunchRef = useRef()
  const unlinksimFormBtnCloseRef = useRef()
  const linksimtodemandeFormBtnLaunchRef = useRef()
  const linksimtodemandeFormBtnCloseRef = useRef()
  // importAttribute
  const importAttributeFormRef = useRef()
  const importAttributeFormBtnLaunchRef = useRef()
  const importAttributeFormBtnResetRef = useRef()
  const importAttributeFormBtnCloseRef = useRef()
  // 
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [indexAlert, setIndexAlert] = useState(null)
  const [createAlert, setCreateAlert] = useState(null)
  const [linkAlert, setLinkAlert] = useState(null)
  const [createFormAction, setCreateFormAction] = useState(null)
  const [sessiondemandes, setSessiondemandes] = useState([])
  const [sites, setSites] = useState([])
  const [regions, setRegions] = useState([])
  const [typerepondants, setTyperepondants] = useState([])
  const [sims, setSims] = useState([])
  const exportConstants = { title: 'Liste des demandes', columns: [0, 1, 2, 3/*, 4, 5, 6*/] }
  const [importAttributeExcelData, setImportAttributeExcelData] = useState([])
  const [importAttributeColumns, setImportAttributeColumns] = useState([])

  const apiResource = {
    get: 'demandes',
    show: 'demandes/:id',
    create: 'demandes',
    update: 'demandes/:id',
    delete: 'demandes/:id',
  }

  const columns = [
    //{ title: 'ID', data: 'id' },
    { title: 'CODE DEMANDE', data: 'id' },
    { title: 'REPONDANT', data: 'repondant.repidentifiant' }, 
    { title: 'TYPE_REPONDANT', data: 'repondant.typerepondant.tyrlibelle' }, 
    { 
      title: 'DATE DEMANDE', 
      data: null, 
      render: (data, type, row) => {
        return row.dmddate !== null ? new Date(row.dmddate).toLocaleDateString() : ''; 
      }, 
    },
    {
      title: 'DATE REMISE', 
      data: null, 
      render: (data, type, row) => {
	return row.dmddateremiseeffective !== null ? new Date(row.dmddateremiseeffective).toLocaleDateString() : ''; 
      }, 
    },  
    { title: 'SESSION DEMANDE', data: 'sessiondemande_id' },
    { title: 'SESSION REMISE', data: 'sessionremise_id' },
    { title: 'SITE DESIRE', data: 'site.sitlibelle' },
    { title: 'SIM', data: 'sim.simnumero' }, 
    {
      title: 'ACTIONS',
      data: null,
      render: (data, type, row) => {
        // const btnLinkSimToProvince =
        //   pr.length > 0 && ns.length > 0
        //     ? `<a class="btn btn-outline-warning me-1 table-btn tableActionBtnLinkSimToProvinceItem" data-id="${row.id}" data-nbr="${ns.length}" data-prv="${pr.length}" title="Répartir les cartes SIM entre les provinces"><i class="fa fa-paper-plane" aria-hidden="true"></i></a>`
        //     : ''
        // const btnUnlinkSim =
        //   ns.length > 0
        //     ? `<a class="btn btn-outline-warning me-1 table-btn tableActionBtnUnlinkSimItem" data-id="${row.id}" data-nbr="${ns.length}" title="Dissocier les cartes SIM"><i class="fa fa-close" aria-hidden="true"></i></a>`
        //     : ''
        const btnLinkToDemande = `<a class="btn btn-outline-warning me-1 tableActionBtn tableActionBtnLinkSimToDemandeItem" data-id="${row.id}" title="Associer une carte SIM"><i class="fa fa-paper-plane" aria-hidden="true"></i></a>`
        const btnEdit = `<a class="btn btn-outline-info me-1 tableActionBtn tableActionBtnEditItem" data-id="${row.id}" title="Editer"><i class="fa fa-edit" aria-hidden="true"></i></a>`
        const btnDelete = `<a class="btn btn-outline-danger tableActionBtn tableActionBtnDeleteItem" data-id="${row.id}" title="Supprimer"><i class="fa fa-trash" aria-hidden="true"></i></a>`
        return auth.roles.includes('administrateur') ? `<div class="d-flex align-content-center justify-content-center">${btnLinkToDemande + btnEdit + btnDelete}</div>` : ""
      },
    },
  ]

  const fetchGet = async () => {
    try {
      const data = await getData(apiResource.get)
      const r = auth.roles.includes('administrateur')
        ? data
        : auth.region !== null
          ? data.filter(
              (item) => item.region_id === auth.region.id,
            )
          : data
      setData(r)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGetTyperepondant = async () => {
    const response = await getData('typerepondants')
    if (response) {
      setTyperepondants(response)
    }
  } 
 
  const fetchGetSessiondemande = async () => {
    const response = await getData('sessiondemandes')
    if (response) {
      setSessiondemandes(response)
    }
  }

  const fetchGetRegion = async () => {
    const response = await getItem('regions_getactive')
    if (response) {
        const r = response.data
        const rgn = auth.roles.includes('administrateur') ? r : auth.region !== null ? r.filter((item) => item.id === auth.region) : r
        // Sim et Sites de la région
        const sims_ = []
	const sites_ = []
        rgn.map((item, index) => {
	  // SIM
          if (item.sims) {
            let m = item.sims.filter((sim) => sim.demande_id === null)
            if (m.length > 0) {
              sims_.push(m)
            }
          }
	  // Sites
	  if (item.provinces) {
	   let prvs = item.provinces
	   if (prvs.length > 0) {
	    prvs.map((item) => {
	     if (item.sites.length > 0) {
	       for (var i = 0 ; i < item.sites.length ; i++) {
		sites_.push(item.sites[i])
	       }
	     }
	    })
	   }
	  }
	  //
        })
        setSims(sims_)
	setSites(sites_)
      }
  }

  useEffect(() => {
    // let timerId = setInterval(() => {
    fetchGet()
    //fetchGetTyperepondant() 
    //fetchGetSessiondemande()
    //fetchGetRegion()
    // }, 2000)
    // return () => {
    //   clearInterval(timerId)
    // }
  }, [])
 
  useEffect(() => {
    fetchGetTyperepondant()
  }, [])

  useEffect(() => {
    fetchGetSessiondemande()
  }, [])

  useEffect(() => {
    fetchGetRegion()
  }, [])

  useEffect(() => {
    //=== Retrieve saved page from localStorage
    const savedPage = localStorage.getItem('cartesimDatatableCurrentPage')
    const initialPage = savedPage ? parseInt(savedPage, 10) : 0 // Default to page 0
    //===

    //if (tableRef.current) {
      const dataTableInstance = $(tableRef.current).DataTable({
        data: data,
        columns: columns,
        responsive: true,
        destroy: true,
        fixedHeader: true,
        scrollCollapse: true,
        scroller: true,
        // scrollY: 800,
        paging: true,
        info: true,
        autoWidth: true,
        language,
        columnDefs: [{ targets: '_all', orderable: false }],
        select: false,
        layout: {
          top1Start: {
            buttons: [
              {
                text: '<i class="fa fa-plus me-1" aria-hidden="true"></i>Ajouter',
                className: 'dt-btn datatable-button rounded dt-btnCreate btnCreate',
                enabled: auth.roles.includes('administrateur') ? true : false,
                action: () => {
                  if (createFormRef.current && createFormBtnLaunchRef.current) {
                    setCreateAlert(null)
                    setCreateFormAction('create')
                    createFormRef.current.setAttribute('create-data-action', 'create')
                    createFormRef.current.setAttribute('create-data-id', '')
                    createFormBtnLaunchRef.current.click()
                  }
                },
              },
              /*{
                text: '<i class="fa fa-trash me-1" aria-hidden="true"></i>Tout supprimer',
                className: 'dt-btn datatable-button rounded dt-btnCreate btnDeleteAll ms-2',
                //enabled: data.length > 0 ? true : false,
                enabled: false, 
                action: () => {
                  if (deleteFormRef.current && deleteFormBtnLaunchRef.current) {
                    setIndexAlert(null)
                    $('#deleteQuestion').text(
                      'Voulez-vous vraiment supprimer tous les enregistrements (' +
                        data.length +
                        ') ?',
                    )
                    deleteFormRef.current.setAttribute('delete-data-action', 'delete')
                    deleteFormRef.current.setAttribute('delete-data-id', 'all')
                    deleteFormBtnLaunchRef.current.click()
                  }
                },
              },*/
	      /*{
                text: '<i class="fa fa-paper-plane me-1" aria-hidden="true"></i>Importer attributions',
                className: 'dt-btn datatable-button rounded dt-btnAttribute btnAttribute ms-2',
                // enabled: regions && sims && regions.length > 0 && sims.length > 0 ? true : false, 
 		enabled: auth.roles.includes('administrateur') !== null ? true : false,
                action: () => {
                  if (importAttributeFormRef.current && importAttributeFormBtnLaunchRef.current) {
                    //   setCreateFormAction('create')
                    // setAttribute('multiple')
                    // const d = demandes && demandes.length + ' demande(s) à satisfaire avec '
                    // const s = sims && sims.length + ' carte(s) SIM !'
                    // $('#attributeFormHeader').text(d + s)
                    importAttributeFormBtnLaunchRef.current.click()
                  }
                },
              },*/
            ],
          },
          top1End: {
            buttons: [
              {
                extend: 'csv',
                text: '<i class="fa fa-file-text" aria-hidden="true"></i>',
                titleAttr: 'CSV',
                className: 'dt-btn datatable-export-button rounded',
                enabled: data && data.length > 0 ? true : false,
                filename: exportConstants.title,
                exportOptions: {
                  columns: exportConstants.columns,
                },
              },
              {
                extend: 'excel',
                text: '<i class="fa fa-file-excel" aria-hidden="true"></i>',
                titleAttr: 'Excel',
                className: 'datatable-export-button rounded ms-1',
                enabled: data && data.length > 0 ? true : false,
                filename: exportConstants.title,
                exportOptions: {
                  columns: exportConstants.columns,
                },
              },
              {
                extend: 'pdf',
                text: '<i class="fa fa-file-pdf" aria-hidden="true"></i>',
                titleAttr: 'PDF',
                className: 'dt-btn datatable-export-button ms-1 rounded',
                enabled: data && data.length > 0 ? true : false,
                filename: exportConstants.title,
                download: 'open',
                exportOptions: {
                  columns: exportConstants.columns,
                  modifier: {
                    page: 'current',
                  },
                },
              },
              /*{
                extend: 'print',
                text: '<i class="fa fa-print" aria-hidden="true"></i>',
                titleAttr: 'Imprimer',
                className: 'dt-btn datatable-export-button mx-1 rounded',
                enabled: data && data.length > 0 ? true : false,
                filename: exportConstants.title,
                exportOptions: {
                  columns: exportConstants.columns,
                  modifier: {
                    page: 'current',
                  },
                },
              },*/
            ],
          },
        },
      })

      //=== Add an event listener to capture page changes
    // You can bind an event listener to 'draw.dt' to detect page changes
    $(tableRef.current).on('page.dt', function () {
      const currentPage = dataTableInstance.page()
      //console.log('Current Page Index:', currentPage)
      // Example of saving the page index to local storage (optional)
      localStorage.setItem('cartesimDatatableCurrentPage', currentPage.toString())
    })
    dataTableInstance.page(initialPage).draw(false)
    // Cleanup function to destroy table instance and remove event listener
    return () => {
      dataTableInstance.destroy()
      $(tableRef.current).off('page.dt')
    }
    //===
    //}

    // === DATATABLE ACTIONS : create, show, edit, delete
    $('#myTable')
      .DataTable()
      // .off("select deselect")
      .on('select deselect', function (e, dt, type, indexes) {
        var selectedRowsCount = dt.rows({ selected: true }).count()
        dt.buttons(['.btnCreate']).enable(selectedRowsCount === 0)
        dt.buttons(['.btnShow']).enable(selectedRowsCount === 1)
        dt.buttons(['.btnEdit']).enable(selectedRowsCount === 1)
        dt.button(['.btnDelete']).enable(selectedRowsCount > 0)
      })
  }, [data, columns])

  // Actions

  // === Link sim to region provinces
  $('#myTable tbody').on('click', '.tableActionBtnLinkSimToDemandeItem', async function (e) {
    e.preventDefault()
    setIndexAlert(null)
    setCreateAlert(null)
    const id = $(this).data('id')
    if (linksimtodemandeFormRef.current && linksimtodemandeFormBtnLaunchRef.current) {
      linksimtodemandeFormRef.current.setAttribute('data-iddemande', id)
      linksimtodemandeFormBtnLaunchRef.current.click()
    }
    /*await getItem(apiResource.show.replace(':id', id)).then((response) => {
      if (response.success) {
        setRegionProvinces(response.data.provinces)
        setRegionSims(response.data.sims.filter((item) => item.province_id === null))
        setSims(response.data.sims.filter((item) => item.province_id === null))
        if (linksimtoprovinceFormRef.current && linksimtoprovinceFormBtnLaunchRef.current) {
          linksimtoprovinceFormRef.current.setAttribute('data-id', id)
          linksimtoprovinceFormRef.current.setAttribute('data-nbr', nbr)
          linksimtoprovinceFormRef.current.setAttribute('data-prv', prv)
          linksimtoprovinceFormBtnLaunchRef.current.click()
        }
      } else {
        setIndexAlert(response)
      }
    })*/
  })

  // === Show item
  $('#myTable tbody').on('click', '.tableActionBtnShowItem', async function (e) {
    e.preventDefault()
    // const id = $(this).data('id')
    // const response = await getItem(apiResource.show.replace(':id', id))
  })
  //

  // === Edit item
  $('#myTable tbody').on('click', '.tableActionBtnEditItem', async function (e) {
    e.preventDefault()
    setIndexAlert(null)
    setCreateAlert(null)
    const id = $(this).data('id')
    const response = await getItem(apiResource.show.replace(':id', id))
    //
    if (response.success) {
      	const r = response.data 
      	$('#sessiondemande').val(r.sessiondemande_id)
      	$('#site').val(r.site_id)
      	$('#identifiant').val(r.repondant && r.repondant.repidentifiant)
     	$('#date').val(r.dmddate)
	$('#commentaire').val(r.dmdcommentaire)
        setCreateFormAction('edit')
	if (createFormRef.current && createFormBtnLaunchRef.current) {
          createFormRef.current.setAttribute('create-data-action', 'edit')
          createFormRef.current.setAttribute('create-data-id', id)
          createFormBtnLaunchRef.current.click()
        } else {
	  //
	}
     } else {
	//
     }
  })
  //
  const handleCancelCreateForm = () => {
    if (createFormRef.current && createFormBtnCloseRef.current) {
      createFormRef.current.setAttribute('create-data-action', 'create')
      createFormRef.current.setAttribute('create-data-id', '')
      createFormBtnResetRef.current.click()
      createFormBtnCloseRef.current.click()
    }
  }
  //
  const handleSubmitCreateForm = async (e) => {
    e.preventDefault()
    // récupération des données du formulaire
    const action = e.target.getAttribute('create-data-action')
    const id = e.target.getAttribute('create-data-id')
    if (createFormRef.current && createFormBtnCloseRef.current) {
      const formData = new FormData(createFormRef.current)
      const formValues = Object.fromEntries(formData)
      if (action === 'create') {
        const response = await createItem(apiResource.create, formValues)
	console.log('success:'+response.success+'|status'+response.status)
         if (response.success) {
            createFormBtnResetRef.current.click()
	    setCreateAlert(response)
         }
	 if (response.status === 500) {
            setCreateAlert({type: "warning", message:"Echec: une erreur est survenue. Merci de réessayer ultérieurement !"})
         }
      }
      if (action === 'edit') {
        const response = await updateItem(apiResource.update.replace(':id', id), formValues)
        if (response.success) {
            setIndexAlert(response)
            createFormBtnResetRef.current.click()
            createFormBtnCloseRef.current.click()
        } else {
            setCreateAlert(response)
        }
        if (response.status === 500) {
	   setCreateAlert({type: "warning", message: "Echec: une erreur est survenue. Merci de réessayer ultérieurement !"})
        }
      }
    }
    fetchGet()
  }
  // ===

  // === Delete item
  $('#myTable tbody').on('click', '.tableActionBtnDeleteItem', async function (e) {
    e.preventDefault()
    setIndexAlert(null)
    setCreateAlert(null)
    const id = $(this).data('id')
    const response = await getItem(apiResource.show.replace(':id', id))
    if (response.success) {
      if (deleteFormRef.current && deleteFormBtnLaunchRef.current) {
          deleteFormRef.current.setAttribute('delete-data-action', 'delete')
          deleteFormRef.current.setAttribute('delete-data-id', id)
          deleteFormBtnLaunchRef.current.click()
      }
    } else {
	setIndexAlert(response)
    }
    if (response.status === 500) {
	setIndexAlert({type: "warning", message: "Echec: une erreur est survenue. Merci de réessayer ultérieurement !"})
    }
  })
  //
  const handleCancelDeleteForm = () => {
    if (deleteFormRef.current && deleteFormBtnCloseRef.current) {
      deleteFormRef.current.setAttribute('delete-data-action', 'delete')
      deleteFormRef.current.setAttribute('delete-data-id', '')
      deleteFormBtnCloseRef.current.click()
    }
  }
  //
  const handleSubmitDeleteForm = async (e) => {
    e.preventDefault()
    if (deleteFormRef.current && deleteFormBtnCloseRef.current) {
      const action = deleteFormRef.current.getAttribute('delete-data-action')
      const id = deleteFormRef.current.getAttribute('delete-data-id')
      if (action === 'delete') {
        await deleteItem(apiResource.delete.replace(':id', id)).then((response) => {
          if (response.success) {
            deleteFormBtnCloseRef.current.click()
          }
          setIndexAlert(response)
        })
      }
    }
    fetchGet()
  }
  //

  // === Link sims to region provinces

  const handleCancelLinksimtodemandeForm = () => {
    setIndexAlert(null)
    setCreateAlert(null)
    setLinkAlert(null)
  }

  const handleSubmitLinksimtodemandeForm = async (e) => {
    e.preventDefault()
    // récupération des données du formulaire
    const iddemande = e.target.getAttribute('data-iddemande')
    const idsim = e.target.getAttribute('data-idsim')
    if (linksimtodemandeFormRef.current && linksimtodemandeFormBtnCloseRef.current) {
      /*await createItem('sims/demandes/associer', data).then((response) => {
        if (response.success) {
          // linksimtoprovinceFormBtnCloseRef.current.click()
        }
        setLinkAlert(response)
      })*/
    }
    fetchGet()
  }

  // ===

 // === File upload
  const handleImportAttributeFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // console.log(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target.result
        // Parse the binary data   // 65001 is the codepage for UTF-8
        const workbook = XLSX.read(data, { type: 'binary', codepage: 65001 })
        // Get the first worksheet name
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        // Convert the worksheet to an array of JSON objects
        const jsonOptions = { header: 1 } // Use 'header: 1' if the first row is data, omit for object keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet, jsonOptions)

        if (jsonData.length > 0) {
          // Obtenir les index concernés.
          let columns = []
          let i = 0
          jsonData[0].map((item, index) => {
            if (importAttributeColumnToImport.includes(item.toLowerCase())) {
              columns.push({ key: index, name: item, value: i })
              i++
            }
          })
          setImportAttributeColumns(columns)
          // Filtrer la liste suivant les index concernés
          const filterData = []
          const columnsKeys = columns.map((item) => item.key)
          if (columns.length > 0) {
            jsonData.map((item) => {
              if (item.length > 0) {
                filterData.push(item.filter((_, index) => columnsKeys.includes(index)))
              }
            })
            setIndexAlert(null)
            setCreateAlert(null)
            setImportAttributeExcelData(filterData)
          } else {
            // Aucune colonne correspondante dans la liste
            setImportAttributeExcelData([])
            setCreateAlert({
              type: 'warning',
              message: 'Aucune colonne correspondante dans la liste !',
            })
          }
        }
      }
      // Read the file as binary string
      reader.readAsBinaryString(file)
    }
  }

  // === Import attribution of SIM card
  const handleCancelImportAttributeForm = () => {
    if (importAttributeFormRef.current && importAttributeFormBtnCloseRef.current) {
      importAttributeFormRef.current.setAttribute('form-action', '')
      importAttributeFormRef.current.setAttribute('target-id', '')
      setCreateAlert(null)
      setIndexAlert(null)
      setImportAttributeExcelData([])
      setImportAttributeColumns([])
      importAttributeFormBtnResetRef.current.click()
      importAttributeFormBtnCloseRef.current.click()
    }
  }

  const handleSubmitImportAttributeForm = async (e) => {
    e.preventDefault()
    // récupération des données de la liste
    if (importAttributeFormRef.current && importAttributeFormBtnCloseRef.current) {
      const formData = new FormData(importAttributeFormRef.current)
      const formValues = Object.fromEntries(formData)
      const data = importAttributeExcelData.filter((_, index) => index > 0)
      const response = await createItem('demandes/importerattributions/sims', {
        columns: importAttributeColumns,
        imports: data,
        typerepondant: formValues.typerepondant,
      })
      if (response.success) {
      	setCreateAlert(response)
      }
      if (response.status === 500) {
        setCreateAlert({type:"warning", message:"Echec: une erreur est survenue !"})
      }
      //setCreateAlert(response)
      fetchGet()
    }
  }

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
    <div className="container">
      <div className="row">
        <div className="col-md-12 offset-md-0">
          {/* Alerts */}
          {indexAlert && (
            <div
              className="card mb-2"
              style={{
                backgroundColor: colors[indexAlert.type],
                borderColor: colors[indexAlert.type],
              }}
            >
              <div className="card-body py-1">
                <CustomIndexAlert alert={indexAlert} />
              </div>
            </div>
          )}
          {/*  */}
          {/* List */}
          <div className="table-responsive p-2">
            <table
              ref={tableRef}
              id="myTable"
              className="display table table-sm table-striped table-hover myDatatable"
            ></table>
          </div>
          {/*  */}
          {/* Create/Edit form */}
          <form
            ref={createFormRef}
            onSubmit={handleSubmitCreateForm}
            method="POST"
            encType="multipart/form-data"
            create-data-action="create"
            create-data-id=""
          >
            <button
              ref={createFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#createModal"
            >
              <i className="fa fa-plus me-2" aria-hidden="true"></i>Launch demo static modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="createModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="createModal"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title  fw-bold text-light" id="createModalLabel">
                      {createFormAction && (
                        <FontAwesomeIcon
                          icon={createFormAction === 'create' ? faPlus : faEdit}
                          className=""
                        />
                      )}
                      {createFormAction === 'create' ? 'Ajouter' : 'Editer'}
                    </h5>
                    <button
                      ref={createFormBtnCloseRef}
                      type="button"
                      className="btn-close d-none"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Alerts */}
                    {createAlert && (
                      <div
                        className="card mb-2"
                        style={{
                          backgroundColor: colors[createAlert.type],
                          borderColor: colors[createAlert.type],
                        }}
                      >
                        <div className="card-body py-1">
                          <CustomCreateAlert alert={createAlert} />
                        </div>
                      </div>
                    )}
                    {/* Required */}
                    <div className="d-flex pb-1">
                      <CustomRequired tagP={true} />
                    </div>
                    {/*  */}
                    <div className="card">
                      <div className="card-body">
                        {/* Sessions de demande */}
                        <div className="mb-2">
                          <label htmlFor="sessiondemande" className="form-label mb-0">
                            Session de demande
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="sessiondemande"
                              name="sessiondemande"
                            >
                              <option value="">Sélectionner ici !</option>
                              {sessiondemandes.map((sessiondemande, index) => (
                                <option
                                  value={sessiondemande.id}
                                  key={'sessiondemande-item-' + index}
                                >
                                  {sessiondemande.id +
                                    '. ' +
                                    sessiondemande.seddatedebut +
                                    ' au ' +
                                    sessiondemande.seddatefin}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Site */}
                        <div className="mb-2">
                          <label htmlFor="site" className="form-label mb-0">
                            Site désiré pour la remise
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="site"
                              name="site"
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
                        {/* Identifiant & Date */}
                        <div className="row mb-2">
                          {/* Identifiant */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="identifiant" className="form-label mb-0">
                              Identifiant
                              <CustomRequired />
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="identifiant"
                                name="identifiant"
                                required
                              />
                            </div>
                          </div>
                          {/* Date */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="date" className="form-label mb-0">
                              Date
                            </label>
                            <div className="">
                              <input
                                type="date"
                                className="form-control"
                                id="date"
                                name="date"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Commentaire */}
                        <div className="mb-2">
                          <label htmlFor="commentaire" className="form-label mb-0">
                            Commentaire
                          </label>
                          <div className="">
                            <textarea
                              className="form-control"
                              rows={2}
                              id="commentaire"
                              name="commentaire"
                            ></textarea>
                          </div>
                        </div>
                        {/*  */}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 py-0">
                    <button type="submit" className="btn custom-btn-success createModalBtnSave">
                      <i className="fa fa-check me-1" aria-hidden="true"></i>
                      Valider
                    </button>
                    <button
                      type="button"
                      className="btn custom-btn-secondary createModalBtnCancel"
                      data-bs-dismiss="modal"
                      onClick={handleCancelCreateForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>Annuler
                    </button>
                    <button ref={createFormBtnResetRef} type="reset" className="btn d-none">
                      <i className="fa fa-refresh me-1" aria-hidden="true"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/*  */}
          {/* Delete form */}
          <form
            ref={deleteFormRef}
            onSubmit={handleSubmitDeleteForm}
            method="POST"
            encType=""
            create-data-action="delete"
            create-data-id=""
          >
            <button
              ref={deleteFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#deleteModal"
            >
              <i className="fa fa-trash me-2" aria-hidden="true"></i>Launch static backdrop modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="deleteModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="deleteModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title fw-bold text-light" id="deleteModalLabel">
                      <i className="fa fa-trash me-1" aria-hidden="true"></i>Supprimer
                    </h5>
                    <button
                      ref={deleteFormBtnCloseRef}
                      type="button"
                      className="btn-close d-none"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body text-center">
                    <i
                      className="fa fa-exclamation-triangle me-1 text-danger fw-bolder"
                      aria-hidden="true"
                    ></i>
                    <span id="deleteQuestion">
                      Voulez-vous vraiment supprimer cet enregistrement ?
                    </span>
                  </div>
                  <div className="modal-footer border-0 py-1">
                    <button
                      type="button"
                      className="btn custom-btn-secondary btn-submit"
                      data-bs-dismiss="modal"
                      onClick={handleCancelDeleteForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>
                      Annuler
                    </button>
                    <button type="submit" className="btn custom-btn-danger">
                      <i className="fa fa-trash me-1" aria-hidden="true"></i>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/* Link SIM to province form */}
          <form
            ref={linksimtodemandeFormRef}
            onSubmit={handleSubmitLinksimtodemandeForm}
            method="POST"
            encType=""
            data-iddemande=""
            data-idsim=""
          >
            <button
              ref={linksimtodemandeFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#linksimtodemandeModal"
            >
              <i className="fa fa-trash me-2" aria-hidden="true"></i>Launch static backdrop modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="linksimtodemandeModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="linksimtodemandeModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title fw-bold text-light" id="linksimtodemandeModalLabel">
                      <i className="fa fa-paper-plane me-1" aria-hidden="true"></i>Associer à la
                      demande
                    </h5>
                    <button
                      ref={linksimtodemandeFormBtnCloseRef}
                      type="button"
                      className="btn-close d-none"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body pb-0">
                    {/* Total */}
                    <div
                      className="card mb-2"
                      style={{ backgroundColor: '#056709', borderColor: '#056709' }}
                    >
                      <div className="card-body py-1 text-light text-center">
                        {'Associer une des ' + sims.length + ' carte(s) sim à la demande'}
                      </div>
                    </div>
                    {/*  */}
                    {/* Alerts */}
                    {linkAlert && (
                      <div
                        className="card mb-2"
                        style={{
                          backgroundColor: colors[linkAlert.type],
                          borderColor: colors[linkAlert.type],
                        }}
                      >
                        <div className="card-body py-1">
                          <CustomCreateAlert alert={linkAlert} />
                        </div>
                      </div>
                    )}
                    {/*  */}
                    {/* List of sim cards */}
                    <div className="table-responsive table-responsive-sm">
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr className="text-start">
                            <td scope="col">ID</td>
                            <td scope="col">NUMERO</td>
                            <td scope="col">CODE</td>
                          </tr>
                        </thead>
                        <tbody>
                          {sims.map((sim, index) => (
                            <tr key={'sim-item-' + index} className="text-start">
                              <th scope="row">{sim.id}</th>
                              <td>{sim.simnumero}</td>
                              <td>{sim.simcode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/*  */}
                  </div>
                  <div className="modal-footer border-0 py-1">
                    <button
                      type="button"
                      className="btn custom-btn-secondary btn-submit"
                      data-bs-dismiss="modal"
                      onClick={handleCancelLinksimtodemandeForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>
                      Fermer
                    </button>
                    <button type="submit" className="btn custom-btn-success">
                      <i className="fa fa-check me-1" aria-hidden="true"></i>
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
	  
	  {/* Import attribute form */}
          <form
            ref={importAttributeFormRef}
            onSubmit={handleSubmitImportAttributeForm}
            method="POST"
            encType=""
            form-action="importattribute"
            target-id=""
          >
            <button
              ref={importAttributeFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#importattributeModal"
            >
              <i className="fa fa-plus me-2" aria-hidden="true"></i>Launch demo static modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="importattributeModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="importattributeModal"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title  fw-bold text-light" id="importattributeModalLabel">
                      <i className="fa fa-file-import me-1" aria-hidden="true"></i>Importer des
                      attributions de cartes SIM
                    </h5>
                    <button
                      ref={importAttributeFormBtnCloseRef}
                      type="button"
                      className="btn-close d-none"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Alerts */}
                    {createAlert && (
                      <div
                        className="card mb-2"
                        style={{
                          backgroundColor: colors[createAlert.type],
                          borderColor: colors[createAlert.type],
                        }}
                      >
                        <div className="card-body py-1">
                          <CustomCreateAlert alert={createAlert} />
                        </div>
                      </div>
                    )}
                    {/*  */}
                    <div className="d-flex pb-1">
                      <CustomRequired tagP={true} />
                    </div>

                    <div className="card">
                      <div className="card-body">
			{/* Type répondant */}
                        <div className="mb-2">
                          <label htmlFor="typerepondant" className="form-label mb-0">
                            Type de répondant
                            <CustomRequired />
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="typerepondant"
                              name="typerepondant"
                              required
                              autoFocus
                            >
                              <option value="">Sélectionner ici !</option>
                              {typerepondants.map((typerepondant, index) => (
                                <option
                                  value={typerepondant.id}
                                  key={'typerepondant-item-' + index}
                                >
                                  {index + 1 + '. ' + typerepondant.tyrlibelle}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* FIchier */}
                        <div className="mb-2">
                          <label htmlFor="fichier" className="form-label mb-0">
                            Fichier
                            <CustomRequired />
                          </label>
                          <div className="">
                            <input
                              type="file"
                              className="form-control"
                              id="fichier"
                              name="fichier"
                              aria-describedby="fichierHelpBlock"
                              accept=".xlsx, .xls, .csv"
                              required
                              onChange={handleImportAttributeFileUpload}
                            />
                            <div id="fichierHelpBlock" className="form-text mt-0 fw-bold">
                              Le fichier doit être de type Excel (.xls, .xlsx) ou CSV (.csv)
                            </div>
                          </div>
                        </div>

                        {/* List preview */}
                        {importAttributeExcelData.length > 0 && (
                          <div
                            className="py-1 text-light fw-bolder text-center"
                            style={{ backgroundColor: colors['success'] }}
                          >
                            <i className="fa fa-check me-1" aria-hidden="true"></i>
                            {importAttributeExcelData.length - 1 + ' SIM trouvé(s) !'}
                          </div>
                        )}

                        {/* Optional: Display the imported data (e.g., in a table) */}
                        {importAttributeExcelData.length > 0 && (
                          <div
                            className="table-responsive table-responsive-sm mt-2"
                            style={{ height: '15em' }}
                          >
                            <table
                              className="table table-sm align-middle table-borderless table-striped"
                              style={{ width: '100%', height: '', overflow: 'auto' }}
                            >
                              <thead className="header-sticky">
                                <tr>
                                  {importAttributeExcelData[0].map((headerTitle, index) => (
                                    <th
                                      className="text-uppercase"
                                      scope="col"
                                      key={'header-title-' + index}
                                    >
                                      {headerTitle}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importAttributeExcelData.map((row, index) => {
                                  return index > 0 ? (
                                    <tr key={'row-' + index}>
                                      {row.map((r, index2) => (
                                        <td scope="row" key={'row-' + index + '-td-' + index2}>
                                          {r}
                                        </td>
                                      ))}
                                    </tr>
                                  ) : (
                                    ''
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 py-0">
                    <button
                      type="submit"
                      className="btn custom-btn-success importattributeModalBtnSave"
                    >
                      <i className="fa fa-check me-1" aria-hidden="true"></i>
                      Valider
                    </button>
                    <button
                      type="button"
                      className="btn custom-btn-secondary importattributeModalBtnCancel"
                      data-bs-dismiss="modal"
                      onClick={handleCancelImportAttributeForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>Fermer
                    </button>
                    <button
                      ref={importAttributeFormBtnResetRef}
                      type="reset"
                      className="btn d-none"
                    >
                      <i className="fa fa-refresh me-1" aria-hidden="true"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/*  */}
        </div>
      </div>
    </div>
  )
}

export default Demande
