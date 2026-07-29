import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, MapPin, Users, ArrowLeft, ChevronRight, CheckCircle2, 
  Send, Upload, FileText, Check, Search, Building, DollarSign, 
  Award, X, Zap, GraduationCap, ArrowUpRight, ShieldCheck, Clock, ExternalLink,
  Linkedin, Github, Globe, HeartHandshake, Phone, Mail, User
} from 'lucide-react';
import { JobApplication, JobRole } from '../types';
import { addJobApplication, addAdminLog, getStoredCareerSettings } from '../services/dataStorage';

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
  const careerSettings = getStoredCareerSettings();
  const [selectedJob, setSelectedJob] = useState<JobRole | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Comprehensive Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Professional
  const [totalExperience, setTotalExperience] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [highestQualification, setHighestQualification] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 15 Days');

  // Links & Docs
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);

  // Questionnaire
  const [whyJoin, setWhyJoin] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState('Yes');
  const [availableForInterview, setAvailableForInterview] = useState('Yes');

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

  // Only show published/active job roles
  const activeJobs = jobRoles.filter((j) => j.status === 'Published' || (j.isActive && (!j.status || j.status === 'Published')));
  const departments = ['All', ...Array.from(new Set(activeJobs.map((j) => j.department)))];

  const filteredJobs = activeJobs.filter((job) => {
    const matchesDept = selectedDeptFilter === 'All' || job.department === selectedDeptFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      job.title.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      (job.keySkills || []).some((s) => s.toLowerCase().includes(q)) ||
      (job.location || '').toLowerCase().includes(q);

    return matchesDept && matchesSearch;
  });

  // Resume File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('File size exceeds 10MB limit. Please upload a smaller document.');
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

    if (!fullName.trim() || !email.trim() || !phone.trim() || !coverLetter.trim()) {
      setSubmitError('Please fill in all mandatory fields marked with *');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const newApp = addJobApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        fullName: fullName.trim(),
        applicantName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        currentLocation: currentLocation.trim(),
        dateOfBirth,
        totalExperience: totalExperience.trim() || selectedJob.experience,
        experienceYears: totalExperience.trim() || selectedJob.experience,
        relevantExperience: relevantExperience.trim(),
        currentCompany: currentCompany.trim(),
        highestQualification: highestQualification.trim(),
        currentSalary: currentSalary.trim(),
        expectedSalary: expectedSalary.trim(),
        noticePeriod,
        portfolioUrl: portfolioUrl.trim(),
        linkedInUrl: linkedInUrl.trim(),
        gitHubUrl: gitHubUrl.trim(),
        whyJoin: whyJoin.trim(),
        willingToRelocate,
        availableForInterview,
        coverLetter: coverLetter.trim(),
        resumeFileName: resumeFile?.name || 'Resume_Document.pdf',
        resumeDataUrl: resumeFile?.dataUrl || '',
      });

      addAdminLog({
        action: 'ADD',
        target: 'CAREERS',
        title: 'New Candidate Job Application',
        details: `${fullName} applied for ${selectedJob.title} (${selectedJob.department})`,
      });

      setSubmitting(false);
      setSubmitSuccess(newApp.id);

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setCurrentLocation('');
      setDateOfBirth('');
      setTotalExperience('');
      setRelevantExperience('');
      setCurrentCompany('');
      setHighestQualification('');
      setCurrentSalary('');
      setExpectedSalary('');
      setNoticePeriod('Immediate / 15 Days');
      setPortfolioUrl('');
      setLinkedInUrl('');
      setGitHubUrl('');
      setWhyJoin('');
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
              className="hover:text-blue-600 font-bold cursor-pointer"
            >
              Careers
            </button>
            {selectedJob && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-900 font-bold truncate max-w-[200px]">
                  {selectedJob.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>Direct Inquiries: <strong className="text-slate-800">{careerSettings.contactEmail}</strong></span>
          </div>
        </div>

        {/* =========================================================================
           VIEW A: LIST OF ACTIVE JOB OPENINGS
           ========================================================================= */}
        {!selectedJob && (
          <div className="space-y-10">
            
            {/* HERO HEADER BANNER */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>OhmVeda Talent Acquisition</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {careerSettings.headline || 'Build the Future of Hardware & Embedded Intelligence'}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {careerSettings.subheadline || 'Join our multidisciplinary engineering team in Vadodara and Ahmedabad to build connected edge systems, custom PCBs, and high-performance software.'}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Competitive Compensation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Advanced R&D Hardware Labs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hybrid Work Options</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH & DEPARTMENT FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Department Pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDeptFilter(dept)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedDeptFilter === dept
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

            </div>

            {/* JOB CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-amber-500/50 hover:shadow-lg transition-all p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {job.jobIdRef && (
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {job.jobIdRef}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {job.department}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{job.title}</h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
                        {job.jobType || 'Full Time'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {job.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{job.location} ({job.workMode || 'On-site'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Exp: {job.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-700 font-mono truncate">{job.salaryRange || 'Salary Not Disclosed'}</span>
                      </div>
                    </div>

                    {/* Key Skills Tags */}
                    {job.keySkills && job.keySkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.keySkills.slice(0, 6).map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Openings: <strong className="text-slate-700">{job.openingsCount}</strong>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setSubmitSuccess(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>View & Apply</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No Positions Matching Filter</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try searching for another keyword or select a different department filter. You can also send an open resume to <strong>{careerSettings.contactEmail}</strong>.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
           VIEW B: JOB DETAILS & APPLICATION FORM
           ========================================================================= */}
        {selectedJob && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLS: JOB DESCRIPTION & REQUIREMENTS */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                
                <div className="space-y-3 pb-6 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedJob.jobIdRef && (
                      <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedJob.jobIdRef}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {selectedJob.department}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {selectedJob.jobType || 'Full Time'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {selectedJob.title}
                  </h1>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700 pt-2">
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Location</span>
                        <span className="font-medium text-slate-900">{selectedJob.location} ({selectedJob.workMode || 'On-site'})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Experience</span>
                        <span className="font-medium text-slate-900">{selectedJob.experience}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                      <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Compensation</span>
                        <span className="font-bold text-emerald-700 font-mono">{selectedJob.salaryRange || 'Not Disclosed'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROLE SUMMARY */}
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">About the Role</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                  {selectedJob.aboutRole && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2">
                      {selectedJob.aboutRole}
                    </p>
                  )}
                </div>

                {/* RESPONSIBILITIES */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">Key Responsibilities</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {selectedJob.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* REQUIREMENTS */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">Required Qualifications & Skills</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* SKILLS TAGS */}
                {selectedJob.keySkills && selectedJob.keySkills.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Required Technical Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.keySkills.map((sk, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* RIGHT COL: CANDIDATE APPLICATION FORM */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5 sticky top-6">
                
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-amber-600" />
                    <span>Apply for this Position</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete the application form below. Our talent acquisition lead will contact shortlisted candidates.
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="py-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                      ✓
                    </div>
                    <h4 className="text-base font-extrabold text-emerald-900">Application Submitted!</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Thank you for applying. Reference ID: <strong className="font-mono">{submitSuccess}</strong>.
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(null)}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Submit Another Response
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                    
                    {submitError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                        <X className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* PERSONAL DETAILS */}
                    <div className="space-y-3">
                      <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">1. Personal Information</span>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="rahul@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Current City / Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Ahmedabad, Gujarat"
                          value={currentLocation}
                          onChange={(e) => setCurrentLocation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* PROFESSIONAL DETAILS */}
                    <div className="space-y-3 pt-2">
                      <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">2. Professional Details</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Total Experience</label>
                          <input
                            type="text"
                            placeholder="e.g. 2.5 Years"
                            value={totalExperience}
                            onChange={(e) => setTotalExperience(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Current Company</label>
                          <input
                            type="text"
                            placeholder="e.g. Electronics Pvt Ltd"
                            value={currentCompany}
                            onChange={(e) => setCurrentCompany(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Expected CTC</label>
                          <input
                            type="text"
                            placeholder="e.g. ₹6,50,000 PA"
                            value={expectedSalary}
                            onChange={(e) => setExpectedSalary(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Notice Period</label>
                          <select
                            value={noticePeriod}
                            onChange={(e) => setNoticePeriod(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="Immediate">Immediate Joiner</option>
                            <option value="15 Days">15 Days</option>
                            <option value="30 Days">30 Days</option>
                            <option value="60 Days">60 Days</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* LINKS & RESUME UPLOAD */}
                    <div className="space-y-3 pt-2">
                      <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">3. Resume & Profiles</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            value={linkedInUrl}
                            onChange={(e) => setLinkedInUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">GitHub / Portfolio</label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            value={gitHubUrl}
                            onChange={(e) => setGitHubUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* RESUME ATTACHMENT */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Attach Resume (PDF / DOCX)</label>
                        <div className="p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center hover:bg-slate-100 transition-all cursor-pointer relative">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-800">
                            {resumeFile ? resumeFile.name : 'Click or Drag Resume File Here'}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      </div>
                    </div>

                    {/* COVER LETTER / INTRO */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cover Note / Why join OhmVeda? *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Briefly describe your technical background and why you are interested in this position..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {submitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Candidate Application</span>
                        </>
                      )}
                    </button>

                  </form>
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
