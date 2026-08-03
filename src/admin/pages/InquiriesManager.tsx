import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, Phone, Building, Calendar, Search, Filter, 
  Trash2, Eye, MessageSquare, CheckCircle2, Clock, 
  FileText, Send, User, ChevronRight, AlertCircle, RefreshCw, Layers, DollarSign, Tag, X, ExternalLink
} from 'lucide-react';
import { LeadInquiry } from '../../types';
import { 
  getStoredLeadInquiries, updateLeadInquiryStatus, deleteLeadInquiry, saveStoredLeadInquiry 
} from '../../services/dataStorage';

interface InquiriesManagerProps {
  showToast: (text: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const InquiriesManager: React.FC<InquiriesManagerProps> = ({
  showToast,
  openDeleteConfirm,
}) => {
  const [inquiries, setInquiries] = useState<LeadInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  
  // Selected Inquiry for Detail View Drawer / Modal
  const [selectedInquiry, setSelectedInquiry] = useState<LeadInquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // Sync inquiries from localStorage & Firestore events
  const loadInquiries = () => {
    const data = getStoredLeadInquiries();
    setInquiries(data);
  };

  useEffect(() => {
    loadInquiries();
    const handleUpdate = () => loadInquiries();
    window.addEventListener('ohmveda_lead_inquiries_updated', handleUpdate);
    return () => window.removeEventListener('ohmveda_lead_inquiries_updated', handleUpdate);
  }, []);

  // Filtered list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesSource = sourceFilter === 'ALL' || item.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [inquiries, searchTerm, statusFilter, sourceFilter]);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === 'NEW').length;
    const inReview = inquiries.filter((i) => i.status === 'IN_REVIEW' || i.status === 'CONTACTED').length;
    const proposalSent = inquiries.filter((i) => i.status === 'PROPOSAL_SENT').length;
    const converted = inquiries.filter((i) => i.status === 'CONVERTED').length;
    return { total, newCount, inReview, proposalSent, converted };
  }, [inquiries]);

  // Handle status update
  const handleStatusChange = (id: string, newStatus: LeadInquiry['status']) => {
    const updated = updateLeadInquiryStatus(id, newStatus);
    setInquiries(updated);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Inquiry status updated to ${newStatus.replace('_', ' ')}`, 'success');
  };

  // Handle saving notes
  const handleSaveNotes = () => {
    if (!selectedInquiry) return;
    const updated = updateLeadInquiryStatus(selectedInquiry.id, selectedInquiry.status, adminNotesInput);
    setInquiries(updated);
    setSelectedInquiry((prev) => prev ? { ...prev, adminNotes: adminNotesInput } : null);
    showToast('Admin internal notes saved successfully', 'success');
  };

  // Handle delete inquiry
  const handleDelete = (id: string, name: string) => {
    openDeleteConfirm(
      'Delete Lead Inquiry',
      `Are you sure you want to delete the inquiry from "${name}"? This action cannot be undone.`,
      () => {
        const updated = deleteLeadInquiry(id);
        setInquiries(updated);
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
        showToast('Inquiry deleted successfully', 'info');
      }
    );
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status: LeadInquiry['status']) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">NEW UNREAD</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 border border-amber-200">IN REVIEW</span>;
      case 'CONTACTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 border border-purple-200">CONTACTED</span>;
      case 'PROPOSAL_SENT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-200">PROPOSAL SENT</span>;
      case 'CONVERTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono">CONVERTED</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">CLOSED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  // Source Badge
  const getSourceBadge = (source: LeadInquiry['source']) => {
    switch (source) {
      case 'project_modal':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Project Brief</span>;
      case 'contact_form':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Contact Form</span>;
      case 'project_configurator':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">Configurator</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{source}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>Lead & Sales Pipeline</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Inquiries & Proposals Inbox</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming client project briefs, custom proposal requests, and direct website messages.
          </p>
        </div>

        <button
          onClick={loadInquiries}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Inquiries</span>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <span className="text-[10px] text-slate-400">All recorded submissions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-blue-600" />
            <span>New Unread</span>
          </span>
          <div className="text-2xl font-black text-blue-600">{stats.newCount}</div>
          <span className="text-[10px] text-blue-500 font-medium">Requires initial response</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">In Review</span>
          <div className="text-2xl font-black text-amber-700">{stats.inReview}</div>
          <span className="text-[10px] text-slate-400">Under engineering review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">Proposals Sent</span>
          <div className="text-2xl font-black text-indigo-700">{stats.proposalSent}</div>
          <span className="text-[10px] text-slate-400">Quotes & proposals issued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Converted</span>
          <div className="text-2xl font-black text-emerald-700">{stats.converted}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Active projects closed</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone, details..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Unread</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="CONTACTED">Contacted</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="CONVERTED">Converted</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sources</option>
            <option value="project_modal">Project Consultation</option>
            <option value="contact_form">Direct Contact Form</option>
            <option value="project_configurator">Blueprint Configurator</option>
          </select>
        </div>

      </div>

      {/* Inquiries List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Inquiries Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no lead inquiries matching your filter criteria. New customer project briefs and contact form entries will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Client / Company</th>
                  <th className="p-4">Subject & Scope</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Budget & Timeline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inquiry) => {
                  const createdDate = new Date(inquiry.createdAt);
                  const isNew = inquiry.status === 'NEW';

                  return (
                    <tr 
                      key={inquiry.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isNew ? 'bg-blue-50/30 font-medium' : ''
                      }`}
                    >
                      {/* Client Info */}
                      <td className="p-4 align-top">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{inquiry.name}</span>
                            {inquiry.company && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                                {inquiry.company}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-2">
                            <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{inquiry.email}</span>
                            </a>
                          </div>
                          {inquiry.phone && (
                            <div className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{inquiry.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subject & Description snippet */}
                      <td className="p-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block truncate">
                            {inquiry.subject || 'Project Inquiry'}
                          </span>
                          <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                            {inquiry.description}
                          </p>
                          {inquiry.selectedModules && inquiry.selectedModules.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {inquiry.selectedModules.slice(0, 2).map((mod, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {mod}
                                </span>
                              ))}
                              {inquiry.selectedModules.length > 2 && (
                                <span className="text-[9px] text-slate-400 font-bold">
                                  +{inquiry.selectedModules.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="p-4 align-top">
                        {getSourceBadge(inquiry.source)}
                      </td>

                      {/* Budget & Timeline */}
                      <td className="p-4 align-top">
                        <div className="text-[11px] space-y-0.5">
                          <div className="font-semibold text-slate-800">
                            {inquiry.budgetRange || 'N/A'}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            {inquiry.timeline ? `Timeline: ${inquiry.timeline}` : 'Timeline: Flexible'}
                          </div>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="p-4 align-top">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value as LeadInquiry['status'])}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="NEW">NEW UNREAD</option>
                          <option value="IN_REVIEW">IN REVIEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 align-top text-slate-500 text-[11px] whitespace-nowrap">
                        {isNaN(createdDate.getTime()) ? inquiry.createdAt : createdDate.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setAdminNotesInput(inquiry.adminNotes || '');
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="View Full Brief Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Brief</span>
                          </button>

                          <button
                            onClick={() => handleDelete(inquiry.id, inquiry.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer / Modal View */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getSourceBadge(selectedInquiry.source)}
                  <span className="text-[11px] font-mono font-bold text-slate-400">ID: #{selectedInquiry.id}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedInquiry.subject || 'Project Inquiry Brief'}
                </h3>
                <p className="text-xs text-slate-500">
                  Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Client Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedInquiry.name}</span>
                {selectedInquiry.company && (
                  <span className="text-slate-500 block text-[11px]">Company: {selectedInquiry.company}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Contact Options</span>
                <div className="space-y-1">
                  <a 
                    href={`mailto:${selectedInquiry.email}`} 
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedInquiry.email}</span>
                  </a>
                  {selectedInquiry.phone && (
                    <a 
                      href={`tel:${selectedInquiry.phone}`} 
                      className="text-slate-700 hover:underline font-semibold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedInquiry.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Project Specifications */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Budget</span>
                <span className="font-bold text-blue-600 text-sm">{selectedInquiry.budgetRange || 'Not specified'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Timeline</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInquiry.timeline || 'Flexible'}</span>
              </div>
            </div>

            {/* Selected Architectural Modules */}
            {selectedInquiry.selectedModules && selectedInquiry.selectedModules.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Configured Architectural Layers</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.selectedModules.map((mod, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>{mod}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Project Description / Requirements</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedInquiry.description}
              </div>
            </div>

            {/* Status & Admin Internal Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-800">Pipeline Status:</label>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as LeadInquiry['status'])}
                  className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="NEW">NEW UNREAD</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Admin Log / Team Notes</label>
                <textarea
                  rows={2}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Record internal team notes, quote values, or discussion logs..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>

            {/* Reply Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`mailto:${selectedInquiry.email}?subject=RE:%20${encodeURIComponent(selectedInquiry.subject || 'OhmVeda Technologies Project Inquiry')}&body=Hello%20${encodeURIComponent(selectedInquiry.name)},%0A%0AThank%20you%20for%20reaching%20out%20to%20OhmVeda%20Technologies.%20We%20have%20reviewed%20your%20project%20requirements:`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send Reply Email to Client</span>
              </a>

              {selectedInquiry.phone && (
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition-colors"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Call {selectedInquiry.phone}</span>
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
