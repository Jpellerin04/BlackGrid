// ✅ Clean version of the full BlackGrid calculator page
// Includes: Theme toggle, full calculator, results, downloadable XLSX

'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

export default function Home() {
  const [price, setPrice] = useState('');
  const [rent, setRent] = useState('');
  const [expenses, setExpenses] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [appreciation, setAppreciation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [results, setResults] = useState<any>(null);
  const [mode, setMode] = useState<'monthly' | 'annual'>('monthly');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const isMonthly = mode === 'monthly';
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => console.log('File uploaded:', acceptedFiles[0])
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('blackgrid-theme', theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('blackgrid-theme');
    if (stored === 'light') setTheme('light');
  }, []);

  const templates = [
    'Single-Family', 'Duplex', 'Triplex', 'Quadplex',
    'Townhome', 'Condo', 'Multifamily', 'Short-Term Rental',
  ];

  const handleAnalyze = () => {
    const p = parseFloat(price.trim());
    const r = parseFloat(rent.trim()) * (isMonthly ? 12 : 1);
    const e = parseFloat(expenses.trim()) * (isMonthly ? 12 : 1);
    const dp = parseFloat(downPayment.trim());
    const ap = parseFloat(appreciation.trim());
    if (!p || !r || !e || !dp) return;

    const cashFlow = r - e;
    const capRate = ((cashFlow) / p) * 100;
    const coc = (cashFlow / dp) * 100;
    const grm = p / r;
    const oer = (e / r) * 100;

    const resaleValue = !isNaN(ap) ? p * Math.pow(1 + ap / 100, 5) : null;
    const equityGain = resaleValue ? resaleValue - p : 0;
    const totalProfit = equityGain + (cashFlow * 5);
    const totalReturn = (totalProfit / dp) * 100;

    const projection = Array.from({ length: 5 }, (_, i) => ({
      year: `Year ${i + 1}`,
      value: dp + cashFlow * (i + 1),
    }));

    const resultsData = {
      capRate: capRate.toFixed(2),
      cashFlow: cashFlow.toFixed(0),
      coc: coc.toFixed(2),
      grm: grm.toFixed(2),
      oer: oer.toFixed(2),
      return5yr: !isNaN(ap) ? (((cashFlow * 5) / dp) * 100).toFixed(2) : 'N/A',
      resaleValue: resaleValue ? resaleValue.toFixed(0) : 'N/A',
      equityGain: equityGain.toFixed(0),
      totalReturn: !isNaN(ap) ? totalReturn.toFixed(2) : 'N/A',
      projection,
      input: { p, r, e, dp, ap },
    };

    setResults(resultsData);
  };

  const downloadSpreadsheet = () => {
    if (!results) return;
    const wb = XLSX.utils.book_new();
    const projectionSheet = XLSX.utils.aoa_to_sheet([
      ['Year', 'Total Value'],
      ...results.projection.map((item: any) => [item.year, item.value])
    ]);
    const metrics = [
      ['Purchase Price', results.input.p],
      ['Expected Appreciation (%)', results.input.ap || 'N/A'],
      ['Monthly Rent', (results.input.r / 12).toFixed(0)],
      ['Monthly Expenses', (results.input.e / 12).toFixed(0)],
      ['Down Payment', results.input.dp],
      ['Annual Cash Flow', results.cashFlow],
      ['Cap Rate (%)', results.capRate],
      ['Cash-on-Cash Return (%)', results.coc],
      ['GRM', results.grm],
      ['OER (%)', results.oer],
      ['5-Year Return (%)', results.return5yr],
      ['Estimated Resale Value (Year 5)', results.resaleValue],
      ['Equity Gain From Appreciation', results.equityGain],
      ['Total ROI w/ Appreciation (%)', results.totalReturn],
    ];
    const metricsSheet = XLSX.utils.aoa_to_sheet(metrics);
    XLSX.utils.book_append_sheet(wb, metricsSheet, 'Deal Summary');
    XLSX.utils.book_append_sheet(wb, projectionSheet, '5-Year Projection');
    XLSX.writeFile(wb, 'blackgrid_deal_analysis.xlsx');
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#fdf8f2] text-black'} min-h-screen px-6 py-12 transition-all duration-300`}>
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`px-4 py-2 rounded shadow text-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-[#7d98a1] text-white'}`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="grid grid-cols-2 gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm ${theme === 'dark' ? 'bg-[#f5f5dc]' : 'bg-black'}`} />
            ))}
          </div>
          <h1 className="text-6xl tracking-tight font-normal" style={{ fontFamily: 'Georgia, serif' }}>
            BLACKGRID
          </h1>
        </div>
        <p className="text-lg mb-10 text-center" style={{ fontFamily: 'Georgia, serif', color: theme === 'dark' ? '#aaa' : '#555' }}>
          Analyze investment properties instantly.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {templates.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-full border shadow-sm ${selectedType === t ? `${theme === 'dark' ? 'bg-white text-black border-gray-200' : 'bg-[#7d98a1] text-white border-[#7d98a1]'}` : 'bg-transparent border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'} text-sm transition-all duration-150`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          <div className={`p-6 rounded-2xl space-y-4 border shadow-lg w-full ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-300'}`}>
            <div className="text-sm font-medium mb-2">
              Selected: <span className="text-blue-500">{selectedType}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2 text-gray-600 dark:text-gray-300">
              <span>Input Mode:</span>
              <button
                onClick={() => setMode(isMonthly ? 'annual' : 'monthly')}
                className={`border px-3 py-1 rounded transition ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-200 border-gray-400 text-black'}`}
              >
                {isMonthly ? 'Monthly' : 'Annual'}
              </button>
            </div>
            <div {...getRootProps()} className="border border-dashed rounded-md p-6 text-center text-sm text-gray-500 hover:border-gray-400 transition cursor-pointer">
              <input {...getInputProps()} />
              Drag and drop a file here, or click to select
            </div>
            <input className="w-full p-3 rounded bg-gray-100 dark:bg-[#121212] text-black dark:text-white" placeholder="Purchase Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="w-full p-3 rounded bg-gray-100 dark:bg-[#121212] text-black dark:text-white" placeholder={`${isMonthly ? 'Monthly' : 'Annual'} Rent`} value={rent} onChange={(e) => setRent(e.target.value)} />
            <input className="w-full p-3 rounded bg-gray-100 dark:bg-[#121212] text-black dark:text-white" placeholder={`${isMonthly ? 'Monthly' : 'Annual'} Expenses`} value={expenses} onChange={(e) => setExpenses(e.target.value)} />
            <input className="w-full p-3 rounded bg-gray-100 dark:bg-[#121212] text-black dark:text-white" placeholder="Down Payment" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
            <input className="w-full p-3 rounded bg-gray-100 dark:bg-[#121212] text-black dark:text-white" placeholder="Expected Appreciation (%) (optional)" value={appreciation} onChange={(e) => setAppreciation(e.target.value)} />
            <button onClick={handleAnalyze} className={`w-full py-3 mt-4 rounded font-semibold transition ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#7d98a1] text-white hover:opacity-90'}`}>
              Analyze Deal
            </button>
          </div>

          {results && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Cap Rate', value: `${results.capRate}%` },
                  { label: 'Cash-on-Cash Return', value: `${results.coc}%` },
                  { label: 'GRM', value: results.grm },
                  { label: 'OER', value: `${results.oer}%` },
                  { label: 'Annual Cash Flow', value: `$${Number(results.cashFlow).toLocaleString()}` },
                  { label: 'Estimated Resale Value (Year 5)', value: `$${results.resaleValue}` },
                  { label: 'Total ROI if Sold', value: `${results.totalReturn}%` },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border shadow-lg ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                    <div className="text-2xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-xl border shadow-lg ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-300'}`}>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">5-Year Projection</div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={results.projection}>
                    <XAxis dataKey="year" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#111' : '#fff', border: 'none' }} formatter={(value: number) => value.toLocaleString()} />
                    <defs>
                      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme === 'dark' ? '#3b82f6' : '#7d98a1'} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={theme === 'dark' ? '#3b82f6' : '#7d98a1'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={theme === 'dark' ? '#3b82f6' : '#7d98a1'} strokeWidth={3} fill="url(#glow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <button onClick={downloadSpreadsheet} className={`w-full mt-4 py-3 rounded font-semibold transition ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#7d98a1] text-white hover:opacity-90'}`}>
                Download Spreadsheet (.xlsx)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
