import { JobRole } from '../types';

export const INITIAL_JOB_ROLES: JobRole[] = [
  {
    id: 'job-emb-sw-01',
    title: 'Embedded Software Engineer',
    department: 'Software',
    location: 'Ahmedabad, India (Hybrid)',
    workType: 'Full-Time',
    openingsCount: 3,
    experience: '2 - 5 Years',
    salaryRange: '₹6,00,000 - ₹12,00,000 PA',
    description: 'We are seeking an experienced Embedded Software Engineer to architect, code, and optimize firmware for our next-generation IoT Edge Gateways, industrial wireless nodes, and connected hardware devices.',
    responsibilities: [
      'Architect and write reliable, low-power C/C++ firmware for ESP32, STM32, and Nordic NRF microcontrollers.',
      'Implement real-time task scheduling using FreeRTOS and bare-metal HAL peripheral drivers (UART, SPI, I2C, CAN Bus, Modbus RTU).',
      'Integrate wireless communication stacks including LoRaWAN, BLE 5.0, Wi-Fi 6, and 4G LTE cellular modems.',
      'Develop secure MQTT/TLS client protocols and OTA (Over-The-Air) firmware update pipelines.',
      'Conduct hardware-in-the-loop (HIL) testing, logic analyzer signal debugging, and firmware memory profiling.'
    ],
    requirements: [
      'B.Tech / B.E. / M.Tech in Electronics, Embedded Systems, Computer Engineering or related technical field.',
      '2+ years of hands-on firmware development in C/C++ for ARM Cortex-M or ESP32 architectures.',
      'Strong proficiency with Git, RTOS primitives (semaphores, queues, mutexes), and low-level register configuration.',
      'Familiarity with logic analyzers, oscilloscopes, and serial protocol analyzers.'
    ],
    keySkills: ['C/C++', 'ESP32', 'STM32', 'FreeRTOS', 'MQTT', 'LoRaWAN', 'Modbus', 'CAN Bus', 'OTA Updates'],
    isActive: true,
    postedDate: '2026-07-20',
  },
  {
    id: 'job-hw-pcb-02',
    title: 'Hardware & PCB Design Engineer',
    department: 'Hardware',
    location: 'Ahmedabad, India (On-site)',
    workType: 'Full-Time',
    openingsCount: 2,
    experience: '1 - 4 Years',
    salaryRange: '₹5,00,000 - ₹10,00,000 PA',
    description: 'Join our hardware division to design high-reliability printed circuit boards (PCBs), power regulation modules, and industrial sensor hardware from schematic capture to fabrication and assembly.',
    responsibilities: [
      'Design multi-layer (2-6 layer) PCBs with controlled impedance, EMI/EMC optimization, and thermal relief management using Altium Designer / KiCAD.',
      'Perform component selection, multi-vendor BOM generation, and second-source identification for critical ICs.',
      'Develop DC-DC buck/boost power converters, battery management sub-systems, and optically isolated I/O interfaces.',
      'Prepare manufacturing output packages (Gerber X2, IPC-2581, NC Drill, Pick & Place files).',
      'Hands-on surface mount soldering (SMD 0603, QFN), bench testing, and hardware prototyping.'
    ],
    requirements: [
      'Degree in Electrical, Electronics, or Instrumentation Engineering.',
      'Proven portfolio of multi-layer PCB designs and functional hardware prototypes.',
      'In-depth knowledge of circuit simulation (SPICE), signal integrity, and PCB stack-up considerations.',
      'Experience with component sourcing and manufacturing DFM (Design for Manufacturability) guidelines.'
    ],
    keySkills: ['Altium Designer', 'KiCAD', 'Multi-layer PCB', 'SMD Soldering', 'Signal Integrity', 'DFM', 'Power Electronics'],
    isActive: true,
    postedDate: '2026-07-18',
  },
  {
    id: 'job-sales-b2b-03',
    title: 'Technical Sales & B2B Business Manager',
    department: 'Sales',
    location: 'Ahmedabad / Remote (India)',
    workType: 'Full-Time',
    openingsCount: 2,
    experience: '2 - 6 Years',
    salaryRange: '₹5,50,000 - ₹11,00,000 PA + Uncapped Commission',
    description: 'Drive B2B sales growth for OhmVeda’s turn-key IoT hardware, custom embedded design services, and electronics components among OEMs, industrial automation clients, and tech startups.',
    responsibilities: [
      'Identify enterprise sales prospects, engage CTOs and Product Managers, and present custom IoT hardware solution proposals.',
      'Prepare technical quotes, RFQ estimations, and commercial proposals for turn-key product design & manufacturing.',
      'Nurture client relationships from initial technical inquiry through prototype delivery and mass production.',
      'Collaborate with engineering teams to evaluate client specifications and translate hardware requirements into business scopes.',
      'Represent OhmVeda at electronics expos, industrial IoT summits, and client technology demonstrations.'
    ],
    requirements: [
      'Bachelor’s degree in Engineering, Business Administration, or related discipline.',
      '2+ years of successful technical sales or business development experience in electronics, hardware, or IT solutions.',
      'Outstanding communication, presentation, and contract negotiation skills.',
      'Self-driven mindset with a track record of meeting revenue targets in B2B environments.'
    ],
    keySkills: ['B2B Sales', 'Technical RFQ', 'Client Relationship', 'Solution Pitching', 'Hardware Consulting', 'Lead Generation'],
    isActive: true,
    postedDate: '2026-07-22',
  },
  {
    id: 'job-purchase-04',
    title: 'Electronics Purchase & Component Procurement Lead',
    department: 'Purchase',
    location: 'Ahmedabad, India (On-site)',
    workType: 'Full-Time',
    openingsCount: 1,
    experience: '2 - 5 Years',
    salaryRange: '₹4,50,000 - ₹8,50,000 PA',
    description: 'Manage component sourcing, vendor negotiations, import logistics, and inventory control for OhmVeda’s electronics store and turnkey hardware manufacturing lines.',
    responsibilities: [
      'Source microcontrollers, passive components, ICs, and connectors from global distributors (DigiKey, Mouser, Arrow, LCSC) and OEM manufacturers.',
      'Negotiate volume pricing, lead times, and payment terms with international and domestic electronics suppliers.',
      'Monitor store component stock levels, track reorder thresholds, and prevent supply chain bottlenecks.',
      'Coordinate customs clearance, import documentation, and HSN/GST tax compliance for electronics shipments.',
      'Inspect incoming component shipments for authenticity, reel packaging integrity, and anti-counterfeit standards.'
    ],
    requirements: [
      'Degree in Supply Chain, Commerce, or Electronics Engineering.',
      '2+ years of experience in semiconductor or electronic component procurement.',
      'Deep understanding of electronic component part numbering, package types, and distributor ecosystems.',
      'Strong analytical abilities in cost management and ERP inventory tracking.'
    ],
    keySkills: ['Component Procurement', 'Supply Chain', 'Vendor Negotiation', 'Customs & Import', 'BOM Costing', 'Inventory Control'],
    isActive: true,
    postedDate: '2026-07-21',
  },
];
