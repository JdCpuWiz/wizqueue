declare module 'pdf-poppler' {
  export interface ConvertOptions {
    format?: 'png' | 'jpeg' | 'jpg';
    out_dir?: string;
    out_prefix?: string;
    page?: number | null;
    scale?: number;
    density?: number;
  }

  export interface InfoResult {
    pages: string;
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modDate?: string;
  }

  export function convert(pdfPath: string, options: ConvertOptions): Promise<void>;
  export function info(pdfPath: string): Promise<InfoResult>;
}
