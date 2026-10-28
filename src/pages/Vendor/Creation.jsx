
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import './Creation.css'

const MAX_FILE_SIZE = 3 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  'pdf', 'jpg', 'jpeg', 'gif', 'png',
  'doc', 'docx', 'xls', 'xlsx', 'msg',
]

const INITIAL_FORM = {
  purpose: '',
  purposeRemark: '',
  title: '',
  name1: '',
  name2: '',
  legalName: '',
  searchTerm1: '',
  searchTerm2: '',
  address1: '',
  address2: '',
  address3: '',
  postalCode: '',
  city: '',
  country: 'IN',
  mobile: '',
  telephoneExt: '',
  telephone: '',
  faxExt: '',
  fax: '',
  region: '',
  email: '',
  accountType: 'SAV',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  ifscCode: '',
  companyCode: '',
  employeeCode: '',
  reconciliationAccount: '',
  orderCurrency: '',
  purchaseOrg: '',
  accountGroup: '',
  industryKey: '',
  paymentTerms: '',
  paymentMethod: '',
  msmeNumber: '',
  customer: '',
  recipientType: '',
  vendorCode: '',
  status: '1',
  rcmVendor: 'Yes',
  gstVendorClassification: '',
  gstn: '',
  pan: '',
  cin: '',
  otherFileText: '',
  withholdingTaxCode: '',
  withholdingCountryKey: '',
  withholdingTaxType: '',
  q194: '',
  taxCode195Q: '',
  eInvoice: 'Yes',
}

const EMPTY_FILES = {
  gstn: null,
  pan: null,
  other: null,
  msme: null,
  tds: null,
  aadhaar: null,
  acknowledgement: null,
}

const PURPOSE_OPTIONS = [
  { value: '1', label: 'Employee' },
  { value: '3', label: 'Vendor' },
  { value: '7', label: 'Employee Code Required' },
  { value: '9', label: 'Other' },
]

const TITLE_OPTIONS = [
  { value: 'MR', label: 'Mr.' },
  { value: 'MRS', label: 'Mrs.' },
  { value: 'MS', label: 'Ms.' },
  { value: 'DR', label: 'Dr.' },
]

const ACCOUNT_GROUP_OPTIONS = [
  { value: 'H002', label: 'H002' },
]

const INDUSTRY_OPTIONS = [
  { value: 'H300', label: 'H300' },
  { value: 'H212', label: 'H212' },
  { value: 'H222', label: 'H222' },
  { value: 'H211', label: 'H211' },
  { value: 'H221', label: 'H221' },
  { value: 'H213', label: 'H213' },
  { value: 'H223', label: 'H223' },
]

const PAYMENT_METHOD_OPTIONS = [
  { value: 'C', label: 'Cheque' },
  { value: 'E', label: 'Cash Payment' },
  { value: 'G', label: 'Goa Payment Method F110' },
  { value: 'R', label: 'RTGS/NEFT' },
  { value: 'S', label: 'SWIFT MODE' },
  { value: 'T', label: 'Bank Transfer' },
]

const CLASSIFICATION_OPTIONS = [
  { value: '0', label: 'Registered' },
  { value: '1', label: 'Not Registered' },
  { value: '2', label: 'PSU/Government Org' },
  { value: '3', label: 'Compounding Scheme' },
]

const COMPANY_OPTIONS = []
const REGION_OPTIONS = []
const RECONCILIATION_OPTIONS = []
const CURRENCY_OPTIONS = []
const PURCHASE_ORG_OPTIONS = []
const PAYMENT_TERM_OPTIONS = []
const TAX_CODE_OPTIONS = []

const MSME_REQUIRED_INDUSTRIES = [
  'H212', 'H222', 'H211', 'H221', 'H213', 'H223',
]

const EMPTY_OPTIONS_MESSAGE =
  'Dropdown values will be loaded from the Vendor API when the backend endpoints are available.'

function SelectField({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
}) {
  return (
    <label className="vendor-field">
      <span>
        {label}
        {required && <b className="vendor-required"> *</b>}
      </span>

      <select
        value={value}
        disabled={disabled}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">-- Select --</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  maxLength,
  type = 'text',
  disabled = false,
  placeholder = '',
  uppercase = false,
}) {
  return (
    <label className="vendor-field">
      <span>
        {label}
        {required && <b className="vendor-required"> *</b>}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => {
          const nextValue = uppercase
            ? event.target.value.toUpperCase()
            : event.target.value

          onChange(nextValue)
        }}
      />
    </label>
  )
}

function FileField({ label, file, onChange, required = false }) {
  return (
    <label className="vendor-field vendor-file-field">
      <span>
        {label}
        {required && <b className="vendor-required"> *</b>}
      </span>

      <input
        type="file"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />

      {file && (
        <span className="vendor-file-name">
          {file.name}
        </span>
      )}
    </label>
  )
}

function validateFile(file, purpose, field) {
  if (!file) return ''

  const extension = file.name.split('.').pop()?.toLowerCase()

  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: maximum file size is 3 MB.`
  }

  if (field === 'other' && ['1', '3'].includes(purpose)) {
    if (extension !== 'msg') {
      return 'Other document must be an MSG file for the selected purpose.'
    }
  } else if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `${file.name}: file extension is not allowed.`
  }

  return ''
}

function validateForm(form, files) {
  const errors = []

  if (!form.bankName.trim()) {
    errors.push('Bank Name is required.')
  }

  if (!form.bankAccountName.trim()) {
    errors.push('Bank Account Name is required.')
  }

  if (!form.bankAccountNumber.trim()) {
    errors.push('Bank Account Number is required.')
  }

  if (!form.ifscCode.trim()) {
    errors.push('IFSC Code is required.')
  } else if (
    ['IN', 'INDIA'].includes(form.country.trim().toUpperCase())
  ) {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      errors.push('Enter a valid IFSC Code.')
    }
  } else if (form.ifscCode !== 'NA') {
    errors.push('IFSC Code must be NA for a non-Indian country.')
  }

  if (form.industryKey === 'H300' && form.msmeNumber.trim()) {
    errors.push('MSME Number is not allowed for industry H300.')
  }

  if (
    MSME_REQUIRED_INDUSTRIES.includes(form.industryKey) &&
    form.paymentTerms &&
    form.paymentTerms !== 'H045'
  ) {
    errors.push('Selected industry requires Payment Terms H045.')
  }

  if (form.industryKey && form.industryKey !== 'H300') {
    if (!form.msmeNumber.trim()) {
      errors.push('MSME Registration Number is required.')
    } else if (!/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(form.msmeNumber)) {
      errors.push('Enter MSME Number in UDYAM-XX-00-0000000 format.')
    }

    if (!files.msme) {
      errors.push('MSME document is required.')
    }
  }

  if (!form.purpose) {
    errors.push('Purpose is required.')
  }

  if (form.purpose === '7' && !form.employeeCode.trim()) {
    errors.push('Employee Code is required for this purpose.')
  }

  if (form.pan.trim()) {
    if (form.pan.length !== 10) {
      errors.push('PAN must contain 10 characters.')
    }

    if (form.pan[3] === 'C' && form.cin.length !== 21) {
      errors.push('CIN must contain 21 characters for this PAN type.')
    }

    if (form.pan[3] === 'P' && !files.aadhaar) {
      errors.push('Aadhaar document is required for this PAN type.')
    }
  } else if (form.accountGroup === 'H002') {
    // Keep the existing legacy conditional branch.
  }

  if (!form.name1.trim()) {
    errors.push('Name 1 is required.')
  }

  if (
    form.name2.trim() &&
    form.name1.trim().toLowerCase() === form.name2.trim().toLowerCase()
  ) {
    errors.push('Name 2 cannot be the same as Name 1.')
  }

  if (!form.legalName.trim()) {
    errors.push('Legal Name is required.')
  }

  if (!form.searchTerm1.trim()) {
    errors.push('Search Term 1 is required.')
  }

  if (!form.address1.trim()) {
    errors.push('Address Line 1 is required.')
  }

  if (!form.postalCode.trim() && form.accountGroup !== 'H002') {
    errors.push('Postal Code is required.')
  }

  if (!form.city.trim()) {
    errors.push('City is required.')
  }

  if (!/^\d{10}$/.test(form.mobile)) {
    errors.push('Mobile Number must contain exactly 10 digits.')
  }

  if (!form.region && form.accountGroup !== 'H002') {
    errors.push('Region is required.')
  }

  if (!form.companyCode) {
    errors.push('Company Code is required.')
  }

  if (!form.reconciliationAccount) {
    errors.push('Reconciliation Account is required.')
  }

  if (!form.orderCurrency) {
    errors.push('Order Currency is required.')
  }

  if (!form.purchaseOrg) {
    errors.push('Purchase Organization is required.')
  }

  if (!form.accountGroup) {
    errors.push('Account Group is required.')
  }

  if (!form.industryKey) {
    errors.push('Industry Key is required.')
  }

  if (!form.paymentTerms) {
    errors.push('Payment Terms is required.')
  }

  if (!form.paymentMethod) {
    errors.push('Payment Method is required.')
  }

  if (!form.withholdingCountryKey.trim()) {
    errors.push('Tax Country Key is required.')
  }

  if (form.purpose === '9') {
    if (!form.purposeRemark.trim()) {
      errors.push('Purpose remark is required.')
    } else if (form.purposeRemark.trim().length <= 10) {
      errors.push('Minimum character for purpose remark is 10.')
    }
  }

  if (form.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(form.email)) {
      errors.push('Enter a valid Email Address.')
    }
  }

  if (form.gstn && form.gstn !== 'NA') {
    const gstRegex =
      /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9]){1}([a-zA-Z]){1}([0-9a-zA-Z]){1}?$/

    if (!gstRegex.test(form.gstn)) {
      errors.push('Enter a valid GSTN.')
    }
  }

  if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) {
    errors.push('Enter a valid PAN.')
  }

  for (const [field, file] of Object.entries(files)) {
    const fileError = validateFile(file, form.purpose, field)

    if (fileError) {
      errors.push(fileError)
    }
  }

  return errors
}

export default function Creation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const vendorId = searchParams.get('id')
  const isEditMode = Boolean(vendorId)

  const [form, setForm] = useState(INITIAL_FORM)
  const [files, setFiles] = useState(EMPTY_FILES)
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isMSMEEnabled = Boolean(
    form.industryKey && form.industryKey !== 'H300',
  )

  const isGSTNEnabled = form.rcmVendor !== 'Yes'
  const isCINVisible = form.pan[3] === 'C'
  const isAadhaarRequired = form.pan[3] === 'P'

  const previewUrls = useMemo(() => {
    return Object.fromEntries(
      Object.entries(files).map(([key, file]) => [
        key,
        file && file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null,
      ]),
    )
  }, [files])

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [previewUrls])

  useEffect(() => {
    if (form.rcmVendor === 'Yes') {
      setForm((current) => ({
        ...current,
        gstn: 'NA',
      }))
    } else if (form.gstn === 'NA') {
      setForm((current) => ({
        ...current,
        gstn: '',
      }))
    }
  }, [form.rcmVendor])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      purchaseOrg: '',
    }))
  }, [form.companyCode])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setMessage('')
  }

  function updateFile(field, file) {
    setFiles((current) => ({
      ...current,
      [field]: file,
    }))

    setMessage('')
  }

  function handleGstnChange(value) {
    const gstn = value.toUpperCase()

    setForm((current) => ({
      ...current,
      gstn,
      ...(gstn.length >= 12
        ? { pan: gstn.substring(2, 12) }
        : {}),
    }))

    setMessage('')
  }

  function handlePanChange(value) {
    setForm((current) => ({
      ...current,
      pan: value.toUpperCase(),
    }))

    setMessage('')
  }

  function handleIndustryChange(value) {
    setForm((current) => ({
      ...current,
      industryKey: value,
      ...(value === 'H300' ? { msmeNumber: '' } : {}),
    }))

    if (value === 'H300') {
      setFiles((current) => ({
        ...current,
        msme: null,
      }))
    }

    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setErrors([])

    const validationErrors = validateForm(form, files)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // API integration is pending; no data is saved yet.
    setIsSubmitting(true)

    try {
      setMessage(
        'Validation passed. The Vendor API is not connected yet, so no data has been saved.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM)
    setFiles(EMPTY_FILES)
    setErrors([])
    setMessage('')
  }

  return (
    <DashboardLayout title="Vendor Details">
      <div className="vendor-creation-page">
        <div className="vendor-page-header">
          <div className="vendor-header-actions">
            <button
              type="button"
              className="vendor-btn vendor-btn-secondary"
              onClick={() => navigate('/vendor/view')}
            >
              View Vendors
            </button>

            <button
              type="submit"
              form="vendor-creation-form"
              className="vendor-btn vendor-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : isEditMode
                  ? 'Update'
                  : 'Save'}
            </button>
          </div>
        </div>

        <div className="vendor-api-notice">
          <strong>Development mode:</strong> Dropdown data and saving are not
          connected to the backend API yet.
        </div>

        {errors.length > 0 && (
          <div className="vendor-alert vendor-alert-error">
            <strong>Please correct the following:</strong>
            <ul>
              {errors.map((error, index) => (
                <li key={`${index}-${error}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {message && (
          <div className="vendor-alert vendor-alert-info">
            {message}
          </div>
        )}

        <form
          id="vendor-creation-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="vendor-section vendor-purpose-section">
            <h2>Purpose</h2>

            <div className="vendor-grid vendor-grid-2">
              <SelectField
                label="Purpose"
                required
                value={form.purpose}
                onChange={(value) => updateField('purpose', value)}
                options={PURPOSE_OPTIONS}
              />

              <TextField
                label="Purpose Remark"
                value={form.purposeRemark}
                onChange={(value) => updateField('purposeRemark', value)}
                maxLength={64}
                placeholder="Minimum 10 characters when required"
              />

              {form.purpose === '7' && (
                <TextField
                  label="Employee Code"
                  value={form.employeeCode}
                  onChange={(value) => updateField('employeeCode', value)}
                  maxLength={10}
                  required
                />
              )}
            </div>
          </section>

          {/* Personal Details: six fields in one row */}
          <section className="vendor-section">
            <h2>Personal Details</h2>

            <div className="vendor-grid vendor-grid-6">
              <SelectField
                label="Title"
                value={form.title}
                onChange={(value) => updateField('title', value)}
                options={TITLE_OPTIONS}
              />

              <TextField
                label="Name 1"
                required
                value={form.name1}
                onChange={(value) => updateField('name1', value)}
                maxLength={50}
              />

              <TextField
                label="Name 2"
                value={form.name2}
                onChange={(value) => updateField('name2', value)}
                maxLength={50}
              />

              <TextField
                label="Legal Name"
                required
                value={form.legalName}
                onChange={(value) => updateField('legalName', value)}
                maxLength={50}
              />

              <TextField
                label="Search Term 1"
                required
                value={form.searchTerm1}
                onChange={(value) => updateField('searchTerm1', value)}
                maxLength={50}
              />

              <TextField
                label="Search Term 2"
                value={form.searchTerm2}
                onChange={(value) => updateField('searchTerm2', value)}
                maxLength={80}
              />
            </div>
          </section>

          {/* Contact Details: two rows with six fields per row */}
          <section className="vendor-section">
            <h2>Contact Details</h2>

            {/* Row 1 */}
            <div className="vendor-grid vendor-grid-6 vendor-contact-row">
              <TextField
                label="Address Line 1"
                required
                value={form.address1}
                onChange={(value) => updateField('address1', value)}
                maxLength={100}
              />

              <TextField
                label="Address Line 2"
                value={form.address2}
                onChange={(value) => updateField('address2', value)}
                maxLength={100}
              />

              <TextField
                label="Address Line 3"
                value={form.address3}
                onChange={(value) => updateField('address3', value)}
                maxLength={100}
              />

              <TextField
                label="Postal Code"
                required={form.accountGroup !== 'H002'}
                value={form.postalCode}
                onChange={(value) => updateField('postalCode', value)}
                maxLength={10}
              />

              <TextField
                label="City"
                required
                value={form.city}
                onChange={(value) => updateField('city', value)}
                maxLength={50}
              />

              <TextField
                label="Country"
                value={form.country}
                onChange={(value) => updateField('country', value)}
                maxLength={50}
              />
            </div>

            {/* Row 2 */}
            <div className="vendor-grid vendor-grid-6 vendor-contact-row vendor-contact-row-2">
              <TextField
                label="Mobile Number"
                required
                value={form.mobile}
                onChange={(value) =>
                  updateField('mobile', value.replace(/\D/g, '').slice(0, 10))
                }
                maxLength={10}
              />

              <TextField
                label="Telephone Extension"
                value={form.telephoneExt}
                onChange={(value) =>
                  updateField('telephoneExt', value.replace(/\D/g, '').slice(0, 5))
                }
                maxLength={5}
              />

              <TextField
                label="Telephone"
                value={form.telephone}
                onChange={(value) =>
                  updateField('telephone', value.replace(/\D/g, '').slice(0, 10))
                }
                maxLength={10}
              />

              <TextField
                label="Fax Extension"
                value={form.faxExt}
                onChange={(value) =>
                  updateField('faxExt', value.replace(/\D/g, '').slice(0, 5))
                }
                maxLength={5}
              />

              <TextField
                label="Fax"
                value={form.fax}
                onChange={(value) =>
                  updateField('fax', value.replace(/\D/g, '').slice(0, 12))
                }
                maxLength={12}
              />

              <SelectField
                label="Region"
                required={form.accountGroup !== 'H002'}
                value={form.region}
                onChange={(value) => updateField('region', value)}
                options={REGION_OPTIONS}
              />

              <TextField
                label="Email"
                value={form.email}
                onChange={(value) => updateField('email', value.toLowerCase())}
                maxLength={100}
                type="email"
              />
            </div>
          </section>

          {/* Bank Details */}
          <section className="vendor-section">
            <h2>Bank Details</h2>

            <div className="vendor-grid vendor-grid-5">
              <SelectField
                label="Account Type"
                value={form.accountType}
                onChange={(value) => updateField('accountType', value)}
                options={[
                  { value: 'SAV', label: 'Savings' },
                  { value: 'CUR', label: 'Current' },
                  { value: 'SAL', label: 'Salary' },
                  { value: 'FD', label: 'Fixed Deposit' },
                ]}
              />

              <TextField
                label="Bank Name"
                required
                value={form.bankName}
                onChange={(value) => updateField('bankName', value)}
                maxLength={50}
              />

              <TextField
                label="Bank Account Name"
                required
                value={form.bankAccountName}
                onChange={(value) => updateField('bankAccountName', value)}
                maxLength={50}
              />

              <TextField
                label="Bank Account Number"
                required
                value={form.bankAccountNumber}
                onChange={(value) =>
                  updateField(
                    'bankAccountNumber',
                    value.replace(/\D/g, '').slice(0, 20),
                  )
                }
                maxLength={20}
              />

              <TextField
                label="IFSC Code"
                required
                value={form.ifscCode}
                onChange={(value) => updateField('ifscCode', value)}
                maxLength={15}
                uppercase
              />
            </div>
          </section>

          {/* Other Details */}
          <section className="vendor-section">
            <h2>Other Details</h2>

            <div className="vendor-grid vendor-grid-3">
              <SelectField
                label="Company Code"
                required
                value={form.companyCode}
                onChange={(value) => updateField('companyCode', value)}
                options={COMPANY_OPTIONS}
              />

              <SelectField
                label="Purchase Organization"
                required
                value={form.purchaseOrg}
                onChange={(value) => updateField('purchaseOrg', value)}
                options={PURCHASE_ORG_OPTIONS.filter(
                  (option) =>
                    !option.companyCode ||
                    option.companyCode === form.companyCode,
                )}
                disabled={!form.companyCode}
              />

              <SelectField
                label="Reconciliation Account"
                required
                value={form.reconciliationAccount}
                onChange={(value) =>
                  updateField('reconciliationAccount', value)
                }
                options={RECONCILIATION_OPTIONS}
              />

              <SelectField
                label="Order Currency"
                required
                value={form.orderCurrency}
                onChange={(value) => updateField('orderCurrency', value)}
                options={CURRENCY_OPTIONS}
              />

              <SelectField
                label="Account Group"
                required
                value={form.accountGroup}
                onChange={(value) => updateField('accountGroup', value)}
                options={ACCOUNT_GROUP_OPTIONS}
              />

              <SelectField
                label="Industry Key"
                required
                value={form.industryKey}
                onChange={handleIndustryChange}
                options={INDUSTRY_OPTIONS}
              />

              <SelectField
                label="Payment Terms"
                required
                value={form.paymentTerms}
                onChange={(value) => updateField('paymentTerms', value)}
                options={PAYMENT_TERM_OPTIONS}
              />

              <SelectField
                label="Payment Method"
                required
                value={form.paymentMethod}
                onChange={(value) => updateField('paymentMethod', value)}
                options={PAYMENT_METHOD_OPTIONS}
              />

              <TextField
                label="MSME Registration Number"
                value={form.msmeNumber}
                onChange={(value) =>
                  updateField('msmeNumber', value.toUpperCase())
                }
                maxLength={50}
                disabled={!isMSMEEnabled}
                required={isMSMEEnabled}
              />

              <FileField
                label="MSME Document"
                file={files.msme}
                onChange={(file) => updateFile('msme', file)}
                required={isMSMEEnabled}
              />

              <TextField
                label="Customer"
                value={form.customer}
                onChange={(value) => updateField('customer', value)}
                maxLength={100}
              />

              <TextField
                label="Recipient Type"
                value={form.recipientType}
                onChange={(value) => updateField('recipientType', value)}
                maxLength={20}
              />

              <TextField
                label="Vendor Code"
                value={form.vendorCode}
                onChange={(value) => updateField('vendorCode', value)}
                maxLength={20}
                disabled
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => updateField('status', value)}
                options={[
                  { value: '1', label: 'Open' },
                  { value: '2', label: 'SUBMITTED' },
                  { value: '3', label: 'CANCELLED' },
                ]}
                disabled={isEditMode}
              />
            </div>
          </section>

          {/* GSTN, PAN and Other Details */}
          <section className="vendor-section">
            <h2>GSTN, PAN &amp; Other Details</h2>

            <div className="vendor-grid vendor-grid-3">
              <SelectField
                label="RCM / Unregistered Vendor"
                value={form.rcmVendor}
                onChange={(value) => updateField('rcmVendor', value)}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
              />

              <SelectField
                label="GST Vendor Classification"
                value={form.gstVendorClassification}
                onChange={(value) =>
                  updateField('gstVendorClassification', value)
                }
                options={CLASSIFICATION_OPTIONS}
              />

              <TextField
                label="GSTN"
                value={form.gstn}
                onChange={handleGstnChange}
                maxLength={20}
                disabled={!isGSTNEnabled}
                uppercase
              />

              <TextField
                label="PAN"
                value={form.pan}
                onChange={handlePanChange}
                maxLength={10}
                uppercase
              />

              {isCINVisible && (
                <TextField
                  label="CIN"
                  value={form.cin}
                  onChange={(value) => updateField('cin', value.toUpperCase())}
                  maxLength={21}
                  required
                  uppercase
                />
              )}

              <TextField
                label="Other File Description"
                value={form.otherFileText}
                onChange={(value) => updateField('otherFileText', value)}
              />

              <FileField
                label="GSTN Certificate"
                file={files.gstn}
                onChange={(file) => updateFile('gstn', file)}
              />

              <FileField
                label="PAN Card"
                file={files.pan}
                onChange={(file) => updateFile('pan', file)}
              />

              <FileField
                label="Other Document"
                file={files.other}
                onChange={(file) => updateFile('other', file)}
              />

              <FileField
                label="TDS Document"
                file={files.tds}
                onChange={(file) => updateFile('tds', file)}
              />

              <TextField
                label="Withholding Tax Country Key"
                value={form.withholdingCountryKey}
                onChange={(value) =>
                  updateField('withholdingCountryKey', value)
                }
                maxLength={20}
                required
              />

              <TextField
                label="Withholding Tax Type"
                value={form.withholdingTaxType}
                onChange={(value) => updateField('withholdingTaxType', value)}
                maxLength={20}
              />

              <SelectField
                label="Withholding Tax Code"
                value={form.withholdingTaxCode}
                onChange={(value) =>
                  updateField('withholdingTaxCode', value)
                }
                options={TAX_CODE_OPTIONS}
              />

              <SelectField
                label="194Q Applicable"
                value={form.q194}
                onChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    q194: value,
                    taxCode195Q: value === '1' ? '5W,4W' : '',
                  }))
                  setMessage('')
                }}
                options={[
                  { value: '1', label: 'Yes' },
                  { value: '0', label: 'No' },
                ]}
              />

              <TextField
                label="195Q Tax Code"
                value={form.taxCode195Q}
                onChange={(value) => updateField('taxCode195Q', value)}
                maxLength={20}
                disabled={form.q194 !== '1'}
              />

              <FileField
                label="194Q Acknowledgement"
                file={files.acknowledgement}
                onChange={(file) => updateFile('acknowledgement', file)}
                required
              />

              <FileField
                label="Aadhaar Card"
                file={files.aadhaar}
                onChange={(file) => updateFile('aadhaar', file)}
                required={isAadhaarRequired}
              />

              <SelectField
                label="E-Invoice"
                value={form.eInvoice}
                onChange={(value) => updateField('eInvoice', value)}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
              />
            </div>

            <div className="vendor-preview-grid">
              {Object.entries(files).map(([key, file]) => {
                if (!file) return null

                return (
                  <div className="vendor-preview" key={key}>
                    <strong>{key.toUpperCase()}</strong>
                    <span>{file.name}</span>

                    {previewUrls[key] && (
                      <img src={previewUrls[key]} alt={`${key} preview`} />
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          
        </form>

        <p className="vendor-dropdown-note">
          {EMPTY_OPTIONS_MESSAGE}
        </p>
      </div>
    </DashboardLayout>
  )
}
