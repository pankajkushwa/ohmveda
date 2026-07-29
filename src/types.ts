export interface ProductCategory {
  id: string;
  label: string;
  description?: string;
}

export interface StoreCategory {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface TechnicalDocument {
  id: string;
  title: string;
  fileType: 'Datasheet' | 'Schematic' | 'Manual' | 'CAD' | 'Zip' | string;
  url: string;
  fileSize?: string;
  uploadedAt?: string;
}

export interface StoreQaItem {
  id: string;
  itemId: string; // StoreItem ID
  userName: string;
  userEmail?: string;
  question: string;
  askedAt: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isAnswered: boolean;
}

export interface StoreReviewItem {
  id: string;
  itemId: string; // StoreItem ID
  userName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  price: number; // in INR / USD currency standard
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  shortDesc: string;
  specs: string[];
  sku: string;
  badge?: string;
  documents?: TechnicalDocument[];
}

export interface CartItem {
  product: StoreItem;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface ServiceCategory {
  id: string;
  code: '01' | '02' | '03' | '04';
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  deliverables: string[];
  techStack: string[];
  highlightFeatures: string[];
}

export interface DivisionItem {
  id: string;
  title: string;
  category: 'electronics' | 'software';
  description: string;
  tags: string[];
  icon: string;
  details?: string[];
}

export interface PipelineStage {
  step: number;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  keyOutputs: string[];
  toolsAndTech: string[];
  hardwareOrSoftware: 'hardware' | 'software' | 'hybrid';
}

export interface SoftwareCapability {
  title: string;
  description: string;
  items: string[];
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  category: 'type' | 'hardware' | 'connectivity' | 'software' | 'mobile' | 'cloud';
  description: string;
  priceWeight: number; // For estimated complexity calculation
  timeDays: number;
}

export interface TelemetryState {
  powerOn: boolean;
  pinOutput: boolean;
  temperature: number;
  humidity: number;
  voltage: number;
  vibration: number;
  rssi: number;
  sensorStatus: 'NOMINAL' | 'WARNING' | 'ALERT';
  lastMqttMessage: string;
  packetCount: number;
  batteryLevel: number;
}

export interface ProjectInquiry {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectCategory: 'standalone_software' | 'connected_product' | 'electronics_embedded' | 'iot_automation' | 'rd_prototyping';
  budgetRange: string;
  timeline: string;
  description: string;
  selectedModules: string[];
}

export interface TurnkeyProduct {
  id: string;
  title: string;
  category: string;
  categoryGroup: string;
  sku: string;
  shortDesc: string;
  fullDesc: string;
  badge: string;
  iconName?: string;
  datasheetSize: string;
  specs: string[];
  blockDiagram: string[];
  techParams: {
    mcu: string;
    memory: string;
    connectivity: string;
    power: string;
    enclosure: string;
    software: string;
    tempRange: string;
  };
  applications: string[];
  image?: string;
  images?: string[];
}

export interface JobRole {
  id: string;
  jobIdRef?: string; // e.g. "OVT-EMB-001"
  title: string;
  department: string; // e.g. 'Embedded Systems', 'Hardware & Electronics', 'PCB Design', 'IoT & Automation', 'Software Development', 'Web Development', 'Mobile Application', 'IT & Cloud', 'R&D'
  jobType?: 'Full Time' | 'Part Time' | 'Internship' | 'Freelance' | 'Contract' | string;
  workType?: string; // legacy support
  workMode?: 'On-site' | 'Hybrid' | 'Remote' | string;
  location: string; // e.g. "Vadodara, Gujarat", "Ahmedabad, Gujarat", "Remote", "Multiple Locations"
  openingsCount: number; // e.g. 2
  experience: 'Fresher' | '0–1 Years' | '1–3 Years' | '3–5 Years' | '5+ Years' | string;
  
  // Salary / CTC
  salaryMode?: 'not_disclosed' | 'negotiable' | 'fixed' | 'range';
  minCtc?: string;
  maxCtc?: string;
  currency?: string;
  isNegotiable?: boolean;
  salaryRange?: string; // formatted salary

  description: string;
  aboutRole?: string;
  responsibilities: string[];
  requirements: string[];
  qualifications?: string[];
  keySkills: string[];
  preferredSkills?: string[];

  // Job Application Settings
  applicationMethod?: 'website' | 'email' | 'external' | string;
  contactEmail?: string;
  externalUrl?: string;

  // Job Status & Dates
  status?: 'Draft' | 'Published' | 'Paused' | 'Closed' | 'Archived';
  isActive: boolean; // boolean indicator
  postedDate: string;
  applicationDeadline?: string;
  closingDate?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  
  // Personal Details
  fullName: string;
  applicantName?: string; // legacy support
  email: string;
  phone: string;
  currentLocation?: string;
  dateOfBirth?: string;

  // Professional Details
  currentCompany?: string;
  totalExperience?: string;
  experienceYears?: string; // legacy support
  relevantExperience?: string;
  currentSalary?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  highestQualification?: string;

  // Documents & Links
  coverLetter: string;
  resumeFileName?: string;
  resumeDataUrl?: string; // Base64 or URL
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;

  // Additional Questions
  whyJoin?: string;
  willingToRelocate?: boolean | string;
  availableForInterview?: boolean | string;

  appliedAt: string;
  status: 'New' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | 'Pending' | 'Reviewed' | 'Hired';

  // Admin Evaluation & Interview Management
  internalNotes?: string;
  hrNotes?: string;
  rating?: number; // 1 to 5 stars
  interviewDate?: string;
  interviewTime?: string;
  interviewer?: string;
  interviewMode?: string;
  interviewFeedback?: string;
}

export interface CareerPageSettings {
  enabled: boolean;
  contactEmail: string;
  headline: string;
  subheadline: string;
  instructions?: string;
}

export interface CompanyContactInfo {
  email: string;
  phone: string;
  phoneSecondary?: string;
  companyName: string;
  addressTitle: string;
  addressLine1: string;
  addressLine2: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
  iconName?: string;
  isCustom?: boolean;
}
