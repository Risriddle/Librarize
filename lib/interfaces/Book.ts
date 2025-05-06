

export interface Book {
    _id: string;
    fileName: string;
    title:string;
    filePath: string;
    coverImageUrl: string;
    uploadDate: string;
    author:string;
    rating:number;
    fileSize?: number;
    pageCount?: number;
    lastReadPage?: number;
  }