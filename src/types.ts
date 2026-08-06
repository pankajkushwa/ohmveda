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
  parentId?: string | null;
  level?: 0 | 1 | 2;
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

export type SpecFieldType = 
  | 'Text' 
  | 'Textarea' 
  | 'Number' 
  | 'Decimal' 
  | 'Dropdown' 
  | 'Multi Select' 
  | 'Yes / No' 
  | 'Checkbox' 
  | 'Radio Button' 
  | 'Date' 
  | 'URL' 
  | 'File Upload' 
  | 'Numeric Range' 
  | 'Color';

export interface SpecGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Specification {
  id: string;
  groupId: string;
  name: string;
  code: string; // unique key e.g. "bit_width", "operating_voltage"
  fieldType: SpecFieldType;
  options?: string[]; // for Dropdown, Multi Select, Radio Button
  defaultUnit?: string;
  allowedUnits?: string[]; // e.g. ['MHz', 'GHz'], ['V', 'mV'], ['Ω', 'kΩ', 'MΩ']
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  isCompareEnabled?: boolean;
  showOnProductCard?: boolean;
  showOnProductDetails?: boolean;
  order?: number;
  description?: string;
}

export interface SpecTemplateSpecification {
  specId: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  order?: number;
}

export interface SpecTemplate {
  id: string;
  name: string; // e.g. "Microcontrollers", "Resistors", "Sensors"
  description?: string;
  categoryIds: string[]; // StoreCategory IDs mapped to this template
  specifications: SpecTemplateSpecification[];
}

export interface StoreItemSpecValue {
  value: any;
  unit?: string;
}

export interface MoqTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  subSubCategory?: string;
  price: number; // in INR / USD currency standard
  originalPrice?: number;
  discountPercent?: number;
  rewardPoints?: number; // OhmVeda Reward Points per unit purchased
  moqTiers?: MoqTier[]; // Dynamic MOQ discount tiers managed by admin
  stock: number;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  shortDesc: string;
  fullDesc?: string;
  specs: string[]; // Legacy specs strings array for fallback
  specifications?: Record<string, StoreItemSpecValue>; // Keyed by specId or code
  sku: string;
  mpn?: string; // Manufacturer Part Number
  manufacturer?: string; // Brand / Manufacturer
  badge?: string;
  documents?: TechnicalDocument[];
  datasheetUrl?: string;
  rohsCompliant?: boolean;
  userManualUrl?: string;
  additionalDocsUrls?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
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
  gstin?: string;
}

export interface SeparateBillingAddress {
  fullName: string;
  phone: string;
  companyName?: string;
  gstin?: string;
  houseBuilding: string;
  streetArea: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  companyName?: string;
  gstin?: string;
  pincode: string;
  houseBuilding: string;
  streetArea: string;
  landmark?: string;
  city: string;
  state: string;
  addressType: 'Home' | 'Work' | 'Factory / R&D Lab' | 'Other';
  isDefault?: boolean;
  isBillingSame?: boolean;
  billingAddress?: SeparateBillingAddress;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
}

export interface UserOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  gstAmount: number;
  totalAmount: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  pointsDiscountRs?: number;
  shippingAddress: UserAddress;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD' | 'GST_PO';
  paymentStatus: 'PAID' | 'PENDING' | 'COD_CONFIRMED' | 'Refund Pending' | 'Refund Completed' | 'Cancelled';
  orderStatus: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  courierPartner?: string;
  courierTrackingUrl?: string;
  adminDispatchNotes?: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface RewardPointTransaction {
  id: string;
  userId?: string;
  userEmail: string;
  type: 'EARNED' | 'REDEEMED' | 'WELCOME_BONUS' | 'ADMIN_ADJUSTMENT' | 'BONUS' | 'REFUND';
  points: number;
  amountInRs?: number;
  description: string;
  date?: string;
  createdAt?: string;
  orderId?: string;
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

export interface LeadInquiry {
  id: string;
  source: 'contact_form' | 'project_modal' | 'project_configurator';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  projectCategory?: string;
  budgetRange?: string;
  timeline?: string;
  description: string;
  selectedModules?: string[];
  status: 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'PROPOSAL_SENT' | 'CONVERTED' | 'CLOSED';
  adminNotes?: string;
  createdAt: string;
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
  documents?: TechnicalDocument[];
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
