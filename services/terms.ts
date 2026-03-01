import { get } from "./api-client";

interface TermsData {
  type: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
}

export function getTerms() {
  return get<TermsData>("/api/terms/terms");
}

export function getPrivacy() {
  return get<TermsData>("/api/terms/privacy");
}
