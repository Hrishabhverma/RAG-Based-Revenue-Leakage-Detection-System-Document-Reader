// This tells TypeScript that these libraries are loaded globally from the HTML.
declare var pdfjsLib: any;
declare var mammoth: any;

interface ParsedDoc {
  doc_id: string;
  type: string;
  text: string;
}

// Set the worker source for pdf.js once
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;
}

const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText;
};

const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
};

const parseTxt = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsText(file);
    });
};

const parseJson = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = JSON.parse(text);
                resolve(parsed);
            } catch (err) {
                reject(new Error(`Failed to parse ${file.name}. Ensure JSON is valid.`));
            }
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
        reader.readAsText(file);
    });
};


export const parseFiles = async (files: FileList): Promise<ParsedDoc[]> => {
    const filePromises = Array.from(files).map(async (file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'pdf':
                const pdfText = await parsePdf(file);
                return { doc_id: file.name, type: 'PDF', text: pdfText };
            case 'docx':
                const docxText = await parseDocx(file);
                return { doc_id: file.name, type: 'DOCX', text: docxText };
            case 'txt':
                const txtText = await parseTxt(file);
                return { doc_id: file.name, type: 'Text File', text: txtText };
            case 'json':
                const jsonData = await parseJson(file);
                // If it's an array of docs, return them. If single doc, wrap in array.
                return Array.isArray(jsonData) ? jsonData : [jsonData];
            default:
                console.warn(`Unsupported file type: ${file.name}. Skipping.`);
                return null;
        }
    });

    const results = await Promise.all(filePromises);
    // Flatten results (for JSONs that return arrays) and filter out nulls for unsupported types
    return results.flat().filter(doc => doc !== null) as ParsedDoc[];
};