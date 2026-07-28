import React, { useState } from 'react';
import { 
  Briefcase, Plus, Edit3, Trash2, FileText, Users, Eye, CheckCircle2, AlertTriangle, X, Save, Clock, MapPin, Award, ExternalLink
} from 'lucide-react';
import { JobApplication, JobRole } from '../../types';
import { 
  addAdminLog, getStoredJobApplications, getStoredJobRoles, saveStoredJobApplications, saveStoredJobRoles 
} from '../../services/dataStorage';

interface CareersAndApplicantsManagerProps {
  jobRoles?: JobRole[];
  onUpdateJobRoles?: (roles: JobRole[]) => void;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const CareersAndApplicantsManager: React.FC<CareersAndApplicantsManagerProps> = ({
  jobRoles,
  onUpdateJobRoles,
  showToast,
  openDeleteConfirm,
}) => {
  // Inner Sub-Tab or Combined Layout
  const [activeSubTab, setActiveSubTab] = useState<'positions' | 'applications'>('positions');

  // Job Roles State
  const [jobRolesList, setJobRolesList] = useState<JobRole[]>(jobRoles || getStoredJobRoles());
  const [jobModalOpen, setJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobRole | null>(null);

  // Applications State
  const [jobAppsList, setJobAppsList] = useState<JobApplication[]>(getStoredJobApplications());
  const [selectedAppDetail, setSelectedAppDetail] = useState<JobApplication | null>(null);

  // --- JOB ROLES CRUD ---
  const handleOpenAddJobRole = () => {
    const newJob: JobRole = {
      id: `job-role-${Date.now()}`,
      title: 'Embedded Firmware Developer',
      department: 'Software',
      location: 'Ahmedabad, India (Hybrid)',
      workType: 'Full-Time',
      openingsCount: 1,
      experience: '2-5 Years',
      salaryRange: '₹6,00,000 - ₹12,00,000 PA',
      description: 'Design and deploy real-time C/C++ firmware for industrial edge gateways and MCU boards.',
      responsibilities: [
        'Develop C/C++ firmware for ESP32 and STM32 microcontrollers.',
        'Implement FreeRTOS tasks, MQTT clients, and Modbus RTU communication stacks.'
      ],
      requirements: [
        'Degree in Electronics, Computer Science, or Electrical Engineering.',
        '2+ years experience in microcontroller firmware development.'
      ],
      keySkills: ['C/C++', 'ESP32', 'FreeRTOS', 'MQTT', 'Modbus'],
      isActive: true,
      postedDate: new Date().toISOString().split('T')[0],
    };
    setEditingJob(newJob);
    setJobModalOpen(true);
  };

  const handleOpenEditJobRole = (job: JobRole) => {
    setEditingJob(JSON.parse(JSON.stringify(job)));
    setJobModalOpen(true);
  };

  const handleSaveJobRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const exists = jobRolesList.some((j) => j.id === editingJob.id);
    let updated: JobRole[];

    if (exists) {
      updated = jobRolesList.map((j) => (j.id === editingJob.id ? editingJob : j));
      addAdminLog({
        action: 'UPDATE',
        target: 'STORE',
        title: `Updated Job Role: ${editingJob.title}`,
        details: `Dept: ${editingJob.department} | Openings: ${editingJob.openingsCount}`,
      });
      showToast(`Job opening "${editingJob.title}" saved.`, 'success');
    } else {
      updated = [editingJob, ...jobRolesList];
      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: `Added Job Opening: ${editingJob.title}`,
        details: `Dept: ${editingJob.department} | Openings: ${editingJob.openingsCount}`,
      });
      showToast(`New job position "${editingJob.title}" created.`, 'success');
    }

    setJobRolesList(updated);
    saveStoredJobRoles(updated);
    if (onUpdateJobRoles) onUpdateJobRoles(updated);

    setJobModalOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJobRole = (id: string, title: string) => {
    openDeleteConfirm(
      'Delete Job Position',
      `Are you sure you want to delete job opening "${title}"?`,
      () => {
        const updated = jobRolesList.filter((j) => j.id !== id);
        setJobRolesList(updated);
        saveStoredJobRoles(updated);
        if (onUpdateJobRoles) onUpdateJobRoles(updated);
        addAdminLog({
          action: 'DELETE',
          target: 'STORE',
          title: `Deleted Job Position: ${title}`,
          details: `ID: ${id}`,
        });
        showToast(`Job position "${title}" deleted.`, 'success');
      }
    );
  };

  const handleUpdateAppStatus = (appId: string, status: JobApplication['status']) => {
    const updated = jobAppsList.map((a) => (a.id === appId ? { ...a, status } : a));
    setJobAppsList(updated);
    saveStoredJobApplications(updated);
    showToast(`Application status updated to "${status}".`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Combined Controls */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>Careers, Positionings & Candidate Applications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified management for job vacancies, job descriptions, and submitted candidate applications
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('positions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'positions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Positions ({jobRolesList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'applications'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Applications ({jobAppsList.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-SECTION 1: JOB POSITIONS */}
      {activeSubTab === 'positions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Active Job Postings</h2>
            <button
              onClick={handleOpenAddJobRole}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Opening</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobRolesList.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {job.department}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        job.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {job.isActive ? 'Active Hiring' : 'Paused'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{job.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{job.experience}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    Posted: <span className="text-slate-400">{job.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditJobRole(job)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                      title="Edit Job Role"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteJobRole(job.id, job.title)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 rounded-lg"
                      title="Delete Job Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {jobRolesList.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No job roles created yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: CANDIDATE APPLICATIONS */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200">Received Candidate Resumes & Applications</h2>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Applied Position</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {jobAppsList.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{app.fullName}</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{app.jobTitle}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300">{app.email}</div>
                        <div className="text-[10px] text-slate-500">{app.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{app.appliedDate}</td>
                      <td className="py-3 px-4">
                        <select
                          value={app.status || 'pending'}
                          onChange={(e) =>
                            handleUpdateAppStatus(app.id, e.target.value as JobApplication['status'])
                          }
                          className="bg-slate-950 border border-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="reviewing">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedAppDetail(app)}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {jobAppsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No candidate job applications submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Job Role Create/Edit Modal */}
      {jobModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 my-8 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <span>
                  {jobRolesList.some((j) => j.id === editingJob.id) ? 'Edit Job Opening' : 'Create Job Opening'}
                </span>
              </h2>
              <button
                onClick={() => {
                  setJobModalOpen(false);
                  setEditingJob(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobRole} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Experience Required</label>
                  <input
                    type="text"
                    required
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={editingJob.salaryRange || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="jobActive"
                  checked={editingJob.isActive}
                  onChange={(e) => setEditingJob({ ...editingJob, isActive: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                <label htmlFor="jobActive" className="text-xs font-bold text-slate-300">
                  Accept Active Candidate Applications
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setJobModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Job Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Application Detail Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Candidate Application</span>
                <h2 className="text-base font-bold text-white">{selectedAppDetail.fullName}</h2>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">Applied Position:</span>
                  <span className="font-bold text-white">{selectedAppDetail.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Experience:</span>
                  <span className="font-bold text-white">{selectedAppDetail.experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Email:</span>
                  <span className="font-bold text-slate-200">{selectedAppDetail.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Phone:</span>
                  <span className="font-bold text-slate-200">{selectedAppDetail.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-bold block mb-1">Cover Note / Message:</span>
                <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
                  {selectedAppDetail.coverNote || 'No cover note attached.'}
                </p>
              </div>

              {selectedAppDetail.resumeUrl && (
                <div>
                  <span className="text-slate-400 text-[11px] font-bold block mb-1">Resume / Portfolio Link:</span>
                  <a
                    href={selectedAppDetail.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-600/30"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Resume File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
