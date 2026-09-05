import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle, XCircle,
  ChevronRight, Database, Link as LinkIcon,
  ArrowLeft, Download, Trash2, Eye,
  CloudUpload, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadCSV, downloadSampleCSV, createTransaction, createCase, processPendingCases, checkApiConnection } from '../services/api';

const DataUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('csv');
  const [validationResults, setValidationResults] = useState(null);
  const [manual, setManual] = useState({ customerName: '', amount: '', type: 'payment', status: 'failed' });
  const [apiCredentials, setApiCredentials] = useState({ key: '', secret: '' });
  const [message, setMessage] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setUploadedFile(file);
    setValidationResults(null);
    
    setIsProcessing(true);
    setUploadProgress(20);
    uploadCSV(file)
      .then((response) => {
        setUploadProgress(100);
        setValidationResults({
          totalRecords: response.data.processed?.total || 0,
          validRecords: response.data.processed?.valid || 0,
          invalidRecords: response.data.processed?.invalid || 0,
          totalAmount: 0,
          recoveredPotential: 0,
        });
        setMessage('Transactions imported. Process them to start recovery analysis.');
      })
      .catch(() => setValidationResults(null))
      .finally(() => setIsProcessing(false));
  };

  const processImportedTransactions = async () => {
    await processPendingCases();
    setMessage('Imported transactions sent to the recovery workflow.');
  };

  const addManualTransaction = async () => {
    const transaction = await createTransaction({ ...manual, amount: Number(manual.amount) });
    const caseType = manual.type === 'checkout' ? 'checkout_abandonment' : manual.type === 'invoice' ? 'invoice_overdue' : manual.type === 'subscription' ? 'subscription_failure' : 'payment_failure';
    await createCase({ transaction: transaction.data._id, customerName: manual.customerName, amount: Number(manual.amount), type: caseType, status: 'detected' });
    await processPendingCases();
    setMessage('Manual transaction added and queued for recovery analysis.');
  };

  const connectAccount = async () => {
    await checkApiConnection();
    setMessage('API is reachable. Credentials were not stored in the browser.');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard/merchant')}
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Upload Transaction Data</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Import your transaction data for AI recovery analysis
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={downloadSampleCSV}>
            <Download className="w-4 h-4" /> Download sample CSV
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          background: 'rgba(255,255,255,0.04)',
          padding: '8px',
          borderRadius: '16px',
          width: 'fit-content',
        }}>
          {[
            { id: 'csv', label: 'CSV Upload', icon: FileSpreadsheet },
            { id: 'api', label: 'API Connect', icon: LinkIcon },
            { id: 'manual', label: 'Manual Entry', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                  boxShadow: activeTab === tab.id ? '0 8px 20px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'csv' && (
            <motion.div
              key="csv"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Upload Area */}
              {!uploadedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragActive ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '24px',
                    padding: '80px 40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragActive ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CloudUpload style={{
                      width: '80px',
                      height: '80px',
                      color: '#818cf8',
                      margin: '0 auto 24px',
                    }} />
                  </motion.div>
                  <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
                    Drag & Drop your file here
                  </h3>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                    or click to browse from your computer
                  </p>
                  <button className="btn-primary">
                    <Upload className="w-5 h-5" />
                    Browse Files
                  </button>
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.35)',
                    marginTop: '24px',
                  }}>
                    Supported formats: CSV, XLSX • Max size: 10MB
                  </p>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '32px' }}>
                  {/* File Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    marginBottom: '24px',
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'rgba(99,102,241,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText className="w-8 h-8" style={{ color: '#818cf8' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '16px', fontWeight: 600 }}>{uploadedFile.name}</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                        {(uploadedFile.size / 1024).toFixed(1)} KB • Uploaded successfully
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setValidationResults(null);
                        setUploadProgress(0);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#f87171',
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {isProcessing && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                          Processing file...
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#818cf8' }}>
                          {uploadProgress}%
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${uploadProgress}%`,
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Validation Results */}
                  {validationResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <CheckCircle className="w-5 h-5" style={{ color: '#34d399' }} />
                        Validation Complete
                      </h3>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px',
                      }}>
                        {[
                          { label: 'Total Records', value: validationResults.totalRecords, color: '#818cf8' },
                          { label: 'Valid Records', value: validationResults.validRecords, color: '#34d399' },
                          { label: 'Invalid Records', value: validationResults.invalidRecords, color: '#f87171' },
                          { label: 'Total Amount', value: `₹${(validationResults.totalAmount / 100000).toFixed(1)}L`, color: '#fbbf24' },
                        ].map((stat, i) => (
                          <div key={i} style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '16px',
                            textAlign: 'center',
                          }}>
                            <p style={{
                              fontSize: '28px',
                              fontWeight: 'bold',
                              color: stat.color,
                              marginBottom: '8px',
                            }}>
                              {stat.value}
                            </p>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Invalid Records Warning */}
                      {validationResults.invalidRecords > 0 && (
                        <div style={{
                          padding: '16px 20px',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '12px',
                          marginBottom: '24px',
                        }}>
                          <p style={{
                            fontSize: '14px',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <AlertCircle className="w-5 h-5" />
                            {validationResults.invalidRecords} records were skipped due to invalid data
                          </p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={processImportedTransactions}>
                          <Database className="w-5 h-5" />
                          Process Transactions
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card"
              style={{ padding: '48px' }}
            >
              <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '80px', height: '80px', margin: '0 auto 24px' }}
                >
                  <LinkIcon className="w-full h-full" style={{ color: '#818cf8' }} />
                </motion.div>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Connect Razorpay API
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                }}>
                  Connect your Razorpay account to automatically sync transaction data
                  and enable real-time revenue recovery.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: '8px',
                    }}>
                      API Key
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_live_xxxxxxxxxxxx"
                      className="input-primary"
                      value={apiCredentials.key}
                      onChange={(event) => setApiCredentials({ ...apiCredentials, key: event.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: '8px',
                    }}>
                      API Secret
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      className="input-primary"
                      value={apiCredentials.secret}
                      onChange={(event) => setApiCredentials({ ...apiCredentials, secret: event.target.value })}
                    />
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%' }} onClick={connectAccount}>
                  <LinkIcon className="w-5 h-5" />
                  Connect Account
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card"
              style={{ padding: '48px' }}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '32px' }}>
                Manual Transaction Entry
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                    Customer Name
                  </label>
                  <input type="text" className="input-primary" placeholder="Enter customer name" value={manual.customerName} onChange={(event) => setManual({ ...manual, customerName: event.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                    Amount (₹)
                  </label>
                  <input type="number" className="input-primary" placeholder="Enter amount" value={manual.amount} onChange={(event) => setManual({ ...manual, amount: event.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                    Transaction Type
                  </label>
                  <select className="select-primary" value={manual.type} onChange={(event) => setManual({ ...manual, type: event.target.value })}>
                    <option>Payment</option>
                    <option>Checkout</option>
                    <option>Invoice</option>
                    <option>Subscription</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                    Status
                  </label>
                  <select className="select-primary" value={manual.status} onChange={(event) => setManual({ ...manual, status: event.target.value })}>
                    <option>Failed</option>
                    <option>Abandoned</option>
                    <option>Overdue</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" style={{ marginTop: '32px' }} onClick={addManualTransaction}>
                <Database className="w-5 h-5" />
                Add Transaction
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {message && <p style={{ color: '#34d399', marginTop: '20px' }}>{message}</p>}
      </main>
    </div>
  );
};

export default DataUpload;