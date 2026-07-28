import React, { useState } from 'react';
import { 
  Briefcase, Plus, Edit3, Trash2, FileText, Users, Eye, CheckCircle2, AlertTriangle, X, Save, Clock, MapPin, Award, ExternalLink, Download, Mail, Phone
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

  // Helper form inputs
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [skillsText, setSkillsText] = useState('');

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
    setResponsibilitiesText(newJob.responsibilities.join('\n'));
    setRequirementsText(newJob.requirements.join('\n'));
    setSkillsText(newJob.keySkills.join(', '));
    setJobModalOpen(true);
  };

  const handleOpenEditJobRole = (job: JobRole) => {
    setEditingJob(JSON.parse(JSON.stringify(job)));
    setResponsibilitiesText(job.responsibilities ? job.responsibilities.join('\n') : '');
    setRequirementsText(job.requirements ? job.requirements.join('\n') : '');
    setSkillsText(job.keySkills ? job.keySkills.join(', ') : '');
    setJobModalOpen(true);
  };

  const handleSaveJobRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const parsedResp = responsibilitiesText.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
    const parsedReq = requirementsText.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
    const parsedSkills = skillsText.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    const finalJob: JobRole = {
      ...editingJob,
      responsibilities: parsedResp,
      requirements: parsedReq,
      keySkills: parsedSkills,
    };

    const exists = jobRolesList.some((j) => j.id === finalJob.id);
    let updated: JobRole[];

    if (exists) {
      updated = jobRolesList.map((j) => (j.id === finalJob.id ? finalJob : j));
      addAdminLog({
        action: 'UPDATE',
        target: 'STORE',
        title: `Updated Job Role: ${finalJob.title}`,
        details: `Dept: ${finalJob.department} | Openings: ${finalJob.openingsCount}`,
      });
      showToast(`Job opening "${finalJob.title}" saved.`, 'success');
    } else {
      updated = [finalJob, ...jobRolesList];
      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: `Added Job Opening: ${finalJob.title}`,
        details: `Dept: ${finalJob.department} | Openings: ${finalJob.openingsCount}`,
      });
      showToast(`New job position "${finalJob.title}" created.`, 'success');
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
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <span>Careers, Positionings & Candidate Applications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single page management for job vacancies, job descriptions, and candidate applications
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('positions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'positions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Positions ({jobRolesList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'applications'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
            <h2 className="text-sm font-bold text-slate-900">Active Job Postings</h2>
            <button
              onClick={handleOpenAddJobRole}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Opening</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobRolesList.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {job.department}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        job.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {job.isActive ? 'Active Hiring' : 'Paused'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{job.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.experience}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    Posted: <span className="text-slate-700 font-medium">{job.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditJobRole(job)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                      title="Edit Job Role"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteJobRole(job.id, job.title)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg"
                      title="Delete Job Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {jobRolesList.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                No job roles created yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: APPLICANTS LIST */}
      {activeSubTab === 'applications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Submitted Candidate Applications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Position</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobAppsList.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{app.fullName}</p>
                        <p className="text-[10px] text-slate-500">{app.email} • {app.phone}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{app.jobTitle}</td>
                    <td className="py-3.5 px-4 text-slate-600">{app.experienceYears || 'N/A'} Years</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        <option value="NEW">New</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEWED">Interviewed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="HIRED">Hired</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedAppDetail(app)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {jobAppsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No candidate applications submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {jobModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 my-8 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                <span>
                  {jobRolesList.some((j) => j.id === editingJob.id) ? 'Edit Job Opening' : 'Create Job Opening'}
                </span>
              </h2>
              <button
                onClick={() => {
                  setJobModalOpen(false);
                  setEditingJob(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobRole} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Type</label>
                  <input
                    type="text"
                    value={editingJob.workType}
                    onChange={(e) => setEditingJob({ ...editingJob, workType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={editingJob.salaryRange}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Skills (comma separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="C/C++, ESP32, FreeRTOS, Modbus"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setJobModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Job Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Resume View Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Candidate Application Details</h3>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-sm text-slate-900">{selectedAppDetail.fullName}</p>
                <p className="text-slate-600 font-medium">Applied for: {selectedAppDetail.jobTitle}</p>
                <div className="flex items-center gap-3 text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedAppDetail.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedAppDetail.phone}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700">Cover Note / Cover Letter:</p>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedAppDetail.coverLetter || 'No cover letter provided.'}
                </p>
              </div>

              {selectedAppDetail.resumeUrl && (
                <div className="pt-2">
                  <a
                    href={selectedAppDetail.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Candidate Resume / Portfolio</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
