// import { useState, useRef } from "react";
// import { FileText,FileCheck,X,BookCopy } from "lucide-react";

// export default function UploadPdf() {
//   const [file, setFile] = useState<File | null>(null);
//   const [message, setMessage] = useState<React.ReactNode>(""); 

//   const [isDragging, setIsDragging] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [author, setAuthor] = useState("");
//   const [title, setTitle] = useState("");

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return;

//     setLoading(true);
//     setMessage("");

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("author", author);
//     formData.append("title", title);

//     const res = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     setLoading(false);

//     if (res.ok) {
//       setMessage(
//         <>
//           <FileCheck className="inline mr-2 text-green-600" />
//           Uploaded successfully!
//         </>
//       );
//     } else {
//       setMessage(
//         <>
//           <X className="inline mr-2 text-red-600" />
//           Upload Failed! {data.error}
//         </>
//       );
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && droppedFile.type === "application/pdf") {
//       setFile(droppedFile);
//     }
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto bg-amber-900 text-amber-100 rounded-xl shadow-xl space-y-4">
//       <h2 className="text-2xl font-bold"><BookCopy/>Upload a Book (PDF)</h2>

//       <form onSubmit={handleUpload} className="space-y-4">
      

       

//         {/* Drag & Drop Box */}
//         <div
//           className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
//             isDragging
//               ? "bg-amber-800 border-amber-500"
//               : "bg-amber-800 border-amber-700"
//           }`}
//           onDragOver={(e) => {
//             e.preventDefault();
//             setIsDragging(true);
//           }}
//           onDragLeave={() => setIsDragging(false)}
//           onDrop={handleDrop}
//           onClick={() => fileInputRef.current?.click()}
//         >
//           {file ? (
//             <p>{file.name}</p>
//           ) : (
//             <p><FileText/>Drag & drop PDF here or click to browse</p>
//           )}
//         </div>
//         <input
//           type="text"
//           placeholder="Book Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="w-full p-2 rounded bg-amber-800 placeholder-amber-300"
//         />
//         <input
//           type="text"
//           placeholder="Author Name"
//           value={author}
//           onChange={(e) => setAuthor(e.target.value)}
//           className="w-full p-2 rounded bg-amber-800 placeholder-amber-300"
//         />

//         {/* Hidden Input */}
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//           className="hidden"
//           ref={fileInputRef}
//         />

//         <button
//           type="submit"
//           className="w-full bg-amber-600 hover:bg-amber-500 transition-colors py-2 px-4 rounded text-white font-semibold"
//         >
//           Upload Book
//         </button>
//       </form>

//       {loading && (
//         <div className="text-sm text-amber-200 animate-pulse">Uploading...</div>
//       )}

//       {!loading && message && (
//         <div className="text-sm text-amber-100">{message}</div>
//       )}
//     </div>
//   );
// }













import { useState, useRef } from "react";
import { FileText,FileCheck,X,BookCopy } from "lucide-react";

export default function UploadPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<React.ReactNode>(""); 

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setMessage(
        <>
          <X className="inline mr-2 text-red-600" />
          Please fill all fields and upload a valid PDF.
        </>
      );
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    // 1. Get presigned URL from backend
    const presignRes = await fetch("/api/s3-presign", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    const { url, key } = await presignRes.json();
    console.log(url,key,"----------------------------------------------")
  
    // 2. Upload file directly to S3
    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: file,
    });
  
    if (!uploadRes.ok) {
      setMessage(
        <>
          <X className="inline mr-2 text-red-600" />
          Failed to upload to S3.
        </>
      );
      setLoading(false);
      return;
    }
  
    // 3. Save metadata to DB (call your /api/save route)
    const saveRes = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        author,
        fileName: file.name,
        fileUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_DOMAIN}/${key}`,
        key,
      }),
    });
  
    await saveRes.json();
  
    if (saveRes.ok) {
      setMessage(
        <>
          <FileCheck className="inline mr-2 text-green-600" />
          Uploaded and saved successfully!
        </>
      );
      setFile(null);
      setAuthor("");
      setTitle("");
    } else {
      setMessage(
        <>
          <X className="inline mr-2 text-red-600" />
          Failed to save metadata!
        </>
      );
    }
  
    setLoading(false);
  };
  

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-amber-900 text-amber-100 rounded-xl shadow-xl space-y-4">
      <h2 className="text-2xl font-bold"><BookCopy/>Upload a Book (PDF)</h2>

      <form onSubmit={handleUpload} className="space-y-4">
      

       

        {/* Drag & Drop Box */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "bg-amber-800 border-amber-500"
              : "bg-amber-800 border-amber-700"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p><FileText/>Drag & drop PDF here or click to browse</p>
          )}
        </div>
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-amber-800 placeholder-amber-300"
        />
        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full p-2 rounded bg-amber-800 placeholder-amber-300"
        />

        {/* Hidden Input */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          ref={fileInputRef}
        />

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 transition-colors py-2 px-4 rounded text-white font-semibold"
        >
          Upload Book
        </button>
      </form>

      {loading && (
        <div className="text-sm text-amber-200 animate-pulse">Uploading...</div>
      )}

      {!loading && message && (
        <div className="text-sm text-amber-100">{message}</div>
      )}
    </div>
  );
}
