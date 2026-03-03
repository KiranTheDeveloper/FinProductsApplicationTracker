export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  NEW_ENQUIRY: "New Enquiry",
  KYC_PENDING: "KYC Pending",
  KYC_RECEIVED: "KYC Received",
  PRODUCT_PROPOSED: "Product Proposed",
  QUOTE_SHARED: "Quote Shared",
  CONFIRMATION_RECEIVED: "Confirmed",
  DEAL_CLOSED: "Deal Closed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
};

export const ENQUIRY_STATUS_COLORS: Record<string, string> = {
  NEW_ENQUIRY: "bg-blue-900/40 text-blue-300",
  KYC_PENDING: "bg-yellow-900/40 text-yellow-300",
  KYC_RECEIVED: "bg-amber-900/40 text-amber-300",
  PRODUCT_PROPOSED: "bg-orange-900/40 text-orange-300",
  QUOTE_SHARED: "bg-purple-900/40 text-purple-300",
  CONFIRMATION_RECEIVED: "bg-indigo-900/40 text-indigo-300",
  DEAL_CLOSED: "bg-teal-900/40 text-teal-300",
  IN_PROGRESS: "bg-cyan-900/40 text-cyan-300",
  COMPLETED: "bg-green-900/40 text-green-300",
  ON_HOLD: "bg-gray-700/40 text-gray-300",
  DROPPED: "bg-red-900/40 text-red-300",
};

export const ENQUIRY_STATUSES = [
  "NEW_ENQUIRY",
  "KYC_PENDING",
  "KYC_RECEIVED",
  "PRODUCT_PROPOSED",
  "QUOTE_SHARED",
  "CONFIRMATION_RECEIVED",
  "DEAL_CLOSED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "DROPPED",
] as const;

export type EnquiryStatusType = (typeof ENQUIRY_STATUSES)[number];

export const KYC_DOCUMENT_TYPES = [
  "Aadhar Card",
  "PAN Card",
  "Passport",
  "Photo",
  "Bank Statement",
  "Salary Slip",
  "ITR",
  "Other",
];

export const SERVICE_ICONS: Record<string, string> = {
  LIFE: "Shield",
  HEALTH: "Heart",
  MF: "TrendingUp",
  ITR: "FileText",
};

export const SERVICE_COLORS: Record<string, string> = {
  LIFE: "bg-blue-900/40 text-blue-300 border-blue-700",
  HEALTH: "bg-red-900/40 text-red-300 border-red-700",
  MF: "bg-green-900/40 text-green-300 border-green-700",
  ITR: "bg-orange-900/40 text-orange-300 border-orange-700",
};
