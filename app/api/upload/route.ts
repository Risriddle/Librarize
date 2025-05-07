
// import { NextResponse } from "next/server";
// import { uploadPDFToS3, uploadImageToS3 } from "@/lib/s3Uploader";
// import dbConnect from '@/lib/dbConnect';
// import PdfFile from '@/lib/models/Pdf';

// import { fromBuffer } from "pdf2pic";
// import fs from "fs/promises";

// async function generateCoverImageFromPDF(pdfBuffer: Buffer): Promise<Buffer> {
//   const convert = fromBuffer(pdfBuffer, {
//     density: 100,
//     format: "png",
//     width: 600,
//     height: 800,
//     saveFilename: "cover",
//     savePath: "/tmp", // always use /tmp for serverless environments
//   });

//   const response = await convert(1); // Convert first page

//   // Load image from filesystem
//   const imagePath = response.path;

 
   
// if (!imagePath) {
//   throw new Error("Failed to generate cover image: Path is undefined");
// }

//     const imageBuffer = await fs.readFile(imagePath);
//     return imageBuffer;
   
  
// }



// export async function POST(req: Request) {
//   await dbConnect();
  
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const author=formData.get("author")
//     // const title=formData.get("title")

//     const rawTitle = formData.get("title") as string | null;
// if (!rawTitle) throw new Error("Title is required");
// const title = rawTitle;


//     if (!file || file.type !== "application/pdf") {
//       return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
//     }

    

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Upload PDF
//     const pdfUrl = await uploadPDFToS3(buffer, file.name, file.type);

//     const url = new URL(pdfUrl);
//     const key = url.pathname.slice(1); 

//     // Generate cover image from first page
//     let coverImageUrl = "";
//     try {
//       const coverImageBuffer = await generateCoverImageFromPDF(buffer);
//       const timestamp = Date.now();
//       const coverFileName = `${file.name.replace(/\.pdf$/, "")}-cover-${timestamp}.png`;

//       coverImageUrl = await uploadImageToS3(
//         coverImageBuffer,
//         `covers/${coverFileName}`,
//         "image/png"
//       );
//     } catch (err) {
//       console.warn("Cover image generation failed:", err);
//     }

//     // Auto-rename logic
// async function generateUniqueTitle(baseTitle: string) {
//   let title = baseTitle;
//   let count = 1;

//   while (await PdfFile.findOne({ title })) {
//     title = `${baseTitle} (${count})`;
//     count++;
//   }

//   return title;
// }

// // In your route
// const uniqueTitle = await generateUniqueTitle(title);

// const newPdf = await PdfFile.create({
//   fileName: file.name,
//   fileUrl: pdfUrl,
//   coverImageUrl: coverImageUrl,
//   title: uniqueTitle,
//   author: author,
//   key: key,
//   rating: 0,
//   review: ""
// });

   

//     console.log(newPdf, "PDF and cover image added to DB");

//     return NextResponse.json({ pdfUrl, coverImageUrl });

//   } catch (err) {
//     console.error("Upload error:", err);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// }








import { NextResponse } from "next/server";
import { uploadPDFToS3 } from "@/lib/s3Uploader";
import dbConnect from "@/lib/dbConnect";
import PdfFile from "@/lib/models/Pdf";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const author = formData.get("author");
    const rawTitle = formData.get("title") as string | null;

    if (!rawTitle) throw new Error("Title is required");
    const title = rawTitle;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload PDF to S3
    const pdfUrl = await uploadPDFToS3(buffer, file.name, file.type);
    const url = new URL(pdfUrl);
    const key = url.pathname.slice(1); // Remove leading slash

    //  Generate cover image using Imgix
    const IMGIX_DOMAIN = "riddle-454877191.imgix.net"; // replace with your Imgix domain
    const coverImageUrl = `https://${IMGIX_DOMAIN}/${key}?page=1&fm=jpg&w=600&h=800&fit=crop`;

    //  Auto-rename logic
    async function generateUniqueTitle(baseTitle: string) {
      let unique = baseTitle;
      let count = 1;
      while (await PdfFile.findOne({ title: unique })) {
        unique = `${baseTitle} (${count})`;
        count++;
      }
      return unique;
    }

    const uniqueTitle = await generateUniqueTitle(title);

    //  Save to DB
    const newPdf = await PdfFile.create({
      fileName: file.name,
      fileUrl: pdfUrl,
      coverImageUrl,
      title: uniqueTitle,
      author,
      key,
      rating: 0,
      review: ""
    });

    console.log(newPdf, "PDF and cover image added to DB");

    return NextResponse.json({ pdfUrl, coverImageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
