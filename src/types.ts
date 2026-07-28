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
  title: string;
  department: string; // e.g. 'Software', 'Hardware', 'Sales', 'Purchase', 'Operations'
  location: string; // e.g. "Ahmedabad, India (Hybrid)", "Remote"
  workType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  openingsCount: number; // e.g. 3
  experience: string; // e.g. "2-5 Years"
  salaryRange?: string; // e.g. "₹6,00,000 - ₹12,00,000 PA"
  description: string;
  responsibilities: string[];
  requirements: string[];
  keySkills: string[];
  isActive: boolean;
  postedDate: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  experienceYears?: string;
  currentCompany?: string;
  coverLetter: string;
  resumeFileName?: string;
  resumeDataUrl?: string; // Base64 or URL
  appliedAt: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
}
