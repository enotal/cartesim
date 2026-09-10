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
import { getData, getItem, createItem, updateItem, deleteItem, getItemBy } from '../../apiService'
import { CustomRequired } from '../../components/CustomRequired'
import { CustomIndexAlert } from '../../components/CustomIndexAlert'
import { CustomCreateAlert } from '../../components/CustomCreateAlert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons'
import { actives, colors, simColumnToImport } from '../../constants'
import * as XLSX from 'xlsx'
// import { isEmpty } from 'validator'

const Sim = ({ auth }) => {
  const tableRef = useRef()
  const tableDemandeRef = useRef()
  const createFormRef = useRef()
  const deleteFormRef = useRef()
  const createFormBtnLaunchRef = useRef()
  const createFormBtnCloseRef = useRef()
  const createFormBtnResetRef = useRef()
  const deleteFormBtnLaunchRef = useRef()
  const deleteFormBtnCloseRef = useRef()
  const importFormRef = useRef()
  const importFormBtnLaunchRef = useRef()
  const importFormBtnCloseRef = useRef()
  const importFormBtnResetRef = useRef()
  const attributeFormRef = useRef()
  const attributeFormBtnLaunchRef = useRef()
  const attributeFormBtnCloseRef = useRef()
  const attributeFormBtnResetRef = useRef()
  const dissocierFormRef = useRef()
  const dissocierFormBtnLaunchRef = useRef()
  const dissocierFormBtnCloseRef = useRef()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [indexAlert, setIndexAlert] = useState(null)
  const [createAlert, setCreateAlert] = useState(null)
  const [createFormAction, setCreateFormAction] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [importColumns, setImportColumns] = useState([])
  const [attribute, setAttribute] = useState([])
  const [sims, setSims] = useState([])
  const [demandes, setDemandes] = useState([])
  const [anneeacademiques, setAnneeacademiques] = useState([])
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [delay, SetDelay] = useState(2000)
  const exportConstants = { title: 'Liste des cartes SIM', columns: [1, 2, 3, 4 /*, 5, 6, 7*/] }

  const apiResource = {
    get: 'sims',
    show: 'sims/:id',
    create: 'sims',
    update: 'sims/:id',
    delete: 'sims/:id',
  }

  const columns = [
    { title: 'ID', data: 'id' },
    { 
      title: 'ANNEE ACADEMIQUE',
      data: null, 
      render: (data, type, row) => {
        const r = row.anneeacademique ? row.anneeacademique.acacode : ''
        return r 
      }, 
    },  
    { title: 'NUMERO', data: 'simnumero' },
    { 
      title: 'IMSI', 
      data: null, 
      render: (data, type, row) => {
        return row.simcode
      },  
    },
    {
      title: 'DEMANDE',
      data: null,
      render: (data, type, row) => {
        const r = row.demandes ? row.demandes.map(item => item.id).join(", ") : '' 
	return r
      },
    },
    {
      title: 'PROVINCE',
      data: null,
      render: (data, type, row) => {
        return row.province && row.province.prvnom
      },
    },
    {
      title: 'REGION',
      data: null,
      render: (data, type, row) => {
        return row.region && row.region.rgnnom
      },
    },
    {
      title: 'DATE REMISE',
      data: null,
      render: (data, type, row) => {
        const r = row.demandes ? row.demandes.map(item => { if(item.dmddateremiseeffective !== null ){ let d = new Date(item.dmddateremiseeffective); return d.toLocaleDateString(); }else{return ''}}).join(", ") : ''
        return r
      },
    },
    {
      title: 'ACTIONS',
      data: null,
      render: (data, type, row) => {
        // Détails, Edit, Delete
        // const btnShow = `<a class="btn btn-outline-warning me-1 tableActionBtn tableActionBtnShowItem" href="#" data-id="${row.id}" title="Voir les détails"><i class="fa fa-eye" aria-hidden="true"></i></a>`
        const btnEdit = `<a class="btn btn-outline-info me-1 tableActionBtn tableActionBtnEditItem" href="#" data-id="${row.id}" title="Editer"><i class="fa fa-edit" aria-hidden="true"></i></a>`
        const btnDelete = `<a class="btn btn-outline-danger me-1 tableActionBtn tableActionBtnDeleteItem" href="#" data-id="${row.id}" title="Supprimer"><i class="fa fa-trash" aria-hidden="true"></i></a>`
        return auth.region !== null ? '' : `<div class="d-flex">${btnEdit + btnDelete}</div>`
      },
    },
  ]

  const demandeColumns = [
    { title: 'ID', data: 'id' },
    { title: 'CODE', data: 'dmdcode' },
    { title: 'REPONDANT', data: 'repondant.repidentifiant' },
  ]

  const fetchGet = async () => {
    try {
      const response = await getData(apiResource.get)
      const r =
        auth.region !== null ? response.filter((item) => item.region_id === auth.region.id) : response
      setData(r)
      setSims(r.filter((item) => item.demande_id === null && item.region_id === null))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGetAnneeacademique = async () => {
    const response = await getData('anneeacademiques')
    if (response) {
      setAnneeacademiques(response)
    }
  }

  const fetchGetRegion = async () => {
    const response = await getData('regions')
    if (response) {
      setRegions(response)
    }
  }

  useEffect(() => {
    // let timerId = setInterval(() => {
    fetchGet()
    fetchGetAnneeacademique()
    fetchGetRegion()
    // }, delay)
    // return () => {
    //   clearInterval(timerId)
    // }
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
                className: 'dt-btn datatable-button rounded dt-btnCreate btnCreate my-1',
                enabled: auth.region !== null ? false : true,
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
                className: 'dt-btn datatable-button rounded dt-btnCreate btnDeleteAll ms-2 my-1',
                //enabled: data && data.length > 0 ? true : false,
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
                text: '<i class="fa fa-file-import me-1" aria-hidden="true"></i>Importer',
                className: 'dt-btn datatable-button rounded dt-btnImport btnImport ms-2 my-1',
                enabled: auth.region !== null ? false : true,
                action: () => {
                  if (importFormRef.current && importFormBtnLaunchRef.current) {
                    //   setCreateFormAction('create')
                    setIndexAlert(null)
                    setCreateAlert(null)
                    importFormRef.current.setAttribute('form-action', 'import')
                    importFormRef.current.setAttribute('target-id', '')
                    importFormBtnLaunchRef.current.click()
                  }
                },
              },*/
              {
                text: '<i class="fa fa-paper-plane me-1" aria-hidden="true"></i>Attribuer aux régions',
                className: 'dt-btn datatable-button rounded dt-btnAttribute btnAttribute ms-2 my-1',
                enabled: regions && sims && regions.length > 0 && sims.length > 0 ? true : false,
                action: () => {
                  if (attributeFormRef.current && attributeFormBtnLaunchRef.current) {
                    //   setCreateFormAction('create')
                    // setAttribute('multiple')
                    // const d = demandes && demandes.length + ' demande(s) à satisfaire avec '
                    // const s = sims && sims.length + ' carte(s) SIM !'
                    // $('#attributeFormHeader').text(d + s)
                    attributeFormBtnLaunchRef.current.click()
                  }
                },
              },
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
                customizeData: function(data) {
                  // Loop through all rows in the exported data body
                  for (let i = 0; i < data.body.length; i++) {
                    // Loop through all cells in the current row
                    for (let j = 0; j < data.body[i].length; j++) {
                      // Prepend a Zero Width Non-Joiner character
                      // This forces Excel to treat the cell content as text
                      data.body[i][j] = '\u200C' + data.body[i][j];
                    }
                  }
                },
                exportOptions: {
                  columns: exportConstants.columns,
                  modifier: {
                    page: 'all'
                  }
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

    if (tableDemandeRef.current) {
      $(tableDemandeRef.current).DataTable({
        data: demandes,
        columns: demandeColumns,
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
        select: true,
      })
    }

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

    $('#myTableDemande')
      .DataTable()
      .on('select', function (e, dt, type, indexes) {
        var selectedRowId = dt.rows({ selected: true }).data()[0].id
        if (attributeFormRef.current) {
          attributeFormRef.current.setAttribute('data-demande', selectedRowId)
        }
      })
  }, [data, columns])

  // Actions

  //=== Launch modals

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
    // SetDelay(25000)
    const id = $(this).data('id')
    await getItem(apiResource.show.replace(':id', id)).then((response) => {
      if (response.success) {
        if (createFormRef.current && createFormBtnLaunchRef.current) {
          const r = response.data
          setCreateFormAction('edit')
          createFormRef.current.setAttribute('create-data-action', 'edit')
          createFormRef.current.setAttribute('create-data-id', id)
          $('#anneeacademique').val(r.anneeacademique_id)
          // $('#region').val(r.region_id)
          // $('#province').val(r.province_id)
          $('#code').val(r.simcode)
          $('#numero').val(r.simnumero)
          $('#dateactivation').val(r.simdateactivation)
          $('#dateremise').val(r.simdateremise)
          $('#datesuspension').val(r.simdatesuspension)
          $('#dateretrait').val(r.simdateretrait)
          $('input[name="perdue"][value="' + r.simperdue + '"]').prop('checked', true)
          $('#commentaire').val(r.simcommentaire)
          createFormBtnLaunchRef.current.click()
        }
      } else {
        //
      }
    })
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
        await createItem(apiResource.create, formValues).then((response) => {
          if (response.success) {
            createFormBtnResetRef.current.click()
          }
          setCreateAlert(response)
        })
      }
      if (action === 'edit') {
        await updateItem(apiResource.update.replace(':id', id), formValues).then((response) => {
          if (response.success) {
            setIndexAlert(response)
            createFormBtnResetRef.current.click()
            createFormBtnCloseRef.current.click()
          } else {
            setCreateAlert(response)
          }
        })
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
    await getItem(apiResource.show.replace(':id', id)).then((response) => {
      if (deleteFormRef.current && deleteFormBtnLaunchRef.current) {
        if (response.success) {
          deleteFormRef.current.setAttribute('delete-data-action', 'delete')
          deleteFormRef.current.setAttribute('delete-data-id', id)
          deleteFormBtnLaunchRef.current.click()
        } else {
          //
        }
      }
    })
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
  // ===

  // === Attribute to a demand
  $('#myTable tbody').on('click', '.tableActionBtnDemandeItem', async function (e) {
    e.preventDefault()
    if (attributeFormRef.current && attributeFormBtnLaunchRef.current) {
      const sim = $(this).data('sim')
      const numero = $(this).data('numero')
      attributeFormRef.current.setAttribute('data-sim', sim)
      setAttribute('unique')
      $('#attributeFormHeader').text('Attribuer la carte SIM [ ' + numero + ' ] à une demande !')
      attributeFormBtnLaunchRef.current.click()
    } else {
      //
    }
  })
  //

  // === Dissociate to a demand
  $('#myTable tbody').on('click', '.tableActionBtnDissocierItem', async function (e) {
    e.preventDefault()
    if (dissocierFormRef.current && dissocierFormBtnLaunchRef.current) {
      const numero = $(this).data('numero')
      const demande = $(this).data('demande')
      const codedemande = $(this).data('codedemande')
      dissocierFormRef.current.setAttribute('data-demande', demande)
      $('#dissocierFormHeader').text(
        'Dissocier la carte SIM [ ' + numero + ' ] de la demande [ ' + codedemande + ' ] !',
      )
      dissocierFormBtnLaunchRef.current.click()
    } else {
      //
    }
  })
  //

  // === Import form
  const handleCancelImportForm = () => {
    if (importFormRef.current && importFormBtnCloseRef.current) {
      importFormRef.current.setAttribute('form-action', '')
      importFormRef.current.setAttribute('target-id', '')
      setCreateAlert(null)
      setIndexAlert(null)
      setExcelData([])
      setImportColumns([])
      importFormBtnResetRef.current.click()
      importFormBtnCloseRef.current.click()
    }
  }

  const handleFileUpload = (e) => {
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
            if (simColumnToImport.includes(item.toLowerCase())) {
              columns.push({ key: index, name: item, value: i })
              i++
            }
          })
          setImportColumns(columns)
          // Filtrer la liste suivant les index concernés
          const filterData = []
          const columnsKeys = columns.map((item) => item.key)
          if (columns.length > 0) {
            jsonData.map((item) => {
              // if (index > 0) {
              filterData.push(item.filter((_, index) => columnsKeys.includes(index)))
              // }
            })
            setIndexAlert(null)
            setCreateAlert(null)
            setExcelData(filterData)
          } else {
            // Aucune colonne correspondante dans la liste
            setExcelData([])
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

  const handleSubmitImportForm = async (e) => {
    e.preventDefault()
    // récupération des données de la liste
    if (importFormRef.current && importFormBtnCloseRef.current) {
      const formData = new FormData(importFormRef.current)
      const formValues = Object.fromEntries(formData)
      const data = excelData.filter((_, index) => index > 0)
      await createItem('sims/import', {
        anneeacademique: formValues.anneeacademique,
        columns: importColumns,
        imports: data,
      }).then((response) => {
        setCreateAlert(response)
      })
      fetchGet()
    }
  }
  // ===

  // === Attribute form

  const handleAnneeacademique = (e) => {
    const { name, value } = e.target
    if (value) {
      setSims(
        data.filter(
          (item) =>
            item.demande_id === null &&
            item.region_id === null &&
            item.anneeacademique_id === parseInt(value),
        ),
      )
    } else {
      setSims(data.filter((item) => item.demande_id === null && item.region_id === null))
    }
  }

  const handleCancelAttributeForm = () => {
    if (importFormRef.current && importFormBtnCloseRef.current) {
      importFormRef.current.setAttribute('form-action', '')
      importFormRef.current.setAttribute('target-id', '')
      setExcelData([])
      importFormBtnResetRef.current.click()
      importFormBtnCloseRef.current.click()
    }
  }

  const handleSubmitAttributeForm = async (e) => {
    e.preventDefault()
    // récupération des données de la liste
    if (attributeFormRef.current && attributeFormBtnCloseRef.current) {
      const formData = new FormData(attributeFormRef.current)
      const formValues = Object.fromEntries(formData)
      await createItem('sims/attribuer/regions', formValues).then((response) => {
        if (response.success) {
          if (attributeFormRef.current && attributeFormBtnCloseRef.current) {
            attributeFormBtnCloseRef.current.click()
          }
        }
        setIndexAlert(response)
      })
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
              <div className="modal-dialog modal-lg">
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
                        {/* Année académique */}
                        <div className="mb-2">
                          <label htmlFor="anneeacademique" className="form-label mb-0">
                            Année académique
                            <CustomRequired />
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="anneeacademique"
                              name="anneeacademique"
                              required
                            >
                              <option value="">Sélectionner ici !</option>
                              {anneeacademiques.map((anneeacademique, index) => (
                                <option
                                  value={anneeacademique.id}
                                  key={'anneeacademique-item-' + index}
                                >
                                  {index + 1 + '. ' + anneeacademique.acacode}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* Code & Numéro */}
                        <div className="row">
                          {/* Numéro */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="numero" className="form-label mb-0">
                              Numéro
                              <CustomRequired />
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="numero"
                                name="numero"
                                required
                              />
                            </div>
                          </div>
                          {/* Code */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="code" className="form-label mb-0">
                              Code
                            </label>
                            <div className="">
                              <input type="text" className="form-control" id="code" name="code" />
                            </div>
                          </div>
                        </div>
                        {/* Date activation & Date remise */}
                        <div className="row">
                          {/* Date activation */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="dateactivation" className="form-label mb-0">
                              Date activation
                            </label>
                            <div className="">
                              <input
                                type="date"
                                className="form-control"
                                id="dateactivation"
                                name="dateactivation"
                              />
                            </div>
                          </div>
                          {/* Date remise */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="dateremise" className="form-label mb-0">
                              Date remise
                            </label>
                            <div className="">
                              <input
                                type="date"
                                className="form-control"
                                id="dateremise"
                                name="dateremise"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Date suspension & Date retrait */}
                        <div className="row">
                          {/* Date suspension */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="datesuspension" className="form-label mb-0">
                              Date suspension
                            </label>
                            <div className="">
                              <input
                                type="date"
                                className="form-control"
                                id="datesuspension"
                                name="datesuspension"
                              />
                            </div>
                          </div>
                          {/* Date retrait */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="dateretrait" className="form-label mb-0">
                              Date retrait
                            </label>
                            <div className="">
                              <input
                                type="date"
                                className="form-control"
                                id="dateretrait"
                                name="dateretrait"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Sim perdue & Déclaration perte */}
                        <div className="row">
                          {/* Sim perdue ? */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="perdue" className="form-label mb-0">
                              Perdue
                            </label>
                            <div className="">
                              {actives.map((active, index) => {
                                return (
                                  <div
                                    className="form-check form-check-inline"
                                    key={'perdue-item-' + index}
                                  >
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="perdue"
                                      id={'perdue' + index}
                                      value={active}
                                      // defaultChecked={
                                      //   createFormAction === 'create' && active === 'non'
                                      //     ? true
                                      //     : false
                                      // }
                                    />
                                    <label className="form-check-label" htmlFor={'perdue' + index}>
                                      {active}
                                    </label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          {/* Déclaration perte */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="declarationperte" className="form-label mb-0">
                              Déclaration perte
                            </label>
                            <div className="">
                              <input
                                type="file"
                                className="form-control"
                                id="declarationperte"
                                name="declarationperte"
                                accept="application/pdf"
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
                      className="btn custom-btn-secondary"
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
          {/* Import form */}
          <form
            ref={importFormRef}
            onSubmit={handleSubmitImportForm}
            method="POST"
            encType=""
            form-action="import"
            target-id=""
          >
            <button
              ref={importFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#importModal"
            >
              <i className="fa fa-plus me-2" aria-hidden="true"></i>Launch demo static modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="importModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="importModal"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title  fw-bold text-light" id="importModalLabel">
                      <i className="fa fa-file-import me-1" aria-hidden="true"></i>Importer une
                      liste de cartes SIM
                    </h5>
                    <button
                      ref={importFormBtnCloseRef}
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
                        {/* Année académique */}
                        <div className="mb-2">
                          <label htmlFor="anneeacademique" className="form-label mb-0">
                            Année académique
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="anneeacademique"
                              name="anneeacademique"
                              //required
                              autoFocus
                            >
                              <option value="">Sélectionner ici !</option>
                              {anneeacademiques.map((anneeacademique, index) => (
                                <option
                                  value={anneeacademique.id}
                                  key={'anneeacademique-item-' + index}
                                >
                                  {index + 1 + '. ' + anneeacademique.acacode}
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
                              onChange={handleFileUpload}
                            />
                            <div id="fichierHelpBlock" className="form-text mt-0 fw-bold">
                              Le fichier doit être de type Excel (.xls, .xlsx) ou CSV (.csv)
                            </div>
                          </div>
                        </div>

                        {/* List preview */}
                        {excelData.length > 0 && (
                          <div
                            className="py-1 text-light fw-bolder text-center"
                            style={{ backgroundColor: colors['success'] }}
                          >
                            <i className="fa fa-check me-1" aria-hidden="true"></i>
                            {excelData.length - 1 + ' SIM trouvé(s) !'}
                          </div>
                        )}

                        {/* Optional: Display the imported data (e.g., in a table) */}
                        {excelData.length > 0 && (
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
                                  {excelData[0].map((headerTitle, index) => (
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
                                {excelData.map((row, index) => {
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
                    <button type="submit" className="btn custom-btn-success importModalBtnSave">
                      <i className="fa fa-check me-1" aria-hidden="true"></i>
                      Valider
                    </button>
                    <button
                      type="button"
                      className="btn custom-btn-secondary importModalBtnCancel"
                      data-bs-dismiss="modal"
                      onClick={handleCancelImportForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>Fermer
                    </button>
                    <button ref={importFormBtnResetRef} type="reset" className="btn d-none">
                      <i className="fa fa-refresh me-1" aria-hidden="true"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/* Attribute form */}
          <form
            ref={attributeFormRef}
            onSubmit={handleSubmitAttributeForm}
            method="POST"
            encType=""
          >
            <button
              ref={attributeFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#attributeModal"
            >
              <i className="fa fa-plus me-2" aria-hidden="true"></i>Launch demo static modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="attributeModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="attributeModal"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title  fw-bold text-light" id="attributeModalLabel">
                      <i className="fa fa-paper-plane me-1" aria-hidden="true"></i>Attribuer une
                      carte SIM
                    </h5>
                    <button
                      ref={attributeFormBtnCloseRef}
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
                        {/* Total */}
                        <div
                          className="card mb-2"
                          style={{ backgroundColor: '#056709', borderColor: '#056709' }}
                        >
                          <div className="card-body py-1 text-light text-center">
                            {sims && sims.length + ' carte(s) sim concernée(s)'}
                          </div>
                        </div>
                        {/*  */}

                        {/* Année académique */}
                        <div className="mb-2">
                          <label htmlFor="anneeacademique" className="form-label mb-0">
                            Année académique
                            <CustomRequired />
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="anneeacademique"
                              name="anneeacademique"
                              required
                              autoFocus
                              onChange={handleAnneeacademique}
                            >
                              <option value="">Sélectionner ici !</option>
                              {anneeacademiques.map((anneeacademique, index) => (
                                <option
                                  value={anneeacademique.id}
                                  key={'anneeacademique-item-' + index}
                                >
                                  {index + 1 + '. ' + anneeacademique.acacode}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* Région */}
                        <div className="mb-2">
                          <label htmlFor="region" className="form-label mb-0">
                            Région
                            <CustomRequired />
                          </label>
                          <div className="">
                            {regions.map((region, index) => (
                              <div
                                className="form-check form-check-inline"
                                key={'region-item-' + index}
                              >
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id={'region-' + region.id}
                                  name="region"
                                  value={region.id}
                                />
                                <label className="form-check-label" htmlFor={'region-' + region.id}>
                                  {index +
                                    1 +
                                    '. ' +
                                    region.rgnnom +
                                    ' (' +
                                    region.rgncheflieu +
                                    ')'}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Nombre */}
                        <div className="mb-2">
                          <label htmlFor="nombre" className="form-label mb-0">
                            Nombre
                            <CustomRequired />
                          </label>
                          <div className="">
                            <input
                              className="form-control"
                              type="text"
                              id="nombre"
                              name="nombre"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 py-0">
                    <button type="submit" className="btn custom-btn-success attributeModalBtnSave">
                      <i className="fa fa-check me-1" aria-hidden="true"></i>
                      Valider
                    </button>
                    <button
                      type="button"
                      className="btn custom-btn-secondary attributeModalBtnCancel"
                      data-bs-dismiss="modal"
                      onClick={handleCancelAttributeForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>Fermer
                    </button>
                    <button
                      ref={attributeFormBtnResetRef}
                      type="reset"
                      className="btn btn-secondary d-none"
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

export default Sim
