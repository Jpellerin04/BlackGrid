'use client';

import React, { useState } from 'react';
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

  const isMonthly = mode === 'monthly';

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      console.log('File uploaded:', acceptedFiles[0]);
    },
  });

  const templates = [
    'Single-Family', 'Duplex', 'Triplex', 'Quadplex',
    'Townhome', 'Condo', 'Multifamily', 'Short-Term Rental',
  ];

  const handleAnalyze = () => {
    const p = parseFloat(price);
    const r = parseFloat(rent) * (isMonthly ? 12 : 1);
    const e = parseFloat(expenses) * (isMonthly ? 12 : 1);
    const dp = parseFloat(downPayment);
    const ap = parseFloat(appreciation);

    const cashFlow = r - e;
    const capRate = ((cashFlow) / p) * 100;
    const coc = (cashFlow / dp) * 100;
    const grm = p / r;
    const oer = (e / r) * 100;
    const return5yr = ((cashFlow * 5) / dp) * 100;
    const resaleValue = p * Math.pow(1 + ap / 100, 5);
    const equityGain = resaleValue - p;
    const totalProfit = equityGain + (cashFlow * 5);
    const totalReturn = (totalProfit / dp) * 100;

    const projection = Array.from({ length: 5 }, (_, i) => ({
      year: `Year ${i + 1}`,
      value: dp + cashFlow * (i + 1),
    }));

    setResults({
      capRate: capRate.toFixed(2),
      cashFlow: cashFlow.toFixed(0),
      coc: coc.toFixed(2),
      grm: grm.toFixed(2),
      oer: oer.toFixed(2),
      return5yr: return5yr.toFixed(2),
      resaleValue: resaleValue.toFixed(0),
      equityGain: equityGain.toFixed(0),
      totalReturn: totalReturn.toFixed(2),
      projection,
      input: { p, r, e, dp, ap },
    });
  };

  const downloadSpreadsheet = () => {
    if (!results) return;

    const wb = XLSX.utils.book_new();
    const metrics = [
      ['Purchase Price', results.input.p],
      ['Expected Appreciation (%)', results.input.ap],
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

    const projection = results.projection.map((item: any) => [item.year, item.value]);

    const metricsSheet = XLSX.utils.aoa_to_sheet(metrics);
    const projectionSheet = XLSX.utils.aoa_to_sheet([['Year', 'Total Value'], ...projection]);

    XLSX.utils.book_append_sheet(wb, metricsSheet, 'Deal Summary');
    XLSX.utils.book_append_sheet(wb, projectionSheet, '5-Year Projection');
    XLSX.writeFile(wb, 'blackgrid_deal_analysis.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#0f111a] text-white px-6 py-12 flex flex-col items-center font-sans">
      {/* HEADER */}
      <div className="text-center mb-12 relative backdrop-blur-sm">
        <h1 className="text-5xl font-bold tracking-tight flex items-center justify-center space-x-3 drop-shadow-xl">
          <span className="text-white">BLACKGRID</span>
          <span className="relative text-xs text-blue-400 font-semibold">
            <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 blur-xl animate-ping"></span>
            <span className="relative z-10 px-3 py-1 rounded-full border border-blue-600 text-[10px] bg-[#0f172a]/40 backdrop-blur-sm">BETA</span>
          </span>
        </h1>
        <p className="text-gray-300 mt-4 text-lg">Analyze investment properties instantly.</p>
      </div>

      {/* TEMPLATE SELECTOR */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {templates.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-2 rounded-full border shadow-sm ${
              selectedType === t
                ? 'bg-blue-600 border-blue-500'
                : 'bg-[#1a1a1a] border-gray-700 hover:bg-gray-800'
            } text-sm text-white transition-all duration-150`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ANALYZER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
        {/* INPUT SECTION */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl space-y-4 border border-gray-800 shadow-lg">
          {selectedType && (
            <div className="text-white text-sm font-medium mb-2">
              Selected: <span className="text-blue-400">{selectedType}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
            <span>Input Mode:</span>
            <button
              onClick={() => setMode(isMonthly ? 'annual' : 'monthly')}
              className="bg-gray-800 border border-gray-600 px-3 py-1 rounded hover:bg-gray-700 transition"
            >
              {isMonthly ? 'Monthly' : 'Annual'}
            </button>
          </div>

          <div {...getRootProps()} className="border border-dashed border-gray-600 rounded-md p-6 text-center text-sm text-gray-400 hover:border-gray-300 transition cursor-pointer">
            <input {...getInputProps()} />
            Drag and drop a file here, or click to select
          </div>

          <input className="w-full p-3 rounded bg-[#121212] text-white focus:ring-2 focus:ring-blue-500" placeholder="Purchase Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="w-full p-3 rounded bg-[#121212] text-white focus:ring-2 focus:ring-blue-500" placeholder={`${isMonthly ? 'Monthly' : 'Annual'} Rent`} value={rent} onChange={(e) => setRent(e.target.value)} />
          <input className="w-full p-3 rounded bg-[#121212] text-white focus:ring-2 focus:ring-blue-500" placeholder={`${isMonthly ? 'Monthly' : 'Annual'} Expenses`} value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          <input className="w-full p-3 rounded bg-[#121212] text-white focus:ring-2 focus:ring-blue-500" placeholder="Down Payment" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
          <input className="w-full p-3 rounded bg-[#121212] text-white focus:ring-2 focus:ring-blue-500" placeholder="Expected Appreciation (%)" value={appreciation} onChange={(e) => setAppreciation(e.target.value)} />

          <button onClick={handleAnalyze} className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded text-white font-semibold w-full mt-4 transition">Analyze Deal</button>
        </div>

        {/* OUTPUT SECTION */}
        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Cap Rate', value: `${results.capRate}%` },
                { label: 'Cash-on-Cash Return', value: `${results.coc}%` },
                { label: 'GRM', value: results.grm },
                { label: 'OER', value: `${results.oer}%` },
                { label: 'Annual Cash Flow', value: `$${results.cashFlow}` },
                { label: 'Estimated Resale Value (Year 5)', value: `$${results.resaleValue}` },
                { label: 'Total ROI if Sold', value: `${results.totalReturn}%` },
              ].map((item, i) => (
                <div key={i} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg hover:shadow-blue-500/30 transition">
                  <div className="text-sm text-gray-400">{item.label}</div>
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
              <div className="text-sm text-gray-400 mb-2">5-Year Projection</div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={results.projection}>
                  <XAxis dataKey="year" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#glow)"
                    className="drop-shadow-[0_0_12px_#3b82f6]"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <button onClick={downloadSpreadsheet} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-sm mt-4">
              Download Spreadsheet (.xlsx)
            </button>
          </div>
        )}
      </div>

      <footer className="mt-16 text-sm text-gray-600 text-center">
        Built by investors, for investors. © BlackGrid 2025
      </footer>
    </div>
  );
}
