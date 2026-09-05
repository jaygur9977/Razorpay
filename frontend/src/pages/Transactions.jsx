import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, getCases } from '../services/api';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions({ page, limit: 25, sort: '-createdAt' });
      const casesResponse = await getCases({ limit: 1000 });
      const casesByTransaction = new Map(casesResponse.data.map((item) => [String(item.transaction?._id || item.transaction), item]));
      setTransactions(response.data.map((item) => ({ ...item, caseData: casesByTransaction.get(String(item._id)) })));
      setMeta({ total: response.total, totalPages: response.totalPages });
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, [page]);
  const visible = transactions.filter((item) => `${item.transactionId} ${item.customerName}`.toLowerCase().includes(search.toLowerCase()));
  const amount = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-secondary" onClick={() => navigate('/dashboard/merchant')}><ArrowLeft className="w-4 h-4" /> Back</button>
          <div><h1 style={{ fontSize: '26px', fontWeight: 700 }}>All Transactions</h1><p style={{ color: 'rgba(255,255,255,0.5)' }}>{meta.total} transactions found</p></div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}><Search style={{ position: 'absolute', left: 12, top: 12, width: 16 }} /><input className="input-primary" style={{ paddingLeft: 38 }} placeholder="Search ID or customer" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <button className="btn-secondary" onClick={loadTransactions} title="Refresh transactions"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </header>
      {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
          <thead><tr>{['Transaction ID', 'Customer', 'Amount', 'Type', 'Status', 'Recovery Case'].map((heading) => <th key={heading} style={{ textAlign: 'left', padding: 16, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{heading}</th>)}</tr></thead>
          <tbody>{loading ? <tr><td colSpan="6" style={{ padding: 30, textAlign: 'center' }}>Loading transactions...</td></tr> : visible.map((item) => <tr key={item._id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <td style={{ padding: 16, fontFamily: 'monospace' }}>{item.transactionId}</td><td style={{ padding: 16 }}>{item.customerName}</td><td style={{ padding: 16 }}>{amount(item.amount)}</td><td style={{ padding: 16 }}>{item.type}</td>
            <td style={{ padding: 16, color: item.status === 'recovered' || item.status === 'successful' ? '#34d399' : '#fbbf24' }}>{item.status}</td>
            <td style={{ padding: 16 }}>{item.caseData ? <button className="btn-secondary" onClick={() => navigate(`/case/${item.caseData.caseId || item.caseData._id}`)}><ExternalLink className="w-4 h-4" /> View report</button> : '-'}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}><button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {meta.totalPages || 1}</span><button className="btn-secondary" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</button></div>
    </main>
  );
};

export default Transactions;
