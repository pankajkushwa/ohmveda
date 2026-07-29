import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, ArrowLeft, ChevronRight, CheckCircle2, 
  Send, Upload, Search, Mail, Clock, Award, DollarSign, Check, X
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

  // Form State
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

  useEffect(() => {
    if (initialJobId) {
      const found = jobRoles.find((j) => j.id === initialJobId);
      if (found) {
        setSelectedJob(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [initialJobId, jobRoles]);

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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* TOP BREADCRUMB */}
        <div className="flex items-center justify-between gap-4 mb-8 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-700" />
                <span>Home</span>
              </button>
            )}
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button 
              onClick={() => {
                setSelectedJob(null);
                setSubmitSuccess(null);
              }}
              className="hover:text-slate-900 font-semibold cursor-pointer"
            >
              Careers
            </button>
            {selectedJob && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-900 font-semibold truncate max-w-[200px]">
                  {selectedJob.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Direct Inquiries: <strong className="text-slate-900">{careerSettings.contactEmail}</strong></span>
          </div>
        </div>

        {/* =========================================================================
           VIEW A: LIST OF ACTIVE JOB OPENINGS (CLEAN & SIMPLE)
           ========================================================================= */}
        {!selectedJob && (
          <div className="space-y-8">
            
            {/* SIMPLE CLEAN HEADER */}
            <div className="border-b border-slate-200 pb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Careers at OhmVeda
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Explore open positions in engineering, hardware design, embedded systems, and software.
              </p>
            </div>

            {/* SEARCH & DEPARTMENT FILTER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              
              {/* Department Pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDeptFilter(dept)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedDeptFilter === dept
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

            </div>

            {/* JOB CARDS LIST */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {job.jobIdRef && (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {job.jobIdRef}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {job.department}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                        {job.jobType || 'Full Time'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location} ({job.workMode || 'On-site'})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Exp: {job.experience}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-slate-700">{job.salaryRange}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex md:flex-col items-center md:items-end justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Openings: <strong className="text-slate-700">{job.openingsCount}</strong>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setSubmitSuccess(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>View & Apply</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-6 space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">No Positions Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    There are currently no active openings matching your search criteria. You can send your resume directly to <strong>{careerSettings.contactEmail}</strong>.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
           VIEW B: JOB DETAILS & APPLICATION FORM (CLEAN & SIMPLE)
           ========================================================================= */}
        {selectedJob && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLS: JOB DESCRIPTION */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                
                <div className="space-y-3 pb-6 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {selectedJob.jobIdRef && (
                      <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedJob.jobIdRef}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                      {selectedJob.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedJob.jobType || 'Full Time'}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {selectedJob.title}
                  </h1>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-2">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Location</span>
                      <span className="font-medium text-slate-900">{selectedJob.location} ({selectedJob.workMode || 'On-site'})</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Experience</span>
                      <span className="font-medium text-slate-900">{selectedJob.experience}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Compensation</span>
                      <span className="font-mono font-medium text-slate-900">{selectedJob.salaryRange || 'Not Disclosed'}</span>
                    </div>
                  </div>
                </div>

                {/* ROLE DESCRIPTION */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">About the Role</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>

                {/* RESPONSIBILITIES */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Responsibilities</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {selectedJob.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* REQUIREMENTS */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Requirements</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* SKILLS */}
                {selectedJob.keySkills && selectedJob.keySkills.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.keySkills.map((sk, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs">
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
              
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-6">
                
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-slate-700" />
                    <span>Apply for Position</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill out the candidate form below.
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="py-6 text-center bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-lg">
                      ✓
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Application Submitted</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Thank you for applying. Reference ID: <strong className="font-mono">{submitSuccess}</strong>.
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(null)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Submit Another Response
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                    
                    {submitError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                        <X className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* PERSONAL DETAILS */}
                    <div className="space-y-3">
                      <span className="font-semibold text-slate-800 block border-b border-slate-100 pb-1">1. Personal Details</span>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            placeholder="rahul@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Phone *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Ahmedabad, Gujarat"
                          value={currentLocation}
                          onChange={(e) => setCurrentLocation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>

                    {/* PROFESSIONAL DETAILS */}
                    <div className="space-y-3 pt-2">
                      <span className="font-semibold text-slate-800 block border-b border-slate-100 pb-1">2. Experience & Salary</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Total Experience</label>
                          <input
                            type="text"
                            placeholder="e.g. 2.5 Years"
                            value={totalExperience}
                            onChange={(e) => setTotalExperience(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Expected CTC</label>
                          <input
                            type="text"
                            placeholder="e.g. ₹6,50,000 PA"
                            value={expectedSalary}
                            onChange={(e) => setExpectedSalary(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* LINKS & RESUME */}
                    <div className="space-y-3 pt-2">
                      <span className="font-semibold text-slate-800 block border-b border-slate-100 pb-1">3. Resume & Portfolio</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">LinkedIn Profile</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            value={linkedInUrl}
                            onChange={(e) => setLinkedInUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-700 mb-1">GitHub / Portfolio</label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            value={gitHubUrl}
                            onChange={(e) => setGitHubUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>

                      {/* RESUME UPLOAD */}
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Resume File (PDF / DOCX)</label>
                        <div className="p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center hover:bg-slate-100 transition-all cursor-pointer relative">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                          <p className="text-xs font-medium text-slate-800">
                            {resumeFile ? resumeFile.name : 'Upload Resume Document'}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      </div>
                    </div>

                    {/* COVER NOTE */}
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Cover Note *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe your technical experience and interest in this role..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {submitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Application</span>
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
