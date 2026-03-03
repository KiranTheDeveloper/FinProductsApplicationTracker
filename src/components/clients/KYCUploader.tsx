"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Trash2 } from "lucide-react";
import { KYC_DOCUMENT_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface KYCDocument {
  id: string;
  documentType: string;
  fileName: string;
  filePath: string;
  uploadedAt: Date | string;
}

interface KYCUploaderProps {
  clientId: string;
  enquiryId?: string;
  initialDocuments?: KYCDocument[];
}

export function KYCUploader({ clientId, enquiryId, initialDocuments = [] }: KYCUploaderProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>(initialDocuments);
  const [docType, setDocType] = useState(KYC_DOCUMENT_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please select a file"); return; }

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("documentType", docType);
    if (enquiryId) formData.append("enquiryId", enquiryId);

    const res = await fetch("/api/kyc", { method: "POST", body: formData });
    if (!res.ok) {
      setError("Upload failed");
      setUploading(false);
      return;
    }

    const doc = await res.json();
    setDocuments((prev) => [doc, ...prev]);
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/kyc?id=${id}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {/* Upload area */}
        <div className="space-y-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {KYC_DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="flex-1 text-sm text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-600 file:text-slate-200 hover:file:bg-slate-500"
            />
            <Button size="sm" onClick={handleUpload} disabled={uploading}>
              <Upload className="w-3 h-3" />
              {uploading ? "..." : "Upload"}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Document list */}
        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">No documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{doc.documentType}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.fileName}</p>
                  <p className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</p>
                </div>
                <div className="flex gap-1">
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
