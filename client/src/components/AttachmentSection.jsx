import React, { useState, useEffect } from 'react';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png', 'image/jpeg', 'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_MB = 5;

const fileIcon = (type) => {
  if (type === 'application/pdf') return (
    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  );
  if (type?.startsWith('image/')) return (
    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  );
  return (
    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    </svg>
  );
};

export const AttachmentSection = ({ storageKey, readOnly = false }) => {
  const [attachments, setAttachments] = useState([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      setAttachments(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    } catch { setAttachments([]); }
  }, [storageKey]);

  const persist = (list) => {
    setAttachments(list);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(list));
  };

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`"${file.name}" is not supported.\nAllowed: PDF, PNG, JPG, DOC, DOCX`);
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        alert(`"${file.name}" exceeds the ${MAX_FILE_MB} MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments(prev => {
          const updated = [...prev, {
            name: file.name, type: file.type,
            size: file.size, data: e.target.result,
            addedAt: new Date().toISOString(),
          }];
          if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (idx) => persist(attachments.filter((_, i) => i !== idx));

  if (!storageKey) return (
    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
      Save the record first to attach documents.
    </p>
  );

  return (
    <div className="space-y-3">
      {!readOnly && (
        <label
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors
            ${dragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 bg-gray-50 dark:bg-slate-900/40'
            }`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        >
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden" onChange={e => processFiles(e.target.files)} />
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">PDF, PNG, JPG, DOC, DOCX · Max {MAX_FILE_MB} MB each</p>
        </label>
      )}

      {attachments.length === 0 && readOnly && (
        <p className="text-sm text-gray-400 dark:text-slate-500 italic">No documents attached.</p>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((f, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl">
              {fileIcon(f.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200 truncate">{f.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {(f.size / 1024).toFixed(1)} KB · {new Date(f.addedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <a href={f.data} download={f.name}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Download">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </a>
              {!readOnly && (
                <button type="button" onClick={() => removeFile(i)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
