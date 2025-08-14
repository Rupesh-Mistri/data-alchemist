'use client'

import { useState, useCallback, useEffect } from 'react'
import { Download, Upload, Search, Settings, BarChart3 } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import DataTable from '@/components/DataTable'
import BusinessRules from '@/components/BusinessRules'
import PrioritySettings from '@/components/PrioritySettings'
import SearchBar from '@/components/SearchBar'
import ValidationSummary from '@/components/ValidationSummary'
import {
  Client,
  Worker,
  Task,
  BusinessRule,
  ValidationError,
  PrioritySettings as PrioritySettingsType,
  ExportData
} from '@/types'
import {
  validateClients,
  validateWorkers,
  validateTasks,
  searchData,
  exportToJSON,
  exportToCSV
} from '@/lib/utils'

export default function Home() {
  // Data state
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState<'data' | 'rules' | 'priorities'>('data')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredData, setFilteredData] = useState<{
    clients: Client[]
    workers: Worker[]
    tasks: Task[]
  }>({ clients: [], workers: [], tasks: [] })

  // Business rules and priorities
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([])
  const [priorities, setPriorities] = useState<PrioritySettingsType>({
    clientValue: 25,
    workloadBalance: 25,
    skillMatch: 25,
    deadlineUrgency: 25
  })

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  // Handle file uploads
  const handleFileUpload = useCallback((data: any[], filename: string) => {
    const lowerFilename = filename.toLowerCase()

    if (lowerFilename.includes('client')) {
      setClients(data)
    } else if (lowerFilename.includes('worker')) {
      setWorkers(data)
    } else if (lowerFilename.includes('task')) {
      setTasks(data)
    }
  }, [])

  // Validate data whenever it changes
  useEffect(() => {
    const clientErrors = validateClients(clients, tasks)
    const workerErrors = validateWorkers(workers)
    const taskErrors = validateTasks(tasks, clients, workers)

    setValidationErrors([...clientErrors, ...workerErrors, ...taskErrors])
  }, [clients, workers, tasks])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchData(query, clients, workers, tasks)
      setFilteredData(results)
    } else {
      setFilteredData({ clients, workers, tasks })
    }
  }, [clients, workers, tasks])

  // Update filtered data when main data changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchData(searchQuery, clients, workers, tasks)
      setFilteredData(results)
    } else {
      setFilteredData({ clients, workers, tasks })
    }
  }, [clients, workers, tasks, searchQuery])

  // Handle data changes
  const handleClientsChange = useCallback((newClients: any[]) => {
    setClients(newClients)
  }, [])

  const handleWorkersChange = useCallback((newWorkers: any[]) => {
    setWorkers(newWorkers)
  }, [])

  const handleTasksChange = useCallback((newTasks: any[]) => {
    setTasks(newTasks)
  }, [])

  // Handle validation fix suggestions
  const handleFixSuggestion = useCallback((error: ValidationError, suggestion: string) => {
    // This would implement the actual fix logic
    console.log('Applying fix:', error, suggestion)
  }, [])

  // Export functionality
  const handleExport = useCallback(() => {
    const exportData: ExportData = {
      clients,
      workers,
      tasks,
      rules: businessRules,
      priorities,
      validationErrors
    }

    exportToJSON(exportData, 'resource-allocation-data.json')
  }, [clients, workers, tasks, businessRules, priorities, validationErrors])

  const handleExportCSV = useCallback(() => {
    if (clients.length > 0) exportToCSV(clients, 'clients.csv')
    if (workers.length > 0) exportToCSV(workers, 'workers.csv')
    if (tasks.length > 0) exportToCSV(tasks, 'tasks.csv')
  }, [clients, workers, tasks])

  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resource Allocation Tool
              </h1>
              <p className="text-sm text-gray-500">
                AI-powered spreadsheet cleaner and configuration tool
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {hasData && (
                <>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasData ? (
          /* Upload Section */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Resource Allocation Tool
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your client, worker, and task spreadsheets to get started.
                Our AI will help you clean, validate, and configure your data for optimal resource allocation.
              </p>
            </div>

            <FileUpload onFileUpload={handleFileUpload} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-white rounded-lg shadow">
                <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>
                <p className="text-sm text-gray-500">
                  Upload your CSV or Excel files containing clients, workers, and tasks data.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow">
                <Search className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Validate & Clean</h3>
                <p className="text-sm text-gray-500">
                  Our AI will automatically detect and suggest fixes for data issues.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow">
                <Settings className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configure Rules</h3>
                <p className="text-sm text-gray-500">
                  Set business rules and priorities for optimal resource allocation.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Main Application */
          <div className="space-y-6">
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Validation Summary */}
            {validationErrors.length > 0 && (
              <ValidationSummary
                errors={validationErrors}
                onFixSuggestion={handleFixSuggestion}
              />
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'data', label: 'Data Tables', icon: BarChart3 },
                    { id: 'rules', label: 'Business Rules', icon: Settings },
                    { id: 'priorities', label: 'Priorities', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    {clients.length > 0 && (
                      <DataTable
                        data={filteredData.clients}
                        title="Clients"
                        validationErrors={validationErrors.filter(e => e.id.startsWith('client-'))}
                        onDataChange={handleClientsChange}
                        searchQuery={searchQuery}
                      />
                    )}

                    {workers.length > 0 && (
                      <DataTable
                        data={filteredData.workers}
                        title="Workers"
                        validationErrors={validationErrors.filter(e => e.id.startsWith('worker-'))}
                        onDataChange={handleWorkersChange}
                        searchQuery={searchQuery}
                      />
                    )}

                    {tasks.length > 0 && (
                      <DataTable
                        data={filteredData.tasks}
                        title="Tasks"
                        validationErrors={validationErrors.filter(e => e.id.startsWith('task-'))}
                        onDataChange={handleTasksChange}
                        searchQuery={searchQuery}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'rules' && (
                  <BusinessRules
                    rules={businessRules}
                    onRulesChange={setBusinessRules}
                    tasks={tasks}
                    workers={workers}
                  />
                )}

                {activeTab === 'priorities' && (
                  <PrioritySettings
                    priorities={priorities}
                    onPrioritiesChange={setPriorities}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
