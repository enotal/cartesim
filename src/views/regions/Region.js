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
import { actives, colors } from '../../constants'
import * as XLSX from 'xlsx'
import { setintervaldelay } from '../setintervaldelay'

const Region = ({ auth }) => {
  const tableRef = useRef()
  const createFormRef = useRef()
  const deleteFormRef = useRef()
  const unlinksimFormRef = useRef()
  const linksimtoprovinceFormRef = useRef()
  const createFormBtnLaunchRef = useRef()
  const createFormBtnCloseRef = useRef()
  const createFormBtnResetRef = useRef()
  const showModalBtnLaunchRef = useRef()
  const deleteFormBtnLaunchRef = useRef()
  const deleteFormBtnCloseRef = useRef()
  const unlinksimFormBtnLaunchRef = useRef()
  const unlinksimFormBtnCloseRef = useRef()
  const linksimtoprovinceFormBtnLaunchRef = useRef()
  const linksimtoprovinceFormBtnCloseRef = useRef()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [indexAlert, setIndexAlert] = useState(null)
  const [createAlert, setCreateAlert] = useState(null)
  const [linkAlert, setLinkAlert] = useState(null)
  const [createFormAction, setCreateFormAction] = useState(null)
  const [regionProvinces, setRegionProvinces] = useState([])
  const [regionSims, setRegionSims] = useState([])
  const [sims, setSims] = useState([])
  const [anneeacademiques, setAnneeacademiques] = useState([])
  const exportConstants = { title: 'Liste des régions', columns: [1, 2, 3, 4, 5, 6, 7] }

  const apiResource = {
    get: 'regions',
    show: 'regions/:id',
    create: 'regions',
    update: 'regions/:id',
    delete: 'regions/:id',
  }

  const columns = [
    { title: 'ID', data: 'id' },
    { title: 'CODE', data: 'rgncode' },
    { title: 'NOM', data: 'rgnnom' },
    { title: 'CHEF-LIEU', data: 'rgncheflieu' },
    {
      title: 'PROVINCES',
      data: null,
      render: (data, type, row) => {
        const r = row.provinces && row.provinces.length
        return `<div class="text-center">${r}</div>`
      },
    },
    {
      title: 'SITES',
      data: null,
      render: (data, type, row) => {
	const r = row.provinces ? (row.provinces.sites ? row.provinces.sites.length : 0) : 0
        return `<div class="text-center">${r}</div>`
      },
    },
    {
      title: 'SIMS',
      data: null,
      render: (data, type, row) => {
        const r = row.sims && row.sims.length 
        return `<div class="text-center">${r}</div>`
      },
    },
    {
      title: 'ACTIVE',
      data: null,
      render: (data, type, row) => {
        return `<div class="d-flex justify-content-center align-content-center ${row.rgnactive === 'oui' ? 'text-success' : 'text-danger'}"><i class="fa fa-circle" aria-hidden="true"></i><span class="d-none">${row.rgnactive}</span></div>`
      },
    },
    {
      title: 'ACTIONS',
      data: null,
      render: (data, type, row) => {
        const ns = row.sims && row.sims
        const pr = row.provinces && row.provinces
        const sp = ns.filter((item) => item.province_id === null)
        const btnLinkSimToProvince =
          pr.length > 0 && ns.length > 0
            ? `<a class="btn btn-outline-warning me-1 table-btn tableActionBtnLinkSimToProvinceItem" data-id="${row.id}" data-nbr="${ns.length}" data-prv="${pr.length}" title="Répartir les cartes SIM entre les provinces"><i class="fa fa-paper-plane" aria-hidden="true"></i></a>`
            : ''
        const btnUnlinkSim =
          ns.length > 0
            ? `<a class="btn btn-outline-warning me-1 table-btn tableActionBtnUnlinkSimItem" data-id="${row.id}" data-nbr="${ns.length}" title="Dissocier les cartes SIM"><i class="fa fa-close" aria-hidden="true"></i></a>`
            : ''
        const btnEdit = `<a class="btn btn-outline-info me-1 table-btn tableActionBtnEditItem" data-id="${row.id}"><i class="fa fa-edit" aria-hidden="true"></i></a>`
        const btnDelete = `<a class="btn btn-outline-danger tableActionBtn tableActionBtnDeleteItem" data-id="${row.id}"><i class="fa fa-trash" aria-hidden="true"></i></a>`
        return `<div class="d-flex justify-content-end">${btnLinkSimToProvince + btnUnlinkSim + btnEdit + btnDelete}</div>`
      },
    },
  ]

  const fetchGet = async () => {
    try {
      const data = await getData(apiResource.get)
      if (auth.roles.includes('administrateur')) {
        setData(data)
      } else {
        if (auth.region !== null) {
          setData(data.filter((item) => item.id === auth.region.id))
        } else {
          setData(data)
        }
      }
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

  useEffect(() => {
    // let timerId = setInterval(() => {
    fetchGet()
    fetchGetAnneeacademique()
    // }, setintervaldelay)
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
                // titleAttr: "Ajouter",
                className: 'dt-btn datatable-button rounded dt-btnCreate btnCreate',
                enabled: true,
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
              {
                text: '<i class="fa fa-trash me-1" aria-hidden="true"></i>Tout supprimer',
                className: 'dt-btn datatable-button rounded dt-btnCreate btnDeleteAll ms-2',
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

  // === Unlink sim
  $('#myTable tbody').on('click', '.tableActionBtnUnlinkSimItem', async function (e) {
    e.preventDefault()
    setIndexAlert(null)
    setCreateAlert(null)
    const id = $(this).data('id')
    const nbr = $(this).data('nbr')
    await getItem(apiResource.show.replace(':id', id)).then((response) => {
      if (response.success) {
        if (unlinksimFormRef.current && unlinksimFormBtnLaunchRef.current) {
          unlinksimFormRef.current.setAttribute('data-id', id)
          unlinksimFormRef.current.setAttribute('data-nbr', nbr)
          unlinksimFormBtnLaunchRef.current.click()
        }
      } else {
        setIndexAlert(response)
      }
    })
  })

  // === Link sim to region provinces
  $('#myTable tbody').on('click', '.tableActionBtnLinkSimToProvinceItem', async function (e) {
    e.preventDefault()
    setIndexAlert(null)
    setCreateAlert(null)
    const id = $(this).data('id')
    const nbr = $(this).data('nbr')
    const prv = $(this).data('prv')
    await getItem(apiResource.show.replace(':id', id)).then((response) => {
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
    })
  })

  // === Edit item
  $('#myTable tbody').on('click', '.tableActionBtnEditItem', async function (e) {
    e.preventDefault()
    setIndexAlert(null)
    setCreateAlert(null)
    const id = $(this).data('id')
    const response = await getItem(apiResource.show.replace(':id', id))
    if (response.success) {
      if (createFormRef.current && createFormBtnLaunchRef.current) {
          const r = response.data
          setCreateFormAction('edit')
          createFormRef.current.setAttribute('create-data-action', 'edit')
          createFormRef.current.setAttribute('create-data-id', id)
          $('#code').val(r.rgncode)
          $('#nom').val(r.rgnnom)
          $('#cheflieu').val(r.rgncheflieu)
          $('input[name="active"][value="' + r.rgnactive + '"]').prop('checked', true)
          $('#commentaire').val(r.rgncommentaire)
          createFormBtnLaunchRef.current.click()
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

  // === Unlink SIM

  const handleCancelUnlinksimForm = () => {
    setCreateAlert(null)
    setIndexAlert(null)
  }

  const handleSubmitUnlinksimForm = async (e) => {
    e.preventDefault()
    // récupération des données du formulaire
    const id = e.target.getAttribute('data-id')
    const nbr = e.target.getAttribute('data-nbr')
    const aca = $('#anneeacademique').val()
    if (unlinksimFormRef.current && unlinksimFormBtnCloseRef.current) {
      await getItem(
        'sims_regions_dissocier/:id'.replace(':id', id) +
          '/:nbr'.replace(':nbr', nbr) +
          '/:anneeacademique'.replace(':anneeacademique', aca),
      ).then((response) => {
        if (response.success) {
          unlinksimFormBtnCloseRef.current.click()
        }
        setIndexAlert(response)
      })
    }
    fetchGet()
  }

  // ===

  // === Link sims to region provinces

  const handleCancelLinksimtoprovinceForm = () => {
    setIndexAlert(null)
    setCreateAlert(null)
    setLinkAlert(null)
    setRegionProvinces([])
    setRegionSims([])
  }

  const handleSubmitLinksimtoprovinceForm = async (e) => {
    e.preventDefault()
    // récupération des données du formulaire
    const id = e.target.getAttribute('data-id')
    const nbr = e.target.getAttribute('data-nbr')
    const prv = e.target.getAttribute('data-prv')
    const aca = e.target.getAttribute('data-aca')
    if (linksimtoprovinceFormRef.current && linksimtoprovinceFormBtnCloseRef.current) {
      let total = 0
      for (var i = 0; i < prv; i++) {
        let initial = $('#regionProvince-item-initial-' + i).text()
        let nombre = $('#regionProvince-item-nombre-' + i).val()
        total = total + parseInt(initial)
        if (parseInt(nombre)) {
          total = total + parseInt(nombre)
        }
      }
      if (parseInt(nbr) < total) {
        setLinkAlert({ type: 'danger', message: 'Erreur : nombre total de SIM excédé !' })
      } else {
        setLinkAlert(null)
        // Récupération des données du formulaire
        const formData = new FormData(linksimtoprovinceFormRef.current)
        const formValues = Object.fromEntries(formData)
        const aca = $('#anneeacademique').val()
        const data = { provinces: formValues, region: id, anneeacademique: aca }
        //
        await createItem('sims/provinces/associer', data).then((response) => {
          if (response.success) {
            // linksimtoprovinceFormBtnCloseRef.current.click()
          }
          setLinkAlert(response)
        })
      }
    }
    fetchGet()
  }

  // ===

  const handleAnneeacademique = (e) => {
    const { name, value } = e.target
    if (value) {
      setSims(regionSims.filter((item) => item.anneeacademique_id === parseInt(value)))
    } else {
      setSims(regionSims)
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
                        {/* Code */}
                        <div className="mb-2">
                          <label htmlFor="code" className="form-label mb-0">
                            Code
                          </label>
                          <div className="">
                            <input
                              type="text"
                              className="form-control"
                              id="code"
                              name="code"
                              autoFocus
                            />
                          </div>
                        </div>
                        {/* Nom */}
                        <div className="mb-2">
                          <label htmlFor="nom" className="form-label mb-0">
                            Nom
                            <CustomRequired />
                          </label>
                          <div className="">
                            <input
                              type="text"
                              className="form-control"
                              id="nom"
                              name="nom"
                              required
                            />
                          </div>
                        </div>
                        {/* Chef-lieu */}
                        <div className="mb-2">
                          <label htmlFor="cheflieu" className="form-label mb-0">
                            Chef-lieu
                            <CustomRequired />
                          </label>
                          <div className="">
                            <input
                              type="text"
                              className="form-control"
                              id="cheflieu"
                              name="cheflieu"
                              required
                            />
                          </div>
                        </div>
                        {/* Est activé */}
                        <div className="mb-2">
                          <label htmlFor="active" className="form-label mb-0">
                            Activé
                          </label>
                          <div className="">
                            {actives.map((active, index) => {
                              return (
                                <div
                                  className="form-check form-check-inline"
                                  key={'active-item-' + index}
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="active"
                                    id={'active' + index}
                                    value={active}
                                    // defaultChecked={estActive === 'non' ? true : false}
                                  />
                                  <label className="form-check-label" htmlFor={'active' + index}>
                                    {active}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        {/* Commentaire */}
                        <div className="">
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
                    <button
                      type="submit"
                      className="btn custom-btn-success text-white createModalBtnSave"
                    >
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
          {/* Unlink SIM form */}
          <form
            ref={unlinksimFormRef}
            onSubmit={handleSubmitUnlinksimForm}
            method="POST"
            encType=""
            data-action="unlink"
            data-id=""
            data-nbr=""
          >
            <button
              ref={unlinksimFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#unlinksimModal"
            >
              <i className="fa fa-trash me-2" aria-hidden="true"></i>Launch static backdrop modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="unlinksimModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="unlinksimModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title fw-bold text-light" id="unlinksimModalLabel">
                      <i className="fa fa-trash me-1" aria-hidden="true"></i>Supprimer
                    </h5>
                    <button
                      ref={unlinksimFormBtnCloseRef}
                      type="button"
                      className="btn-close d-none"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="d-flex justify-content-center mb-3">
                      <i
                        className="fa fa-exclamation-triangle me-1 text-danger fw-bolder"
                        aria-hidden="true"
                      ></i>
                      <span id="unlinksimQuestion">
                        Voulez-vous vraiment dissocier les cartes SIM ?
                      </span>
                    </div>
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
                          // name="anneeacademique"
                          required
                          autoFocus
                          // onChange={handleAnneeacademique}
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
                    <div
                      className="card"
                      style={{ backgroundColor: colors['danger'], borderColor: colors['danger'] }}
                    >
                      <div className="card-body p-1 text-small text-light">
                        <span className="fw-bolder">N.B :</span> Si l'année n'est pas précisée,
                        toutes les cartes associées à la région seront dissociées d'elle !
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 py-1">
                    <button
                      type="button"
                      className="btn custom-btn-secondary btn-submit"
                      data-bs-dismiss="modal"
                      onClick={handleCancelUnlinksimForm}
                    >
                      <i className="fa fa-close me-1" aria-hidden="true"></i>
                      Annuler
                    </button>
                    <button type="submit" className="btn custom-btn-success">
                      <i className="fa fa-trash me-1" aria-hidden="true"></i>
                      Dissocier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/* Link SIM to province form */}
          <form
            ref={linksimtoprovinceFormRef}
            onSubmit={handleSubmitLinksimtoprovinceForm}
            method="POST"
            encType=""
            data-action="linktoprovince"
            data-id=""
            data-nbr=""
            data-prv=""
          >
            <button
              ref={linksimtoprovinceFormBtnLaunchRef}
              type="button"
              className="btn btn-primary d-none"
              data-bs-toggle="modal"
              data-bs-target="#linksimtoprovinceModal"
            >
              <i className="fa fa-trash me-2" aria-hidden="true"></i>Launch static backdrop modal
            </button>
            {/* <!-- Modal --> */}
            <div
              className="modal fade"
              id="linksimtoprovinceModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="linksimtoprovinceModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header py-1 bg-primary">
                    <h5 className="modal-title fw-bold text-light" id="linksimtoprovinceModalLabel">
                      <i className="fa fa-paper-plane me-1" aria-hidden="true"></i>Répartir entre
                      provinces
                    </h5>
                    <button
                      ref={linksimtoprovinceFormBtnCloseRef}
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
                        {'Répartir ' +
                          sims.length +
                          ' carte(s) sim entre ' +
                          regionProvinces.length +
                          ' province(s)'}
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
                          // name="anneeacademique"
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
                    {/*  */}
                    <div className="table-responsive table-responsive-sm">
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr className="text-start">
                            <td scope="col">ID</td>
                            <td scope="col">NOM</td>
                            <td scope="col">CHEF-LIEU</td>
                            <td scope="col">INITIAL</td>
                            <td scope="col">NOMBRE</td>
                          </tr>
                        </thead>
                        <tbody>
                          {regionProvinces.map((regionProvince, index) => (
                            <tr key={'regionProvince-item-' + index} className="text-start">
                              <th scope="row">{regionProvince.id}</th>
                              <td>{regionProvince.prvnom}</td>
                              <td>{regionProvince.prvcheflieu}</td>
                              <td
                                className="text-center"
                                id={'regionProvince-item-initial-' + index}
                              >
                                {regionProvince.sims ? regionProvince.sims.length : 0}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  id={'regionProvince-item-nombre-' + index}
                                  name={regionProvince.id}
                                />
                              </td>
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
                      onClick={handleCancelLinksimtoprovinceForm}
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
          {/*  */}
        </div>
      </div>
    </div>
  )
}

export default Region
