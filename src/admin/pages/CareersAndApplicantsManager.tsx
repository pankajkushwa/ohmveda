import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Edit3, Trash2, FileText, Users, Eye, CheckCircle2, 
  AlertTriangle, X, Save, Clock, MapPin, Award, ExternalLink, Download, 
  Mail, Phone, Search, Star, Filter, Calendar, Settings, Check, 
  TrendingUp, UserCheck, UserX, MessageSquare, Link, ChevronRight, Play, Pause, Archive
} from 'lucide-react';
import { CareerPageSettings, JobApplication, JobRole } from '../../types';
import { 
  addAdminLog, deleteStoredJobRole, getStoredCareerSettings, getStoredJobApplications, 
  getStoredJobRoles, saveStoredCareerSettings, saveStoredJobApplications, saveStoredJobRoles 
} from '../../services/dataStorage';

interface CareersAndApplicantsManagerProps {
  jobRoles?: JobRole[];
  onUpdateJobRoles?: (roles: JobRole[]) => void;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const PRESET_JOB_TITLES = [
  'Embedded Firmware Engineer',
  'PCB Design Engineer',
  'Hardware Design Engineer',
  'IoT Engineer',
  'Android Developer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Technical Sales Lead',
  'Purchase & Procurement Lead',
  'R&D Electronics Specialist',
  'Custom / Other Title...'
];

const PRESET_DEPARTMENTS = [
  'Embedded Systems',
  'Hardware & Electronics',
  'PCB Design',
  'IoT & Automation',
  'Software Development',
  'Web Development',
  'Mobile Application',
  'IT & Cloud',
  'R&D',
  'Sales & Business',
  'Purchase & Operations'
];

const PRESET_LOCATIONS = [
  'Vadodara, Gujarat',
  'Ahmedabad, Gujarat',
  'Remote',
  'Multiple Locations',
  'On-site (Vadodara)',
  'On-site (Ahmedabad)'
];

const PRESET_EXPERIENCES = [
  'Fresher',
  '0–1 Years',
  '1–3 Years',
  '3–5 Years',
  '5+ Years'
];

export const CareersAndApplicantsManager: React.FC<CareersAndApplicantsManagerProps> = ({
  jobRoles,
  onUpdateJobRoles,
  showToast,
  openDeleteConfirm,
}) => {
  // Navigation Tabs: dashboard, openings, applications, interviews, settings
  const [activeTab, setActiveTab] = useState<'dashboard' | 'openings' | 'applications' | 'interviews' | 'settings'>('dashboard');

  // Job Roles State
  const [jobRolesList, setJobRolesList] = useState<JobRole[]>(jobRoles || getStoredJobRoles());
  const [jobModalOpen, setJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobRole | null>(null);

  // Applications State
  const [jobAppsList, setJobAppsList] = useState<JobApplication[]>(getStoredJobApplications());
  const [selectedAppDetail, setSelectedAppDetail] = useState<JobApplication | null>(null);
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [appSearchQuery, setAppSearchQuery] = useState<string>('');

  // Career Page Settings State
  const [careerSettings, setCareerSettings] = useState<CareerPageSettings>(getStoredCareerSettings());

  // Form helper states for Tags & Responsibilities
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [newQual, setNewQual] = useState('');
  const [newResp, setNewResp] = useState('');

  // Auto sync jobRoles prop changes
  useEffect(() => {
    if (jobRoles) {
      setJobRolesList(jobRoles);
    }
  }, [jobRoles]);

  // Keep applications list fresh from local storage / Firestore
  const reloadApplications = () => {
    setJobAppsList(getStoredJobApplications());
  };

  useEffect(() => {
    reloadApplications();
  }, [activeTab]);

  // --- COMPUTED DASHBOARD METRICS ---
  const totalJobs = jobRolesList.length;
  const publishedJobs = jobRolesList.filter(j => j.status === 'Published' || (j.isActive && !j.status)).length;
  const draftJobs = jobRolesList.filter(j => j.status === 'Draft').length;
  const closedJobs = jobRolesList.filter(j => j.status === 'Closed' || j.status === 'Paused' || (!j.isActive && j.status !== 'Draft')).length;
  
  const totalApps = jobAppsList.length;
  const newApps = jobAppsList.filter(a => a.status === 'New' || a.status === 'Pending').length;
  const shortlistedApps = jobAppsList.filter(a => a.status === 'Shortlisted').length;
  const interviewApps = jobAppsList.filter(a => a.status === 'Interview' || (a.interviewDate && a.status !== 'Rejected' && a.status !== 'Selected' && a.status !== 'Hired')).length;
  const selectedApps = jobAppsList.filter(a => a.status === 'Selected' || a.status === 'Hired').length;

  // --- JOB OPENINGS CRUD HANDLERS ---
  const handleOpenAddJob = () => {
    const nextRefNum = `OVT-JOB-${String(jobRolesList.length + 1).padStart(3, '0')}`;
    const newJob: JobRole = {
      id: `job-${Date.now()}`,
      jobIdRef: nextRefNum,
      title: 'Embedded Firmware Engineer',
      department: 'Embedded Systems',
      location: 'Vadodara, Gujarat',
      jobType: 'Full Time',
      workMode: 'Hybrid',
      openingsCount: 2,
      experience: '1–3 Years',
      salaryMode: 'range',
      minCtc: '₹3,50,000',
      maxCtc: '₹6,50,000',
      currency: '₹',
      isNegotiable: true,
      salaryRange: '₹3,50,000 – ₹6,50,000 PA',
      description: 'We are seeking an Embedded Firmware Engineer responsible for developing and maintaining firmware for microcontroller-based edge gateways and industrial hardware.',
      aboutRole: 'In this role, you will work closely with hardware designers and cloud developers to build reliable firmware for STM32 and ESP32 platforms.',
      responsibilities: [
        'Develop embedded C/C++ firmware for STM32, ESP32, and Nordic microcontrollers.',
        'Implement communication protocols such as UART, SPI, I2C, CAN Bus, and RS485 Modbus.',
        'Debug hardware and firmware issues using logic analyzers and oscilloscopes.',
        'Participate in product testing, documentation, and R&D code reviews.'
      ],
      requirements: [
        'B.E. / B.Tech / Diploma in Electronics, Embedded Systems, or Computer Science.',
        '1+ years of practical firmware programming experience.'
      ],
      qualifications: [
        'Degree in Electronics & Communication / Instrumentation / Computer Science'
      ],
      keySkills: ['Embedded C', 'STM32', 'ESP32', 'FreeRTOS', 'UART', 'SPI', 'I2C'],
      preferredSkills: ['MQTT', 'BLE', 'Wi-Fi', 'PCB Debugging'],
      applicationMethod: 'website',
      contactEmail: 'careers@ohmveda.com',
      status: 'Published',
      isActive: true,
      postedDate: new Date().toISOString().split('T')[0],
      applicationDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };

    setEditingJob(newJob);
    setJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobRole) => {
    setEditingJob(JSON.parse(JSON.stringify(job)));
    setJobModalOpen(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    // Calculate display salary string if salary mode provided
    let calculatedSalaryStr = editingJob.salaryRange || '';
    if (editingJob.salaryMode === 'not_disclosed') {
      calculatedSalaryStr = 'Salary Not Disclosed';
    } else if (editingJob.salaryMode === 'negotiable') {
      calculatedSalaryStr = 'Negotiable Based on Experience';
    } else if (editingJob.salaryMode === 'fixed' && editingJob.minCtc) {
      calculatedSalaryStr = `${editingJob.currency || '₹'}${editingJob.minCtc} PA${editingJob.isNegotiable ? ' (Negotiable)' : ''}`;
    } else if (editingJob.salaryMode === 'range' && editingJob.minCtc && editingJob.maxCtc) {
      calculatedSalaryStr = `${editingJob.currency || '₹'}${editingJob.minCtc} – ${editingJob.currency || '₹'}${editingJob.maxCtc} PA${editingJob.isNegotiable ? ' (Negotiable)' : ''}`;
    }

    const isPublished = editingJob.status === 'Published';

    const finalJob: JobRole = {
      ...editingJob,
      salaryRange: calculatedSalaryStr,
      isActive: isPublished,
    };

    const exists = jobRolesList.some((j) => j.id === finalJob.id);
    let updated: JobRole[];

    if (exists) {
      updated = jobRolesList.map((j) => (j.id === finalJob.id ? finalJob : j));
      addAdminLog({
        action: 'UPDATE',
        target: 'CAREERS',
        title: `Updated Job Opening: ${finalJob.title}`,
        details: `Ref: ${finalJob.jobIdRef || 'N/A'} | Status: ${finalJob.status}`,
      });
      showToast(`Job opening "${finalJob.title}" saved successfully.`, 'success');
    } else {
      updated = [finalJob, ...jobRolesList];
      addAdminLog({
        action: 'ADD',
        target: 'CAREERS',
        title: `Created Job Opening: ${finalJob.title}`,
        details: `Ref: ${finalJob.jobIdRef || 'N/A'} | Status: ${finalJob.status}`,
      });
      showToast(`New job opening "${finalJob.title}" created.`, 'success');
    }

    setJobRolesList(updated);
    saveStoredJobRoles(updated);
    if (onUpdateJobRoles) onUpdateJobRoles(updated);

    setJobModalOpen(false);
    setEditingJob(null);
  };

  const handleToggleJobStatus = (jobId: string, newStatus: JobRole['status']) => {
    const updated = jobRolesList.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          isActive: newStatus === 'Published',
        };
      }
      return j;
    });

    setJobRolesList(updated);
    saveStoredJobRoles(updated);
    if (onUpdateJobRoles) onUpdateJobRoles(updated);
    showToast(`Job status changed to "${newStatus}".`, 'info');
  };

  const handleDeleteJob = (id: string, title: string) => {
    openDeleteConfirm(
      'Delete Job Opening',
      `Are you sure you want to permanently delete position "${title}"?`,
      () => {
        deleteStoredJobRole(id);
        const updated = jobRolesList.filter((j) => j.id !== id);
        setJobRolesList(updated);
        if (onUpdateJobRoles) onUpdateJobRoles(updated);
        addAdminLog({
          action: 'DELETE',
          target: 'CAREERS',
          title: `Deleted Job Opening: ${title}`,
          details: `ID: ${id}`,
        });
        showToast(`Job position "${title}" deleted.`, 'success');
      }
    );
  };

  // --- APPLICATION ACTIONS ---
  const handleUpdateAppStatus = (appId: string, newStatus: JobApplication['status']) => {
    const updated = jobAppsList.map((a) => (a.id === appId ? { ...a, status: newStatus } : a));
    setJobAppsList(updated);
    saveStoredJobApplications(updated);

    if (selectedAppDetail && selectedAppDetail.id === appId) {
      setSelectedAppDetail({ ...selectedAppDetail, status: newStatus });
    }

    showToast(`Candidate application status set to "${newStatus}".`, 'success');
  };

  const handleSaveAppDetails = (updatedApp: JobApplication) => {
    const updated = jobAppsList.map((a) => (a.id === updatedApp.id ? updatedApp : a));
    setJobAppsList(updated);
    saveStoredJobApplications(updated);
    setSelectedAppDetail(updatedApp);
    showToast('Candidate notes & interview details updated.', 'success');
  };

  // --- CAREER SETTINGS HANDLER ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredCareerSettings(careerSettings);
    showToast('Career page settings updated.', 'success');
  };

  // Filtered Applications
  const filteredApps = jobAppsList.filter((app) => {
    const matchesStatus = 
      appStatusFilter === 'ALL' || 
      app.status.toUpperCase() === appStatusFilter.toUpperCase() ||
      (appStatusFilter === 'NEW' && app.status === 'Pending');

    const q = appSearchQuery.toLowerCase();
    const matchesSearch =
      !appSearchQuery ||
      app.fullName.toLowerCase().includes(q) ||
      (app.email || '').toLowerCase().includes(q) ||
      (app.phone || '').includes(q) ||
      (app.jobTitle || '').toLowerCase().includes(q) ||
      (app.currentCompany || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* TOP HEADER & MAIN TAB NAVIGATOR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Career & Talent Acquisition Hub
              </h1>
              <p className="text-xs text-slate-500">
                Manage job postings, applications pipeline, scheduled interviews, and recruitment settings
              </p>
            </div>
          </div>
        </div>

        {/* 5 Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('openings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'openings'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Openings ({totalJobs})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Applications ({totalApps})</span>
            {newApps > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                {newApps}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interviews'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Interviews ({interviewApps})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Page Settings</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
         TAB 1: CAREER DASHBOARD (STATISTICS & OVERVIEW)
         ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* STAT METRICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Openings</span>
              <div className="text-2xl font-black text-slate-900">{totalJobs}</div>
              <span className="text-[10px] text-slate-500">All created roles</span>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Published / Active</span>
              <div className="text-2xl font-black text-emerald-700">{publishedJobs}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Visible on website</span>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Draft Jobs</span>
              <div className="text-2xl font-black text-amber-700">{draftJobs}</div>
              <span className="text-[10px] text-amber-600 font-medium">Internal preview</span>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Closed / Paused</span>
              <div className="text-2xl font-black text-slate-700">{closedJobs}</div>
              <span className="text-[10px] text-slate-500">Hiring completed/paused</span>
            </div>

            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Applications</span>
              <div className="text-2xl font-black text-blue-700">{totalApps}</div>
              <span className="text-[10px] text-blue-600 font-medium">{newApps} new received</span>
            </div>
          </div>

          {/* SECOND ROW: PIPELINE BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">New Applications</span>
                <div className="text-xl font-bold text-rose-600">{newApps}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Shortlisted Candidates</span>
                <div className="text-xl font-bold text-purple-600">{shortlistedApps}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Interviews Scheduled</span>
                <div className="text-xl font-bold text-amber-600">{interviewApps}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Selected / Hired</span>
                <div className="text-xl font-bold text-emerald-600">{selectedApps}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS & RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLS: RECENT APPLICATIONS */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Recent Candidate Submissions</span>
                </h2>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Applications</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {jobAppsList.slice(0, 5).map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{app.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        Applied for: <span className="font-medium text-slate-700">{app.jobTitle}</span> • {app.appliedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'New' || app.status === 'Pending'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : app.status === 'Shortlisted'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : app.status === 'Interview'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : app.status === 'Selected' || app.status === 'Hired'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedAppDetail(app);
                          setActiveTab('applications');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}

                {jobAppsList.length === 0 && (
                  <div className="py-8 text-center text-slate-400">
                    No candidate applications submitted yet.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COL: QUICK ACTION BANNER */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  Quick Actions
                </div>
                <h3 className="text-base font-extrabold text-white">Create New Job Posting</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Post new engineering or management vacancies directly to OhmVeda Careers portal.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleOpenAddJob}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Job Opening</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configure Career Settings</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 2: JOB OPENINGS MANAGEMENT
         ========================================================================= */}
      {activeTab === 'openings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Job Postings & Drafts</h2>
              <p className="text-xs text-slate-500">Manage position definitions, responsibilities, salary ranges, and visibility status</p>
            </div>

            <button
              onClick={handleOpenAddJob}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Job Opening</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobRolesList.map((job) => {
              const currentStatus = job.status || (job.isActive ? 'Published' : 'Paused');
              
              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xs space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {job.jobIdRef && (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {job.jobIdRef}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {job.department}
                        </span>
                      </div>

                      <select
                        value={currentStatus}
                        onChange={(e) => handleToggleJobStatus(job.id, e.target.value as any)}
                        className={`text-[10px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          currentStatus === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : currentStatus === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : currentStatus === 'Paused'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                        <option value="Closed">Closed</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{job.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1">
                        {job.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location} ({job.workMode || 'On-site'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Experience: {job.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-700 font-mono truncate">{job.salaryRange || 'Salary Not Disclosed'}</span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    {job.keySkills && job.keySkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.keySkills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div>Posted: <span className="font-medium text-slate-700">{job.postedDate}</span></div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditJob(job)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {jobRolesList.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No job openings created yet. Click "Add New Job Opening" to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 3: APPLICATIONS MANAGEMENT PIPELINE
         ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Candidate Applications Registry</h2>
              <p className="text-xs text-slate-500">Review received resumes, evaluate qualifications, and advance candidate pipeline status</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate or job..."
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 text-xs font-bold">
            {['ALL', 'NEW', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setAppStatusFilter(st)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  appStatusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* APPLICATIONS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Position</th>
                  <th className="py-3 px-4">Exp & Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{app.fullName || app.applicantName}</p>
                        <p className="text-[10px] text-slate-500">{app.email} • {app.phone}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {app.jobTitle}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{app.experienceYears || app.totalExperience || 'N/A'} Exp</div>
                      {app.expectedSalary && <div className="text-[10px] font-mono text-emerald-600">Expected: {app.expectedSalary}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview Scheduled</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedAppDetail(app)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Application</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No matching candidate applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 4: SCHEDULED INTERVIEWS
         ========================================================================= */}
      {activeTab === 'interviews' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Scheduled Interviews & Feedback</h2>
              <p className="text-xs text-slate-500">Track candidate interview dates, assigned interviewers, and technical ratings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobAppsList
              .filter((a) => a.status === 'Interview' || a.interviewDate)
              .map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {app.jobTitle}
                    </span>
                    {app.rating && (
                      <div className="flex items-center text-amber-500 text-xs">
                        {'★'.repeat(app.rating)}
                        {'☆'.repeat(5 - app.rating)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900">{app.fullName || app.applicantName}</h4>
                    <p className="text-[11px] text-slate-500">{app.email} • {app.phone}</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Date:</span>
                      </span>
                      <span>{app.interviewDate || 'To Be Scheduled'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Time:</span>
                      </span>
                      <span>{app.interviewTime || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Interviewer:</span>
                      <span>{app.interviewer || 'Hiring Manager'}</span>
                    </div>
                  </div>

                  {app.interviewFeedback && (
                    <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                      "{app.interviewFeedback}"
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setSelectedAppDetail(app);
                      setActiveTab('applications');
                    }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Manage Interview Details
                  </button>
                </div>
              ))}

            {jobAppsList.filter((a) => a.status === 'Interview' || a.interviewDate).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                No interviews scheduled yet. You can schedule interviews from candidate application details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 5: CAREER PAGE SETTINGS
         ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Public Career Page Configuration</h2>
            <p className="text-xs text-slate-500">Configure global settings for the careers portal on the OhmVeda website</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="font-bold text-slate-900 block">Enable Public Career Portal</label>
                <p className="text-[11px] text-slate-500">Allow visitors to browse openings and apply</p>
              </div>
              <input
                type="checkbox"
                checked={careerSettings.enabled}
                onChange={(e) => setCareerSettings({ ...careerSettings, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Recruitment Contact Email *</label>
              <input
                type="email"
                required
                value={careerSettings.contactEmail}
                onChange={(e) => setCareerSettings({ ...careerSettings, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headline Text</label>
              <input
                type="text"
                value={careerSettings.headline}
                onChange={(e) => setCareerSettings({ ...careerSettings, headline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subheadline Description</label>
              <textarea
                rows={3}
                value={careerSettings.subheadline}
                onChange={(e) => setCareerSettings({ ...careerSettings, subheadline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Career Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
         MODAL 1: CREATE / EDIT JOB OPENING
         ========================================================================= */}
      {jobModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 my-8 text-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                <span>{jobRolesList.some((j) => j.id === editingJob.id) ? 'Edit Job Opening' : 'Create New Job Opening'}</span>
              </h2>
              <button
                onClick={() => {
                  setJobModalOpen(false);
                  setEditingJob(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">1. Basic Job Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
                    <select
                      value={PRESET_JOB_TITLES.includes(editingJob.title) ? editingJob.title : 'Custom / Other Title...'}
                      onChange={(e) => {
                        if (e.target.value !== 'Custom / Other Title...') {
                          setEditingJob({ ...editingJob, title: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium mb-1"
                    >
                      {PRESET_JOB_TITLES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {(!PRESET_JOB_TITLES.includes(editingJob.title) || editingJob.title === 'Custom / Other Title...') && (
                      <input
                        type="text"
                        required
                        placeholder="Type custom job title..."
                        value={editingJob.title === 'Custom / Other Title...' ? '' : editingJob.title}
                        onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job ID / Reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. OVT-EMB-001"
                      value={editingJob.jobIdRef || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, jobIdRef: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      list="dept-list"
                      placeholder="e.g. Embedded Systems"
                      value={editingJob.department}
                      onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                    />
                    <datalist id="dept-list">
                      {PRESET_DEPARTMENTS.map(d => <option key={d} value={d} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Type</label>
                    <select
                      value={editingJob.jobType || 'Full Time'}
                      onChange={(e) => setEditingJob({ ...editingJob, jobType: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Work Mode</label>
                    <select
                      value={editingJob.workMode || 'Hybrid'}
                      onChange={(e) => setEditingJob({ ...editingJob, workMode: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                    >
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      list="loc-list"
                      placeholder="e.g. Vadodara, Gujarat"
                      value={editingJob.location}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                    />
                    <datalist id="loc-list">
                      {PRESET_LOCATIONS.map(l => <option key={l} value={l} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience Required *</label>
                    <select
                      value={editingJob.experience}
                      onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                    >
                      {PRESET_EXPERIENCES.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Number of Positions</label>
                    <input
                      type="number"
                      min={1}
                      value={editingJob.openingsCount}
                      onChange={(e) => setEditingJob({ ...editingJob, openingsCount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SALARY / CTC */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">2. Salary / CTC Details</h3>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="salaryMode"
                      checked={editingJob.salaryMode === 'not_disclosed'}
                      onChange={() => setEditingJob({ ...editingJob, salaryMode: 'not_disclosed' })}
                    />
                    <span>Not Disclosed</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="salaryMode"
                      checked={editingJob.salaryMode === 'negotiable'}
                      onChange={() => setEditingJob({ ...editingJob, salaryMode: 'negotiable' })}
                    />
                    <span>Negotiable</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="salaryMode"
                      checked={editingJob.salaryMode === 'fixed'}
                      onChange={() => setEditingJob({ ...editingJob, salaryMode: 'fixed' })}
                    />
                    <span>Fixed Salary</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="salaryMode"
                      checked={editingJob.salaryMode === 'range' || !editingJob.salaryMode}
                      onChange={() => setEditingJob({ ...editingJob, salaryMode: 'range' })}
                    />
                    <span>Salary Range</span>
                  </label>
                </div>

                {editingJob.salaryMode !== 'not_disclosed' && editingJob.salaryMode !== 'negotiable' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Minimum CTC</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹3,00,000"
                        value={editingJob.minCtc || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, minCtc: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                      />
                    </div>

                    {editingJob.salaryMode === 'range' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Maximum CTC</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹6,00,000"
                          value={editingJob.maxCtc || ''}
                          onChange={(e) => setEditingJob({ ...editingJob, maxCtc: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>
                    )}

                    <div className="flex items-center pt-5">
                      <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingJob.isNegotiable ?? true}
                          onChange={(e) => setEditingJob({ ...editingJob, isNegotiable: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span>Salary is negotiable</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: JOB DESCRIPTION */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">3. Job Description</h3>
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">About the Role Summary *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingJob.description}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    placeholder="We are looking for an Embedded Firmware Engineer responsible for developing and maintaining firmware..."
                  />
                </div>
              </div>

              {/* SECTION 4: REQUIREMENTS & SKILLS TAGS */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">4. Requirements & Skills</h3>

                {/* Required Skills Tags */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Skills (Tags)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editingJob.keySkills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingJob.keySkills.filter((_, idx) => idx !== i);
                            setEditingJob({ ...editingJob, keySkills: updated });
                          }}
                          className="text-amber-600 hover:text-amber-900 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Embedded C, STM32, FreeRTOS"
                      value={newReqSkill}
                      onChange={(e) => setNewReqSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newReqSkill.trim()) {
                            setEditingJob({ ...editingJob, keySkills: [...editingJob.keySkills, newReqSkill.trim()] });
                            setNewReqSkill('');
                          }
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newReqSkill.trim()) {
                          setEditingJob({ ...editingJob, keySkills: [...editingJob.keySkills, newReqSkill.trim()] });
                          setNewReqSkill('');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* Preferred Skills Tags */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Skills (Optional)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(editingJob.preferredSkills || []).map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingJob.preferredSkills || []).filter((_, idx) => idx !== i);
                            setEditingJob({ ...editingJob, preferredSkills: updated });
                          }}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MQTT, BLE, FreeRTOS"
                      value={newPrefSkill}
                      onChange={(e) => setNewPrefSkill(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPrefSkill.trim()) {
                          setEditingJob({ ...editingJob, preferredSkills: [...(editingJob.preferredSkills || []), newPrefSkill.trim()] });
                          setNewPrefSkill('');
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 5: DYNAMIC RESPONSIBILITIES */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">5. Responsibilities</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJob({
                        ...editingJob,
                        responsibilities: [...editingJob.responsibilities, 'New responsibility item...'],
                      });
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Responsibility</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editingJob.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => {
                          const updated = [...editingJob.responsibilities];
                          updated[i] = e.target.value;
                          setEditingJob({ ...editingJob, responsibilities: updated });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingJob.responsibilities.filter((_, idx) => idx !== i);
                          setEditingJob({ ...editingJob, responsibilities: updated });
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: APPLICATION SETTINGS & STATUS */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">6. Application Settings & Status</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Application Method</label>
                    <select
                      value={editingJob.applicationMethod || 'website'}
                      onChange={(e) => setEditingJob({ ...editingJob, applicationMethod: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                    >
                      <option value="website">Website Form Application</option>
                      <option value="email">Direct Email Application</option>
                      <option value="external">External Application URL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Status</label>
                    <select
                      value={editingJob.status || 'Published'}
                      onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                    >
                      <option value="Published">Published (Visible on Portal)</option>
                      <option value="Draft">Draft (Internal Only)</option>
                      <option value="Paused">Paused (Temporarily Hidden)</option>
                      <option value="Closed">Closed (Not Accepting)</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {editingJob.applicationMethod === 'email' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Email for Applications</label>
                    <input
                      type="email"
                      value={editingJob.contactEmail || 'careers@ohmveda.com'}
                      onChange={(e) => setEditingJob({ ...editingJob, contactEmail: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                )}

                {editingJob.applicationMethod === 'external' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">External Application URL</label>
                    <input
                      type="url"
                      placeholder="https://www.linkedin.com/jobs/..."
                      value={editingJob.externalUrl || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, externalUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* SAVE BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setJobModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Job Position</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         MODAL 2: DETAILED CANDIDATE REVIEW & INTERVIEW SCHEDULER
         ========================================================================= */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 my-8 text-slate-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedAppDetail.fullName || selectedAppDetail.applicantName}</h3>
                <p className="text-xs text-slate-500">Applied for: <span className="font-bold text-slate-800">{selectedAppDetail.jobTitle}</span> ({selectedAppDetail.appliedAt})</p>
              </div>

              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
              
              {/* CONTACT & PERSONAL */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Email</span>
                  <span className="font-medium text-slate-900 break-all">{selectedAppDetail.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Phone</span>
                  <span className="font-medium text-slate-900">{selectedAppDetail.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Location</span>
                  <span className="font-medium text-slate-900">{selectedAppDetail.currentLocation || 'N/A'}</span>
                </div>
              </div>

              {/* PROFESSIONAL DETAILS */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Experience</span>
                  <span className="font-bold text-slate-900">{selectedAppDetail.totalExperience || selectedAppDetail.experienceYears || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Company</span>
                  <span className="font-medium text-slate-900">{selectedAppDetail.currentCompany || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Notice Period</span>
                  <span className="font-medium text-slate-900">{selectedAppDetail.noticePeriod || 'Immediate'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Expected CTC</span>
                  <span className="font-bold text-emerald-600 font-mono">{selectedAppDetail.expectedSalary || 'N/A'}</span>
                </div>
              </div>

              {/* LINKS & DOCUMENTS */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Links & Portfolio</span>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedAppDetail.linkedInUrl && (
                    <a href={selectedAppDetail.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> LinkedIn Profile
                    </a>
                  )}
                  {selectedAppDetail.gitHubUrl && (
                    <a href={selectedAppDetail.gitHubUrl} target="_blank" rel="noreferrer" className="text-slate-800 font-bold hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> GitHub Portfolio
                    </a>
                  )}
                  {selectedAppDetail.portfolioUrl && (
                    <a href={selectedAppDetail.portfolioUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> External Portfolio
                    </a>
                  )}
                </div>

                {(selectedAppDetail.resumeDataUrl || selectedAppDetail.resumeUrl) && (
                  <div className="pt-2">
                    <a
                      href={selectedAppDetail.resumeDataUrl || selectedAppDetail.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / View Resume ({selectedAppDetail.resumeFileName || 'CV.pdf'})</span>
                    </a>
                  </div>
                )}
              </div>

              {/* COVER LETTER */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Note / Intro</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {selectedAppDetail.coverLetter || 'No cover letter submitted.'}
                </div>
              </div>

              {/* INTERVIEW SCHEDULER & EVALUATION */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Interview & Internal Evaluation</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Interview Date</label>
                    <input
                      type="date"
                      value={selectedAppDetail.interviewDate || ''}
                      onChange={(e) => handleSaveAppDetails({ ...selectedAppDetail, interviewDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Interview Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:30 AM"
                      value={selectedAppDetail.interviewTime || ''}
                      onChange={(e) => handleSaveAppDetails({ ...selectedAppDetail, interviewTime: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Interviewer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tech Lead"
                      value={selectedAppDetail.interviewer || ''}
                      onChange={(e) => handleSaveAppDetails({ ...selectedAppDetail, interviewer: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-1 text-xl cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSaveAppDetails({ ...selectedAppDetail, rating: star })}
                        className={`hover:scale-110 transition-transform ${
                          (selectedAppDetail.rating || 0) >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internal HR Notes & Feedback</label>
                  <textarea
                    rows={2}
                    placeholder="Enter internal evaluation notes..."
                    value={selectedAppDetail.internalNotes || ''}
                    onChange={(e) => setSelectedAppDetail({ ...selectedAppDetail, internalNotes: e.target.value })}
                    onBlur={() => handleSaveAppDetails(selectedAppDetail)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
