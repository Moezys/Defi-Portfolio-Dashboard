import Papa from 'papaparse';
import { Holding } from '@/types';

export interface CSVHolding {
  symbol: string;
  amount: string | number;
  acquisition_date: string;
  acquisition_price?: string | number;
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
}

export function parseCSV(csvContent: string): Promise<{ data: CSVHolding[]; errors: CSVValidationError[] }> {
  return new Promise((resolve) => {
    const errors: CSVValidationError[] = [];
    
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: CSVHolding[] = [];
        
        results.data.forEach((rowData: unknown, index: number) => {
          const row = rowData as Record<string, string>;
          const rowErrors: CSVValidationError[] = [];
          
          // Validate required fields
          if (!row.symbol || row.symbol.trim() === '') {
            rowErrors.push({
              row: index + 1,
              field: 'symbol',
              message: 'Symbol is required'
            });
          }
          
          if (!row.amount || isNaN(Number(row.amount))) {
            rowErrors.push({
              row: index + 1,
              field: 'amount',
              message: 'Amount must be a valid number'
            });
          } else if (Number(row.amount) <= 0) {
            rowErrors.push({
              row: index + 1,
              field: 'amount',
              message: 'Amount must be greater than 0'
            });
          }
          
          if (!row.acquisition_date) {
            rowErrors.push({
              row: index + 1,
              field: 'acquisition_date',
              message: 'Acquisition date is required'
            });
          } else {
            const date = new Date(row.acquisition_date);
            if (isNaN(date.getTime())) {
              rowErrors.push({
                row: index + 1,
                field: 'acquisition_date',
                message: 'Invalid date format (use YYYY-MM-DD)'
              });
            } else if (date > new Date()) {
              rowErrors.push({
                row: index + 1,
                field: 'acquisition_date',
                message: 'Acquisition date cannot be in the future'
              });
            }
          }
          
          // Validate optional acquisition_price
          if (row.acquisition_price && isNaN(Number(row.acquisition_price))) {
            rowErrors.push({
              row: index + 1,
              field: 'acquisition_price',
              message: 'Acquisition price must be a valid number'
            });
          } else if (row.acquisition_price && Number(row.acquisition_price) <= 0) {
            rowErrors.push({
              row: index + 1,
              field: 'acquisition_price',
              message: 'Acquisition price must be greater than 0'
            });
          }
          
          errors.push(...rowErrors);
          
          if (rowErrors.length === 0) {
            data.push({
              symbol: row.symbol.trim().toUpperCase(),
              amount: Number(row.amount),
              acquisition_date: row.acquisition_date,
              acquisition_price: row.acquisition_price ? Number(row.acquisition_price) : undefined
            });
          }
        });
        
        resolve({ data, errors });
      }
    });
  });
}

export function convertToHoldings(csvHoldings: CSVHolding[]): Holding[] {
  return csvHoldings.map(holding => ({
    symbol: holding.symbol,
    amount: Number(holding.amount),
    acquisition_date: holding.acquisition_date,
    acquisition_price: holding.acquisition_price ? Number(holding.acquisition_price) : undefined
  }));
}

export function exportHoldingsToCSV(holdings: Holding[]): string {
  const csvData = holdings.map(holding => ({
    symbol: holding.symbol,
    amount: holding.amount,
    acquisition_date: holding.acquisition_date,
    acquisition_price: holding.acquisition_price || '',
    current_value: holding.current_value || '',
    profit_loss: holding.profit_loss || '',
    profit_loss_percentage: holding.profit_loss_percentage ? `${holding.profit_loss_percentage.toFixed(2)}%` : ''
  }));
  
  return Papa.unparse(csvData);
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}