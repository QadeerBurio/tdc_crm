import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Download, Share2, Printer,
  ZoomIn, ZoomOut, Maximize, Minimize,
  ChevronLeft, ChevronRight, X,
  BarChart2, PieChart, Activity, Users,
  Target, Clock, CheckCircle, AlertCircle,
  ArrowLeft, ArrowRight, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const ReportViewer = ({ 
  reportId, 
  isOpen, 
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}) => {
  const { api } = useAuth();
  const [report, setReport] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState('full');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    if (reportId && isOpen) {
      fetchReport();
    }
  }, [reportId, isOpen]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/${reportId}`);
      setReport(response.data.data);
      setData(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!report || !data.length) return null;

    const chartType = report.chartType || 'bar';
    const ChartComponent = {
      bar: BarChart,
      line: LineChart,
      pie: RePieChart,
      area: AreaChart
    }[chartType] || BarChart;

    return (
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'pie' ? (
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        ) : (
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartType === 'bar' && <Bar dataKey="value" fill="#3B82F6" />}
            {chartType === 'line' && <Line type="monotone" dataKey="value" stroke="#3B82F6" />}
            {chartType === 'area' && (
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            )}
          </ChartComponent>
        )}
      </ResponsiveContainer>
    );
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Report not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{report.name}</h2>
            <p className="text-sm text-gray-500">
              {report.category} • {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <button
            onClick={fetchReport}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Printer className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary */}
          {report.includeSummary !== false && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Executive Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">{item.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          {report.includeCharts !== false && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Visualization</h3>
              <div className="h-96">
                {renderChart()}
              </div>
            </div>
          )}

          {/* Tables */}
          {report.includeTables !== false && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Metric</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Value</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Change</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 text-sm text-gray-800">{item.name}</td>
                        <td className="py-2 text-sm text-gray-600">{item.value}</td>
                        <td className="py-2 text-sm text-gray-600">
                          {item.change ? (
                            <span className={item.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.change >= 0 ? '+' : ''}{item.change}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-2">
                          {item.trend === 'up' && <ArrowRight className="w-4 h-4 text-green-600 rotate-45" />}
                          {item.trend === 'down' && <ArrowRight className="w-4 h-4 text-red-600 -rotate-45" />}
                          {item.trend === 'stable' && <ArrowRight className="w-4 h-4 text-gray-400" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;