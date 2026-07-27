import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, MapPin, Users, ArrowLeft, ChevronRight, CheckCircle2, 
  Send, Upload, FileText, Check, Search, Building, DollarSign, 
  Award, X, Zap, GraduationCap, ArrowUpRight, ShieldCheck, Clock
} from 'lucide-react';
import { JobRole } from '../types';
import { addJobApplication, addAdminLog } from '../services/dataStorage';

interface CareersSectionProps {
  jobRoles: JobRole[];
  onBackToHome?: () => void;
  onOpenInquiry?: (category?: string) => void;
  initialJobId?: string | null;
}

export const CareersSection: React.FC<CareersSectionProps> = ({
  jobRoles = [],
  onBackToHome,
  initialJobId,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobRole | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto select initialJobId if passed
  useEffect(() => {
    if (initialJobId) {
      const found = jobRoles.find((j) => j.id === initialJobId);
      if (found) {
        setSelectedJob(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [initialJobId, jobRoles]);

  const activeJobs = jobRoles.filter((j) => j.isActive);
  const departments = ['All', ...Array.from(new Set(activeJobs.map((j) => j.department)))];

  const filteredJobs = activeJobs.filter((job) => {
    const matchesDept = selectedDeptFilter === 'All' || job.department === selectedDeptFilter;
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.keySkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  // Resume File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('File size exceeds 5MB limit. Please upload a smaller document.');
      return;
    }

    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const formattedSize = (file.size / 1024).toFixed(1) + ' KB';
      setResumeFile({
        name: file.name,
        size: formattedSize,
        dataUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!applicantName.trim() || !email.trim() || !phone.trim() || !coverLetter.trim()) {
      setSubmitError('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const newApp = addJobApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        applicantName: applicantName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        experienceYears: experienceYears.trim() || selectedJob.experience,
        currentCompany: currentCompany.trim(),
        coverLetter: coverLetter.trim(),
        resumeFileName: resumeFile?.name || 'Resume_Uploaded.pdf',
        resumeDataUrl: resumeFile?.dataUrl || '',
      });

      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: 'New Job Application Submitted',
        details: `${applicantName} applied for ${selectedJob.title} (${selectedJob.department})`,
      });

      setSubmitting(false);
      setSubmitSuccess(newApp.id);

      // Reset form
      setApplicantName('');
      setEmail('');
      setPhone('');
      setExperienceYears('');
      setCurrentCompany('');
      setCoverLetter('');
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setSubmitError('Failed to record job application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* SECTION CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* TOP BREADCRUMB */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Home</span>
              </button>
            )}
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button 
              onClick={() => {
                setSelectedJob(null);
                setSubmitSuccess(null);
              }}
              className={`hover:text-blue-600 font-bold transition-colors cursor-pointer ${!selectedJob ? 'text-blue-600' : 'text-slate-500'}`}
            >
              Careers
            </button>
            {selectedJob && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs">{selectedJob.title}</span>
              </>
            )}
          </div>

          {selectedJob ? (
            <button
              onClick={() => {
                setSelectedJob(null);
                setSubmitSuccess(null);
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Back to All Openings</span>
            </button>
          ) : onBackToHome ? (
            <button
              onClick={onBackToHome}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Return Home</span>
            </button>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          {selectedJob ? (
            /* ==========================================================
               JOB DETAIL & APPLICATION VIEW (SELECTED JOB)
               ========================================================== */
            <motion.div
              key="job-detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* JOB HEADER CARD */}
              <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                        {selectedJob.department}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{selectedJob.openingsCount} {selectedJob.openingsCount === 1 ? 'Opening' : 'Openings'}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
                        {selectedJob.workType || 'Full-Time'}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {selectedJob.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{selectedJob.location}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        <span>Experience: {selectedJob.experience}</span>
                      </span>
                      {selectedJob.salaryRange && (
                        <span className="flex items-center gap-1.5 font-mono font-bold text-emerald-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{selectedJob.salaryRange}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href="#apply-form"
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply Now</span>
                  </a>
                </div>

                {/* JOB CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                  
                  {/* LEFT 2 COLUMNS: JD DETAILS */}
                  <div className="lg:col-span-2 space-y-8 text-slate-700 text-xs leading-relaxed">
                    
                    {/* Role Overview */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span>Role Overview</span>
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Key Responsibilities</span>
                        </h3>
                        <div className="space-y-2">
                          {selectedJob.responsibilities.map((resp, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="font-medium text-slate-800">{resp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>Qualifications & Requirements</span>
                        </h3>
                        <div className="space-y-2">
                          {selectedJob.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span className="font-medium text-slate-800">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Skills */}
                    {selectedJob.keySkills && selectedJob.keySkills.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                          Required Skills & Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.keySkills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs font-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* RIGHT COLUMN: SUMMARY */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                        Job Summary
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-500">Department</span>
                          <span className="font-bold text-slate-900">{selectedJob.department}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-500">Employment Type</span>
                          <span className="font-bold text-slate-900">{selectedJob.workType || 'Full-Time'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-500">Location</span>
                          <span className="font-bold text-blue-600">{selectedJob.location}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-500">Experience Required</span>
                          <span className="font-bold text-slate-900">{selectedJob.experience}</span>
                        </div>
                        {selectedJob.salaryRange && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500">Compensation</span>
                            <span className="font-bold font-mono text-emerald-600">{selectedJob.salaryRange}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Direct Hiring Process</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Applications submitted here are directly routed to OhmVeda's technical leads and recruitment team in Ahmedabad.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* APPLICATION FORM SECTION */}
              <div id="apply-form" className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Application Form</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Applying for position: <strong className="text-slate-900">{selectedJob.title}</strong>
                  </p>
                </div>

                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4 text-center max-w-xl mx-auto"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900">Application Received</h3>
                      <p className="text-xs text-emerald-800">
                        Reference Number: <span className="font-mono font-bold text-slate-900 bg-white border border-emerald-200 px-2 py-0.5 rounded">{submitSuccess}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Thank you for applying to OhmVeda. Our hiring team will review your application and get back to you shortly.
                    </p>
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSubmitSuccess(null)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Submit Another
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        View All Positions
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-5 text-xs">
                    
                    {submitError && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-bold">Full Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-xs font-medium"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-bold">Email Address <span className="text-rose-500">*</span></label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-xs font-medium"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-bold">Phone Number <span className="text-rose-500">*</span></label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-xs font-medium"
                        />
                      </div>

                      {/* Experience */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-bold">Years of Experience</label>
                        <input
                          type="text"
                          placeholder="e.g. 2 Years / Fresher"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-xs font-medium"
                        />
                      </div>

                    </div>

                    {/* Current Organization */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Current Organization or University</label>
                      <input
                        type="text"
                        placeholder="e.g. Tech Solutions Ltd / GTU Ahmedabad"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-xs font-medium"
                      />
                    </div>

                    {/* Cover Note */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Brief Intro & Technical Background <span className="text-rose-500">*</span></label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Share a brief overview of your technical background, key projects, and why you are interested in joining OhmVeda..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-xs font-medium leading-relaxed"
                      />
                    </div>

                    {/* RESUME UPLOAD */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Resume / CV (PDF, DOC - Max 5MB)</label>
                      
                      {resumeFile ? (
                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs truncate max-w-xs">{resumeFile.name}</div>
                              <div className="text-[10px] text-blue-700 font-mono">Size: {resumeFile.size}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setResumeFile(null)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-200 hover:border-blue-600 bg-slate-50 hover:bg-blue-50/40 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all text-center space-y-1 group">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">Upload your resume file</span>
                            <span className="text-[10px] text-slate-400 font-mono">PDF, DOC, or DOCX</span>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Application</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </motion.div>
          ) : (
            /* ==========================================================
               MAIN CAREERS LANDING & JOB OPENINGS LISTING
               ========================================================== */
            <motion.div
              key="job-list"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* HERO BANNER */}
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Careers at OhmVeda</span>
                </div>

                <div className="space-y-2 max-w-3xl">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Join Our Engineering Team
                  </h1>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    We are building innovative technology solutions across embedded systems, electronics, IoT, software platforms, and hardware engineering in Ahmedabad.
                  </p>
                </div>

                {/* COMPANY HIGHLIGHTS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Hardware & Software R&D</h4>
                      <p className="text-[11px] text-slate-500">Embedded, firmware, web & IoT stacks</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Ahmedabad Engineering Hub</h4>
                      <p className="text-[11px] text-slate-500">Collaborative modern workspace</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Career Growth</h4>
                      <p className="text-[11px] text-slate-500">Clear path for engineers & team leads</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search positions or skills (e.g. Firmware, PCB, React, Sales)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none text-xs font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Department Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase font-mono shrink-0 mr-1">Dept:</span>
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDeptFilter(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          selectedDeptFilter === dept
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* OPENINGS LIST GRID */}
              {filteredJobs.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No Positions Found</h3>
                  <p className="text-xs text-slate-500">Try adjusting your search criteria or selecting another department.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDeptFilter('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      onClick={() => {
                        setSelectedJob(job);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200">
                            {job.department}
                          </span>
                          
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-medium flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>{job.openingsCount} {job.openingsCount === 1 ? 'Opening' : 'Openings'}</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between gap-2">
                            <span>{job.title}</span>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        {/* SKILLS TAGS */}
                        {job.keySkills && job.keySkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.keySkills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-medium">
                                {skill}
                              </span>
                            ))}
                            {job.keySkills.length > 4 && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">
                                +{job.keySkills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* FOOTER META & CTA */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>{job.location}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono">{job.experience}</span>
                        </div>

                        <span className="px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1">
                          <span>View Role</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                    </motion.div>
                  ))}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
