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
import { actives, sexes, colors } from '../../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faKey } from '@fortawesome/free-solid-svg-icons'

const Utilisateur = ({ auth }) => {
  const tableRef = useRef()
  const createFormRef = useRef()
  const deleteFormRef = useRef()
  const createFormBtnLaunchRef = useRef()
  const createFormBtnCloseRef = useRef()
  const createFormBtnResetRef = useRef()
  const showModalBtnLaunchRef = useRef()
  const deleteFormBtnLaunchRef = useRef()
  const deleteFormBtnCloseRef = useRef()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [indexAlert, setIndexAlert] = useState(null)
  const [createAlert, setCreateAlert] = useState(null)
  const [createFormAction, setCreateFormAction] = useState(null)
  const [roles, setRoles] = useState([])
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [sessiondemandes, setSessiondemandes] = useState([])
  const [sites, setSites] = useState([])
  const exportConstants = { title: 'Liste des utilisateurs', columns: [1, 2, 3, 4, 5, 6, 7, 8] }

  const apiResource = {
    get: 'users',
    show: 'users/:id',
    create: 'users',
    update: 'users/:id',
    delete: 'users/:id',
  }

  const columns = [
    { title: 'ID', data: 'id' },
    { title: 'PRENOM(S)', data: 'lastname' },
    { title: 'NOM', data: 'name' },
    { title: 'EMAIL', data: 'email' },
    {
      title: 'SEXE',
      data: null,
      render: (data, type, row) => {
	const r = row.sexe && row.sexe.substring(0, 1)
        return `<div class="text-center">${r}</div>`
      },
    },
    {
      title: 'ROLES',
      data: null,
      render: (data, type, row) => {
        return row.roles ? row.roles.map((role) => role.rlelibelle) : ''
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
      title: 'PROVINCE',
      data: null,
      render: (data, type, row) => {
        return row.province && row.province.prvnom
      },
    },
    {
      title: 'ACTIVE',
      data: null,
      render: (data, type, row) => {
        return `<div class="d-flex justify-content-center align-content-center ${row.active === 'oui' ? 'text-success' : 'text-danger'}"><i class="fa fa-circle " aria-hidden="true"></i><span class="d-none">${row.active}</span></div>`
      },
    },
    {
      title: 'STATUT',
      data: null,
      render: (data, type, row) => {
        return `<div class="d-flex justify-content-center align-content-center ${row.status === 'oui' ? 'text-success' : 'text-danger'}"><i class="fa fa-circle " aria-hidden="true"></i></div>`
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
        //const btnPassword = `<a class="btn btn-outline-secondary tableActionBtn tableActionBtnPasswordItem" href="#" data-id="${row.id}" title="Générer un nouveau mot de passe"><i class="fa fa-key" aria-hidden="true"></i></a>`
        return `<div class="d-flex align-content-center justify-content-center">${btnEdit + btnDelete}</div>`
      },
    },
  ]

  const fetchGet = async () => {
    try {
      const response = await getData(apiResource.get)
      setData(response)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGetRole = async () => {
    const response = await getData('roles')
    if (response) {
      setRoles(response)
    }
  }

  const fetchGetRegion = async () => {
    const response = await getData('regions')
    if (response) {
      setRegions(response)
    }
  }

  const fetchGetProvince = async () => {
    const response = await getData('provinces')
    if (response) {
      setProvinces(response)
    }
  }

  useEffect(() => {
    //let timerId = setInterval(() => {
     fetchGet()
     fetchGetRole()
     fetchGetRegion()
    // }, 2000)
    // return () => {
     //  clearInterval(timerId)
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
    const id = $(this).data('id')
    await getItem(apiResource.show.replace(':id', id)).then((response) => {
      if (response.success) {
        if (createFormRef.current && createFormBtnLaunchRef.current) {
          const r = response.data
          setCreateFormAction('edit')
          createFormRef.current.setAttribute('create-data-action', 'edit')
          createFormRef.current.setAttribute('create-data-id', id)
          // Iterate over all checkboxes with the name 'choices[]'
          $('input[name="role"]').each(function () {
            var checkboxValue = $(this).val()
            const rleIds = r.roles.map((role) => role.id)
            $(this).prop('checked', rleIds.toString().includes(checkboxValue) ? true : false)
          })
          $('input[name="region"][value="' + r.region_id + '"]').prop('checked', true)
          $('input[name="province"][value="' + r.province_id + '"]').prop('checked', true)
          $('#region').val(r.region_id)
          $('#nom').val(r.name)
          $('#prenoms').val(r.lastname)
          $('#email').val(r.email)
          $('input[name="sexe"][value="' + r.sexe + '"]').prop('checked', true)
          $('input[name="active"][value="' + r.active + '"]').prop('checked', true)
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
    // Récupération des données du formulaire
    const action = e.target.getAttribute('create-data-action')
    const id = e.target.getAttribute('create-data-id')
    if (createFormRef.current && createFormBtnCloseRef.current) {
      const formData = new FormData(createFormRef.current)
      const formValues = Object.fromEntries(formData)
      // Récupération des rôles 
      let selectedRoles = []
      $('input[name="role"]').each(function () {
	if ($(this).prop('checked')) {
	 selectedRoles.push($(this).val())
	}
      })
      formValues.role = selectedRoles
      // 
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

  // === Générate new password
  $('#myTable tbody').on('click', '.tableActionBtnPasswordItem', async function (e) {
    e.preventDefault()
    const id = $(this).data('id')
    const response = await updateItem(apiResource.update.replace(':id', id), {
      resetpassword: 'resetpassword',
    })
    // Succès
    if (response.status === 200) {
      setIndexAlert(response.data)
    }
    // Echec
    if (response.status === 201) {
      setCreateAlert(response.data)
    }
  })
  //

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
            encType=""
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
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
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
                        {/* Rôles */}
                        <div className="mb-2">
                          <label htmlFor="role" className="form-label mb-0 fw-bolder">
                            Rôles
                            <CustomRequired />
                          </label>
                          <div className="">
                            {roles.map((role, index) => (
                              <div
                                className="form-check form-check-inline"
                                key={'role-item-' + index}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={'role-' + role.id}
                                  name="role"
                                  value={role.id}
                                />
                                <label className="form-check-label" htmlFor={'role-' + role.id}>
                                  {index + 1 + '. ' + role.rlelibelle}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Régions */}
                        <div className="mb-2">
                          <label htmlFor="region" className="form-label mb-0 fw-bolder">
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
                                  {index + 1 + '. ' + region.rgnnom}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Provinces */}
                        <div className="mb-2">
                          <label htmlFor="province" className="form-label mb-0 fw-bolder">
                            Province
                            <CustomRequired />
                          </label>
                          <div className="">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              id="province"
                              name="province"
                            >
                              <option value="">Sélectionner ici !</option>
                              {provinces.map((province, index) => {
                                return (
                                  <option value={province.id} key={'province-item-' + index}>
                                    {index + 1 + '. ' + province.prvnom}
                                  </option>
                                )
                              })}
                            </select>
                          </div>
                        </div>

                        <div className="row mb-2">
                          {/* Nom */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="nom" className="form-label mb-0 fw-bolder">
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
                          {/* Prénom(s) */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="prenoms" className="form-label mb-0 fw-bolder">
                              Prénoms
                              <CustomRequired />
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="prenoms"
                                name="prenoms"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email, Password */}
			<div className="row mb-2">
			{/* Email */}
                        <div className="col-md-6 mb-2">
                          <label htmlFor="email" className="form-label mb-0 fw-bolder">
                            Email
                            <CustomRequired />
                          </label>
                          <div className="">
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              placeholder="Votre email professionnel ou autre."
                              required
                            />
                          </div>
                        </div>
		      {/* Password */}
		      <div className="col-md-6 mb-2">
			<label htmlFor="password" className="form-label mb-0 fw-bolder">
			Mot de passe
			</label>
			<div className="">
                        <input type="password" className="form-control" id="password" name="password" disabled={createFormAction === "edit" ? false : true} />
			</div>
		       </div>
		      </div>

                        <div className="row mb-2">
                          {/* Sexe */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="sexe" className="form-label mb-0 fw-bolder">
                              Sexe
                            </label>
                            <div className="">
                              {sexes.map((sexe, index) => {
                                return (
                                  <div
                                    className="form-check form-check-inline"
                                    key={'sexe-item-' + index}
                                  >
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="sexe"
                                      id={'sexe' + index}
                                      value={sexe}
                                      // defaultChecked={estActive === 'non' ? true : false}
                                    />
                                    <label className="form-check-label" htmlFor={'sexe' + index}>
                                      {sexe}
                                    </label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          {/* Est activé */}
                          <div className="col-md-6 mb-2">
                            <label htmlFor="active" className="form-label mb-0 fw-bolder">
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
                    <button
                      ref={createFormBtnResetRef}
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
          {/*  */}
        </div>
      </div>
    </div>
  )
}

export default Utilisateur
