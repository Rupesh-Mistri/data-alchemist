'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface SearchBarProps {
    onSearch: (query: string) => void
    placeholder?: string
}

export default function SearchBar({
    onSearch,
    placeholder = "Search data or use natural language queries..."
}: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [showExamples, setShowExamples] = useState(false)

    const handleSearch = useCallback(() => {
        onSearch(query)
    }, [query, onSearch])

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }, [handleSearch])

    const clearSearch = useCallback(() => {
        setQuery('')
        onSearch('')
    }, [onSearch])

    const exampleQueries = [
        "show all tasks longer than 2 phases",
        "find workers with JavaScript skills",
        "clients with priority above 8",
        "tasks for client C1",
        "workers available more than 80%"
    ]

    const insertExample = useCallback((example: string) => {
        setQuery(example)
        onSearch(example)
        setShowExamples(false)
    }, [onSearch])

    return (
        <div className="relative">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowExamples(!showExamples)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Show search examples"
                    >
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Search Examples */}
            {showExamples && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Search Examples</h4>
                        <div className="space-y-2">
                            {exampleQueries.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => insertExample(example)}
                                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                You can use natural language queries like "show tasks with more than 3 phases"
                                or simple text search for names, IDs, and values.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Tips */}
            <div className="mt-2 text-xs text-gray-500">
                <p>
                    💡 Try: &quot;phases &gt; 2&quot;, &quot;skills: JavaScript&quot;, &quot;priority: high&quot;, or natural language queries
                </p>
            </div>
        </div>
    )
} 