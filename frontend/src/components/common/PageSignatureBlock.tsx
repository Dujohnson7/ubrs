import React from "react";
import { cleanName } from "../../utils/signatureUtils";

export interface SignatoryItem {
  title?: string;
  name?: string;
  role?: string;
  signatureUrl?: string;
}

interface PageSignatureBlockProps {
  signatories?: SignatoryItem[];
  // Shortcut for single signatory
  name?: string;
  role?: string;
  signatureUrl?: string;
  title?: string;
  className?: string;
}

export const PageSignatureBlock: React.FC<PageSignatureBlockProps> = ({
  signatories,
  name,
  role,
  signatureUrl,
  title,
  className = "",
}) => {
  const items: SignatoryItem[] =
    signatories && signatories.length > 0
      ? signatories
      : name || role || signatureUrl
      ? [{ title, name, role, signatureUrl }]
      : [];

  if (items.length === 0) return null;

  return (
    <div
      className={`mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Authorization &amp; Signatures
        </h4>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          Official Verification
        </span>
      </div>

      <div
        className={`grid gap-6 ${
          items.length > 1
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            : "grid-cols-1 sm:max-w-xs sm:ml-auto"
        }`}
      >
        {items.map((item, idx) => {
          const displayName = cleanName(item.name) || "Authorized Official";
          const displayRole = item.role || "Signatory";
          return (
            <div
              key={idx}
              className="flex flex-col items-center sm:items-start text-center sm:text-left rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/30"
            >
              {item.title && (
                <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {item.title}
                </span>
              )}

              {/* Line 1: Name without () */}
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {displayName}
              </div>

              {/* Line 2: Role on new line */}
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                {displayRole}
              </div>

              {/* Line 3: Signature displayed on new line */}
              <div className="mt-3 w-full border-t border-dashed border-gray-300 pt-2 dark:border-gray-700">
                {item.signatureUrl ? (
                  <div className="flex h-14 w-full items-center justify-center sm:justify-start">
                    <img
                      src={item.signatureUrl}
                      alt={`${displayName}'s signature`}
                      className="max-h-12 max-w-[170px] object-contain drop-shadow-sm transition-transform hover:scale-105"
                      onError={(e) => {
                        // Hide broken image icon, show stylized text
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-full items-center justify-center sm:justify-start">
                    <span className="text-xs italic text-gray-400 dark:text-gray-500">
                      Signature on file
                    </span>
                  </div>
                )}
                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                  Signature
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PageSignatureBlock;
