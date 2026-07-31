import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Play,
  X,
  RefreshCw,
  Download,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  Server,
  Code,
  FileSpreadsheet,
  Copy,
  Check
} from 'lucide-react';

interface MySQLWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MySQLWorkbenchModal: React.FC<MySQLWorkbenchModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sql_editor' | 'connection'>('sql_editor');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM users ORDER BY created_at DESC;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    users: true,
    events: true,
    bookings: true,
  });
  const [copiedDSN, setCopiedDSN] = useState(false);
  const [copiedSqlDump, setCopiedSqlDump] = useState(false);
  const [sqlDumpPreview, setSqlDumpPreview] = useState<string>('');

  const fetchSqlDumpPreview = async () => {
    try {
      const res = await fetch('/api/db/export.sql');
      const text = await res.text();
      setSqlDumpPreview(text);
    } catch (err) {
      console.error('Failed to load SQL dump preview:', err);
    }
  };

  const handleCopySqlDump = async () => {
    try {
      let text = sqlDumpPreview;
      if (!text) {
        const res = await fetch('/api/db/export.sql');
        text = await res.text();
      }
      await navigator.clipboard.writeText(text);
      setCopiedSqlDump(true);
      setTimeout(() => setCopiedSqlDump(false), 3000);
    } catch (err) {
      console.error('Failed to copy sql dump:', err);
    }
  };

  const fetchSchemaData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/workbench/tables');
      const json = await res.json();
      if (json.success && json.data) {
        setSchemaData(json.data);
      }
    } catch (err) {
      console.error('Failed to load MySQL Workbench schema:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSqlQuery = async (customSql?: string) => {
    const targetSql = customSql || sqlQuery;
    if (!targetSql.trim()) return;

    setExecuting(true);
    try {
      const res = await fetch('/api/db/workbench/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: targetSql }),
      });
      const json = await res.json();
      setQueryResult(json);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Failed to execute query',
      });
    } finally {
      setExecuting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchemaData();
      fetchSqlDumpPreview();
      runSqlQuery('SELECT * FROM users ORDER BY created_at DESC;');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleExpand = (table: string) => {
    setExpandedTables((prev) => ({ ...prev, [table]: !prev[table] }));
  };

  const selectAndQueryTable = (tableName: string) => {
    setSelectedTable(tableName);
    const query = `SELECT * FROM ${tableName} ORDER BY created_at DESC;`;
    setSqlQuery(query);
    runSqlQuery(query);
  };

  const handleCopyDSN = () => {
    navigator.clipboard.writeText('mysql://root:@localhost:3306/srhu_events_db');
    setCopiedDSN(true);
    setTimeout(() => setCopiedDSN(false), 2000);
  };

  const exportAsJSON = () => {
    if (!queryResult || !queryResult.rows) return;
    const blob = new Blob([JSON.stringify(queryResult.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-amber-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">MySQL Workbench CE 8.0</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  IN-APP SQL CONSOLE
                </span>
                {schemaData?.isConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live MySQL Server
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    MySQL Persistence Engine
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400">
                Connection: root@localhost:3306 • Database: <span className="text-indigo-400 font-bold">srhu_events_db</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-800 p-1">
              <button
                onClick={() => setActiveTab('sql_editor')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sql_editor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                SQL Editor & Table Explorer
              </button>
              <button
                onClick={() => setActiveTab('connection')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'connection' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                Workbench Connection Setup
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
              title="Close MySQL Workbench"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'sql_editor' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Schema Sidebar */}
            <div className="w-64 border-r border-slate-800 bg-slate-950/50 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SCHEMAS</span>
                <button
                  onClick={fetchSchemaData}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Refresh Schemas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="p-3 space-y-2 text-sm font-mono">
                {/* Active Schema */}
                <div className="flex items-center gap-2 px-2 py-1.5 text-indigo-400 font-bold">
                  <Database className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>srhu_events_db</span>
                </div>

                {/* Tables Group */}
                <div className="pl-4 space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase px-2 py-1">TABLES</div>

                  {schemaData?.tables &&
                    Object.values(schemaData.tables).map((table: any) => {
                      const isSelected = selectedTable === table.name;
                      const isExpanded = expandedTables[table.name];
                      return (
                        <div key={table.name} className="space-y-1">
                          <div
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                            onClick={() => selectAndQueryTable(table.name)}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(table.name);
                                }}
                                className="text-slate-500 hover:text-slate-300"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <Table className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate">{table.name}</span>
                            </div>
                            <span className="text-[11px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 shrink-0">
                              {table.rowCount}
                            </span>
                          </div>

                          {/* Columns under table */}
                          {isExpanded && table.columns && (
                            <div className="pl-6 space-y-0.5 text-xs text-slate-400 font-mono">
                              {table.columns.map((col: string) => (
                                <div key={col} className="flex items-center gap-1.5 py-0.5 text-[11px] text-slate-400 truncate">
                                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                  <span>{col}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Main Editor & Result Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
              {/* SQL Editor Area */}
              <div className="border-b border-slate-800 p-4 bg-slate-950/30 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SQL QUERY EDITOR</span>
                    <span className="text-xs text-slate-500">• Type queries or click presets below</span>
                  </div>

                  {/* Preset Quick Queries */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        const q = 'SELECT * FROM users ORDER BY created_at DESC;';
                        setSqlQuery(q);
                        runSqlQuery(q);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                    >
                      SELECT * FROM users
                    </button>
                    <button
                      onClick={() => {
                        const q = 'SELECT * FROM events ORDER BY created_at DESC;';
                        setSqlQuery(q);
                        runSqlQuery(q);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                    >
                      SELECT * FROM events
                    </button>
                    <button
                      onClick={() => {
                        const q = 'SELECT * FROM bookings ORDER BY created_at DESC;';
                        setSqlQuery(q);
                        runSqlQuery(q);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                    >
                      SELECT * FROM bookings
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        runSqlQuery();
                      }
                    }}
                    rows={3}
                    placeholder="Type your SQL query here e.g. SELECT * FROM users WHERE role = 'student';"
                    className="w-full bg-slate-950 text-indigo-300 font-mono text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-32 shadow-inner"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      onClick={() => runSqlQuery()}
                      disabled={executing}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {executing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      Execute (Ctrl+Enter)
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Grid Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs font-mono shrink-0">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-300">RESULT GRID</span>
                  {queryResult && (
                    <div className="flex items-center gap-3">
                      {queryResult.success ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Success • {queryResult.rowCount} {queryResult.rowCount === 1 ? 'row' : 'rows'} returned
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Error Executing Query
                        </span>
                      )}
                      {queryResult.durationMs !== undefined && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {queryResult.durationMs}ms
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportAsJSON}
                    disabled={!queryResult?.rows || queryResult.rows.length === 0}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Data Table View */}
              <div className="flex-1 overflow-auto p-4">
                {executing ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="text-sm font-mono">Executing SQL query...</span>
                  </div>
                ) : queryResult?.success ? (
                  queryResult.rows && queryResult.rows.length > 0 ? (
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                            <th className="p-3 w-10 text-center border-r border-slate-800">#</th>
                            {Object.keys(queryResult.rows[0]).map((col) => (
                              <th key={col} className="p-3 border-r border-slate-800 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {queryResult.rows.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-900/60 transition-colors text-slate-300">
                              <td className="p-3 text-center text-slate-500 border-r border-slate-800">{idx + 1}</td>
                              {Object.entries(row).map(([col, val], colIdx) => (
                                <td key={colIdx} className="p-3 border-r border-slate-800/80 max-w-xs truncate">
                                  {typeof val === 'object' && val !== null ? (
                                    <span className="text-amber-400">{JSON.stringify(val)}</span>
                                  ) : val === null || val === undefined ? (
                                    <span className="text-slate-600 italic">NULL</span>
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                      <Table className="w-10 h-10 text-slate-600 mb-2" />
                      <span className="text-sm font-mono">Query executed successfully. 0 rows returned.</span>
                    </div>
                  )
                ) : queryResult?.error ? (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-rose-300 font-mono text-sm">
                    <div className="flex items-center gap-2 font-bold text-rose-400 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>SQL Syntax / Execution Error</span>
                    </div>
                    <p>{queryResult.error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                    <Database className="w-10 h-10 mb-2 opacity-30" />
                    <span className="text-sm font-mono">Select a table on the left or click Execute to view data</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Connection Guide & MySQL Workbench Integration Setup Tab */
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" />
                  How to Connect from Your Desktop MySQL Workbench
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  This application has an integrated MySQL server database engine configured automatically. You can inspect tables and run queries right here in the In-App SQL Console, or connect your desktop MySQL Workbench using these credentials:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono block mb-1">HOST NAME / IP ADDRESS</span>
                    <span className="font-mono text-white font-bold text-base">localhost</span>
                    <span className="text-xs text-slate-400 block mt-0.5">(or 127.0.0.1)</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono block mb-1">PORT</span>
                    <span className="font-mono text-white font-bold text-base">3306</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono block mb-1">USERNAME</span>
                    <span className="font-mono text-white font-bold text-base">root</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono block mb-1">PASSWORD</span>
                    <span className="font-mono text-slate-400 text-sm">(leave empty by default)</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-500 font-mono block">DEFAULT SCHEMA / DATABASE NAME</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold text-lg">srhu_events_db</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('srhu_events_db');
                      }}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                    >
                      Copy Schema Name
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Setup Instructions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h5 className="font-bold text-white text-base">Quick 3-Step Setup in MySQL Workbench:</h5>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300 font-mono">
                  <li>Open <span className="text-amber-400 font-bold">MySQL Workbench</span> on your computer.</li>
                  <li>Click the <span className="text-indigo-400 font-bold">+</span> icon next to <span className="text-white">MySQL Connections</span> to create a new connection.</li>
                  <li>Enter Connection Name <span className="text-white font-bold">"SRHU Events DB"</span>, leave Host as <span className="text-indigo-400">localhost</span>, Port <span className="text-indigo-400">3306</span>, User <span className="text-indigo-400">root</span>, and click <span className="text-emerald-400 font-bold">Test Connection</span>.</li>
                </ol>
              </div>

              {/* Connection String */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
                <span className="text-xs text-slate-500 font-mono uppercase block">FULL DSN CONNECTION STRING</span>
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <code className="font-mono text-sm text-indigo-300">mysql://root:@localhost:3306/srhu_events_db</code>
                  <button
                    onClick={handleCopyDSN}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedDSN ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
