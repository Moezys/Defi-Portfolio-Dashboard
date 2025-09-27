'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { parseCSV, convertToHoldings, exportHoldingsToCSV, downloadCSV, CSVValidationError } from '@/lib/csv';
import { Holding } from '@/types';

interface CSVImportProps {
  onImport: (holdings: Holding[]) => void;
  currentHoldings: Holding[];
}

export default function CSVImport({ onImport, currentHoldings }: CSVImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<CSVValidationError[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setValidationErrors([]);
    setImportSuccess(false);

    try {
      const csvContent = await file.text();
      const { data, errors } = await parseCSV(csvContent);

      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsImporting(false);
        return;
      }

      const holdings = convertToHoldings(data);
      onImport(holdings);
      setImportSuccess(true);
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setValidationErrors([{
        row: 0,
        field: 'file',
        message: 'Failed to parse CSV file. Please check the format and try again.'
      }]);
    }

    setIsImporting(false);
  };

  const handleExport = () => {
    if (currentHoldings.length === 0) {
      alert('No holdings to export');
      return;
    }

    const csvContent = exportHoldingsToCSV(currentHoldings);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `defi-portfolio-${timestamp}.csv`);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      { symbol: 'BTC', amount: 0.5, acquisition_date: '2024-01-15', acquisition_price: 42000 },
      { symbol: 'ETH', amount: 2.5, acquisition_date: '2024-02-01', acquisition_price: 2800 },
      { symbol: 'ADA', amount: 1000, acquisition_date: '2024-02-15', acquisition_price: 0.65 }
    ];
    
    const csvContent = 'symbol,amount,acquisition_date,acquisition_price\n' +
      sampleData.map(row => `${row.symbol},${row.amount},${row.acquisition_date},${row.acquisition_price}`).join('\n');
    
    downloadCSV(csvContent, 'sample-holdings.csv');
  };

  const clearErrors = () => {
    setValidationErrors([]);
    setImportSuccess(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="csv-import">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Import/Export Holdings</h2>
        <div className="flex space-x-2">
          <button
            onClick={downloadSampleCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Sample CSV
          </button>
          <button
            onClick={handleExport}
            disabled={currentHoldings.length === 0}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
            data-testid="csv-file-input"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-900">
              {isImporting ? 'Processing...' : 'Upload CSV file'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              CSV with columns: symbol, amount, acquisition_date, acquisition_price (optional)
            </span>
          </label>
        </div>

        {/* Success Message */}
        {importSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4" data-testid="import-success-message">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Import Successful</h3>
                <p className="text-sm text-green-700">Your holdings have been imported successfully.</p>
              </div>
              <button
                onClick={clearErrors}
                className="text-green-400 hover:text-green-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4" data-testid="validation-errors">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Validation Errors ({validationErrors.length})
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        Row {error.row}, {error.field}: {error.message}
                      </li>
                    ))}
                    {validationErrors.length > 10 && (
                      <li className="text-red-600 font-medium">
                        ... and {validationErrors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <button
                onClick={clearErrors}
                className="text-red-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* CSV Format Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">CSV Format</h3>
              <p className="text-sm text-blue-700 mt-1">
                Required columns: <code className="bg-blue-100 px-1 rounded">symbol</code>, 
                <code className="bg-blue-100 px-1 rounded mx-1">amount</code>, 
                <code className="bg-blue-100 px-1 rounded">acquisition_date</code>
              </p>
              <p className="text-sm text-blue-700">
                Optional: <code className="bg-blue-100 px-1 rounded">acquisition_price</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}