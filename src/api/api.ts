const BASE_URL = '' // Uses Vite proxy

export type UserInfoDto = {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
}

export type AuthResponseDto = {
  token: string
  expiration: string
  role: string
  fullName: string
}

export type PendingUserDto = {
  id: string
  email: string
  fullName: string
  role: string
  registeredAt: string
}

export type UserDto = {
  id: string
  email: string
  fullName: string
  role: string
  registeredAt: string
  isApproved: boolean
  approvedAt?: string
  approvedById?: string
}

export type PatientListDto = {
  id: number
  firstName: string
  lastName: string
  pesel: string
  phoneNumber: string
  email: string
}

export type PatientDetailDto = {
  id: number
  firstName: string
  lastName: string
  pesel: string
  dateOfBirth: string
  phoneNumber: string
  email: string
  createdAt: string
}

export type CreatePatientDto = {
  firstName: string
  lastName: string
  pesel: string
  dateOfBirth: string
  phoneNumber: string
  email: string
}

export type UpdatePatientDto = {
  firstName: string
  lastName: string
  pesel: string
  dateOfBirth: string
  phoneNumber: string
  email: string
}

export type MedicalRecordDto = {
  id: number
  patientId: number
  insuranceNumber: string
  bloodType: string | null
  allergies: string | null
  notes: string | null
}

export type CreateMedicalRecordDto = {
  insuranceNumber: string
  bloodType?: string | null
  allergies?: string | null
  notes?: string | null
}

export type UpdateMedicalRecordDto = {
  insuranceNumber: string
  bloodType?: string | null
  allergies?: string | null
  notes?: string | null
}

export type MedicalDocumentDto = {
  id: number
  medicalRecordId: number
  fileName: string
  fileUrl: string
  filePath?: string
  description: string | null
  uploadedAt: string
}

export type MedicationListDto = {
  id: number
  name: string
  unitPrice: number
  description: string | null
}

export type VisitStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled'
export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  Planned: 'Zaplanowana',
  InProgress: 'W trakcie',
  Completed: 'Zakończona',
  Cancelled: 'Anulowana',
}

export type VisitDto = {
  id: number
  patientId: number
  patientFullName: string
  patientPesel: string
  doctorId: string
  doctorFullName: string
  scheduledAt: string
  status: VisitStatus
  notes?: string
}

export type CreateVisitDto = {
  patientId: number
  doctorId: string
  scheduledAt: string
  notes?: string
}

export type UpdateVisitDto = {
  patientId: number
  doctorId: string
  scheduledAt: string
}

export type VisitFilterDto = {
  page?: number
  pageSize?: number
  doctorId?: string
  patientId?: number
  status?: VisitStatus
  dateFrom?: string
  dateTo?: string
}

export type PagedVisitsResponse = {
  items: VisitDto[]
  totalCount: number
  page: number
  pageSize: number
}

export type ClinicalNoteType = 'Interview' | 'Diagnosis' | 'Recommendations'

export const CLINICAL_NOTE_TYPE_LABELS: Record<ClinicalNoteType, string> = {
  Interview: 'Wywiad',
  Diagnosis: 'Rozpoznanie',
  Recommendations: 'Zalecenia',
}

export type ClinicalNoteDto = {
  id: number
  visitId: number
  authorId: string
  authorFullName: string
  content: string
  noteType: ClinicalNoteType
  timestamp: string
}

export type CreateClinicalNoteDto = {
  content: string
  noteType: number
}

export type UpdateClinicalNoteDto = {
  content: string
  noteType: number
}

export type PrescriptionDto = {
  id: number
  visitId: number
  medicationId: number
  medicationName: string
  unitPrice: number
  dosage: string
  quantity: number
  totalCost: number
}

export type CreatePrescriptionDto = {
  medicationId: number
  dosage: string
  quantity: number
}

export type ProcedureDto = {
  id: number
  name: string
  description: string
  defaultCost: number
  isActive: boolean
  createdAt: string
}

export type CreateProcedureDto = {
  name: string
  description: string
  defaultCost: number
}

export type UpdateProcedureDto = {
  name: string
  description: string
  defaultCost: number
  isActive: boolean
}

export type ProcedurePerformedDto = {
  id: number
  visitId: number
  procedureId: number
  procedureName: string
  description: string
  serviceCost: number
}

export type CreateProcedurePerformedDto = {
  procedureId: number
  description: string
  serviceCost?: number
}

export type CostReportItemDto = {
  visitId: number
  scheduledAt: string
  patientFullName: string
  doctorFullName: string
  status: string
  proceduresCost: number
  medicationsCost: number
  totalCost: number
  proceduresCount: number
  medicationsCount: number
}

export type CostReportDto = {
  generatedAt: string
  filterDescription: string
  totalVisits: number
  totalProceduresCost: number
  totalMedicationsCost: number
  grandTotal: number
  items: CostReportItemDto[]
}

export type CostReportFilterDto = {
  patientId?: number
  doctorId?: string
  dateFrom?: string
  dateTo?: string
}


// Helpers
function getHeaders(isMultipart = false): HeadersInit {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Błąd serwera: ${response.status}`
    try {
      const errorData = await response.json()
      if (errorData && errorData.message) {
        errorMessage = errorData.message
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage)
  }
  
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// API methods
export const api = {
  // Auth
  auth: {
    login: async (dto: any): Promise<AuthResponseDto> => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      })
      const data = await handleResponse<AuthResponseDto>(res)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('fullName', data.fullName)
      return data
    },
    register: async (dto: any): Promise<{ message: string }> => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      })
      return handleResponse<{ message: string }>(res)
    },
    me: async (): Promise<UserInfoDto> => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: getHeaders(),
      })
      return handleResponse<UserInfoDto>(res)
    },
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('fullName')
    },
    isAuthenticated: (): boolean => {
      return !!localStorage.getItem('token')
    },
    getRole: (): string | null => {
      return localStorage.getItem('role')
    },
    getFullName: (): string | null => {
      return localStorage.getItem('fullName')
    }
  },

  // Admin
  admin: {
    getPendingUsers: async (): Promise<PendingUserDto[]> => {
      const res = await fetch(`${BASE_URL}/api/admin/users/pending`, {
        headers: getHeaders(),
      })
      return handleResponse<PendingUserDto[]>(res)
    },
    getAllUsers: async (): Promise<UserDto[]> => {
      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: getHeaders(),
      })
      return handleResponse<UserDto[]>(res)
    },
    approveUser: async (id: string): Promise<{ message: string }> => {
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
      })
      return handleResponse<{ message: string }>(res)
    },
    rejectUser: async (id: string): Promise<{ message: string }> => {
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
      })
      return handleResponse<{ message: string }>(res)
    },
  },

  // Patients
  patients: {
    getAll: async (): Promise<PatientListDto[]> => {
      const res = await fetch(`${BASE_URL}/api/Patients`, {
        headers: getHeaders(),
      })
      return handleResponse<PatientListDto[]>(res)
    },
    search: async (query: string): Promise<PatientListDto[]> => {
      const res = await fetch(`${BASE_URL}/api/Patients/search?query=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
      })
      return handleResponse<PatientListDto[]>(res)
    },
    getById: async (id: number): Promise<PatientDetailDto> => {
      const res = await fetch(`${BASE_URL}/api/Patients/${id}`, {
        headers: getHeaders(),
      })
      return handleResponse<PatientDetailDto>(res)
    },
    create: async (dto: CreatePatientDto): Promise<PatientDetailDto> => {
      const res = await fetch(`${BASE_URL}/api/Patients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<PatientDetailDto>(res)
    },
    update: async (id: number, dto: UpdatePatientDto): Promise<PatientDetailDto> => {
      const res = await fetch(`${BASE_URL}/api/Patients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<PatientDetailDto>(res)
    },
    delete: async (id: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/Patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<void>(res)
    },
    getVisits: async (id: number): Promise<VisitDto[]> => {
      const res = await fetch(`${BASE_URL}/api/Patients/${id}/visits`, {
        headers: getHeaders(),
      })
      return handleResponse<VisitDto[]>(res)
    },
  },

  // Medical Records
  medicalRecords: {
    getByPatientId: async (patientId: number): Promise<MedicalRecordDto | null> => {
      try {
        const res = await fetch(`${BASE_URL}/api/patients/${patientId}/record`, {
          headers: getHeaders(),
        })
        if (res.status === 404) return null
        return await handleResponse<MedicalRecordDto>(res)
      } catch {
        return null
      }
    },
    create: async (patientId: number, dto: CreateMedicalRecordDto): Promise<MedicalRecordDto> => {
      const res = await fetch(`${BASE_URL}/api/patients/${patientId}/record`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<MedicalRecordDto>(res)
    },
    update: async (patientId: number, dto: UpdateMedicalRecordDto): Promise<MedicalRecordDto> => {
      const res = await fetch(`${BASE_URL}/api/patients/${patientId}/record`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<MedicalRecordDto>(res)
    },
  },

  // Medical Documents
  documents: {
    getAll: async (patientId: number): Promise<MedicalDocumentDto[]> => {
      const res = await fetch(`${BASE_URL}/api/patients/${patientId}/record/documents`, {
        headers: getHeaders(),
      })
      return handleResponse<MedicalDocumentDto[]>(res)
    },
    upload: async (patientId: number, file: File, description: string): Promise<MedicalDocumentDto> => {
      const formData = new FormData()
      formData.append('File', file)
      formData.append('Description', description)
      
      const res = await fetch(`${BASE_URL}/api/patients/${patientId}/record/documents`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      })
      return handleResponse<MedicalDocumentDto>(res)
    },
    delete: async (patientId: number, documentId: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/patients/${patientId}/record/documents/${documentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<void>(res)
    },
  },

  // Visits
  visits: {
    getAll: async (filters: VisitFilterDto): Promise<PagedVisitsResponse> => {
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      if (filters.doctorId) params.append('doctorId', filters.doctorId)
      if (filters.patientId) params.append('patientId', filters.patientId.toString())
      if (filters.status !== undefined) params.append('status', filters.status.toString())
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const res = await fetch(`${BASE_URL}/api/visits?${params.toString()}`, {
        headers: getHeaders(),
      })
      return handleResponse<PagedVisitsResponse>(res)
    },
    getToday: async (): Promise<VisitDto[]> => {
      const res = await fetch(`${BASE_URL}/api/visits/today`, {
        headers: getHeaders(),
      })
      return handleResponse<VisitDto[]>(res)
    },
    getActive: async (): Promise<VisitDto[]> => {
      const res = await fetch(`${BASE_URL}/api/visits/active`, {
        headers: getHeaders(),
      })
      return handleResponse<VisitDto[]>(res)
    },
    getById: async (id: number): Promise<VisitDto> => {
      const res = await fetch(`${BASE_URL}/api/visits/${id}`, {
        headers: getHeaders(),
      })
      return handleResponse<VisitDto>(res)
    },
    create: async (dto: CreateVisitDto): Promise<VisitDto> => {
      const res = await fetch(`${BASE_URL}/api/visits`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<VisitDto>(res)
    },
    update: async (id: number, dto: UpdateVisitDto): Promise<VisitDto> => {
      const res = await fetch(`${BASE_URL}/api/visits/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<VisitDto>(res)
    },
    cancel: async (id: number): Promise<{ message: string }> => {
      const res = await fetch(`${BASE_URL}/api/visits/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<{ message: string }>(res)
    },
    changeStatus: async (id: number, newStatus: number): Promise<{ message: string }> => {
      const res = await fetch(`${BASE_URL}/api/visits/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ newStatus }),
      })
      return handleResponse<{ message: string }>(res)
    },
    getPdfBlobUrl: async (id: number): Promise<string> => {
      const res = await fetch(`${BASE_URL}/api/visits/${id}/pdf`, {
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Błąd pobierania PDF karty wizyty')
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
    getPrescriptionPdfBlobUrl: async (id: number): Promise<string> => {
      const res = await fetch(`${BASE_URL}/api/visits/${id}/prescription-pdf`, {
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Błąd pobierania PDF recepty')
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
    proceduresPerformed: {
      getAll: async (visitId: number): Promise<ProcedurePerformedDto[]> => {
        const res = await fetch(`${BASE_URL}/api/visits/${visitId}/procedures`, {
          headers: getHeaders(),
        })
        return handleResponse<ProcedurePerformedDto[]>(res)
      },
      create: async (visitId: number, dto: CreateProcedurePerformedDto): Promise<ProcedurePerformedDto> => {
        const res = await fetch(`${BASE_URL}/api/visits/${visitId}/procedures`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(dto),
        })
        return handleResponse<ProcedurePerformedDto>(res)
      },
      delete: async (visitId: number, procedurePerformedId: number): Promise<void> => {
        const res = await fetch(`${BASE_URL}/api/visits/${visitId}/procedures/${procedurePerformedId}`, {
          method: 'DELETE',
          headers: getHeaders(),
        })
        return handleResponse<void>(res)
      },
    },
  },

  // Clinical Notes
  notes: {
    getAll: async (visitId: number): Promise<ClinicalNoteDto[]> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/notes`, {
        headers: getHeaders(),
      })
      return handleResponse<ClinicalNoteDto[]>(res)
    },
    create: async (visitId: number, dto: CreateClinicalNoteDto): Promise<ClinicalNoteDto> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<ClinicalNoteDto>(res)
    },
    update: async (visitId: number, noteId: number, dto: UpdateClinicalNoteDto): Promise<ClinicalNoteDto> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/notes/${noteId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<ClinicalNoteDto>(res)
    },
    delete: async (visitId: number, noteId: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<void>(res)
    },
  },

  // Prescriptions
  prescriptions: {
    getAll: async (visitId: number): Promise<PrescriptionDto[]> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/prescriptions`, {
        headers: getHeaders(),
      })
      return handleResponse<PrescriptionDto[]>(res)
    },
    create: async (visitId: number, dto: CreatePrescriptionDto): Promise<PrescriptionDto> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/prescriptions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<PrescriptionDto>(res)
    },
    delete: async (visitId: number, prescriptionId: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/visits/${visitId}/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<void>(res)
    },
  },

  // Procedures Catalog
  procedures: {
    getAll: async (onlyActive?: boolean): Promise<ProcedureDto[]> => {
      const url = onlyActive !== undefined ? `${BASE_URL}/api/procedures?onlyActive=${onlyActive}` : `${BASE_URL}/api/procedures`
      const res = await fetch(url, {
        headers: getHeaders(),
      })
      return handleResponse<ProcedureDto[]>(res)
    },
    getById: async (id: number): Promise<ProcedureDto> => {
      const res = await fetch(`${BASE_URL}/api/procedures/${id}`, {
        headers: getHeaders(),
      })
      return handleResponse<ProcedureDto>(res)
    },
    create: async (dto: CreateProcedureDto): Promise<ProcedureDto> => {
      const res = await fetch(`${BASE_URL}/api/procedures`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<ProcedureDto>(res)
    },
    update: async (id: number, dto: UpdateProcedureDto): Promise<ProcedureDto> => {
      const res = await fetch(`${BASE_URL}/api/procedures/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      })
      return handleResponse<ProcedureDto>(res)
    },
    delete: async (id: number): Promise<{ message: string }> => {
      const res = await fetch(`${BASE_URL}/api/procedures/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<{ message: string }>(res)
    },
  },

  // Reports
  reports: {
    getCosts: async (filter: CostReportFilterDto): Promise<CostReportDto> => {
      const params = new URLSearchParams()
      if (filter.patientId) params.append('patientId', filter.patientId.toString())
      if (filter.doctorId) params.append('doctorId', filter.doctorId)
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom)
      if (filter.dateTo) params.append('dateTo', filter.dateTo)
      
      const res = await fetch(`${BASE_URL}/api/reports/costs?${params.toString()}`, {
        headers: getHeaders(),
      })
      return handleResponse<CostReportDto>(res)
    },
    getCostsPdfBlobUrl: async (filter: CostReportFilterDto): Promise<string> => {
      const params = new URLSearchParams()
      if (filter.patientId) params.append('patientId', filter.patientId.toString())
      if (filter.doctorId) params.append('doctorId', filter.doctorId)
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom)
      if (filter.dateTo) params.append('dateTo', filter.dateTo)
      
      const res = await fetch(`${BASE_URL}/api/reports/costs/pdf?${params.toString()}`, {
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Błąd pobierania PDF raportu kosztów')
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
  },

  // Medications
  medications: {
    getAll: async (): Promise<MedicationListDto[]> => {
      const res = await fetch(`${BASE_URL}/api/Medications`, {
        headers: getHeaders(),
      })
      return handleResponse<MedicationListDto[]>(res)
    },
  },
}
