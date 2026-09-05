import fs from 'fs';
import csv from 'csv-parser';
import Transaction from '../models/Transaction.js';
import Case from '../models/Case.js';

// Process CSV file
export const processCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let rowCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        rowCount++;
        
        // Validate required fields
        if (data.customer_name && data.amount && data.type && data.status) {
          try {
            const transaction = {
              transactionId: data.transaction_id || `CSV${Date.now()}${rowCount}`,
              customerName: data.customer_name,
              customerEmail: data.email || '',
              customerPhone: data.phone || '',
              customerType: data.customer_type || 'regular',
              amount: parseFloat(data.amount),
              type: data.type.toLowerCase(),
              status: data.status.toLowerCase(),
              failureReason: data.failure_reason || 'none',
              paymentMethod: data.payment_method || 'na',
              gatewayResponseCode: data.gateway_response_code || '',
              previousOrders: parseInt(data.previous_orders) || 0,
              source: 'csv_upload',
            };
            
            results.push(transaction);
            validCount++;
          } catch (error) {
            invalidCount++;
            errors.push({ row: rowCount, error: error.message });
          }
        } else {
          invalidCount++;
          errors.push({ row: rowCount, error: 'Missing required fields' });
        }
      })
      .on('end', () => {
        resolve({
          totalRows: rowCount,
          validRows: validCount,
          invalidRows: invalidCount,
          data: results,
          errors,
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Save processed transactions
export const saveTransactions = async (transactions) => {
  try {
    const saved = await Transaction.insertMany(transactions, { ordered: false });
    return {
      success: true,
      count: saved.length,
      data: saved,
    };
  } catch (error) {
    // Handle duplicate key errors
    if (error.writeErrors) {
      const saved = error.insertedDocs || [];
      return {
        success: true,
        count: saved.length,
        duplicates: error.writeErrors.length,
        data: saved,
      };
    }
    throw error;
  }
};

