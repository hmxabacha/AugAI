import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { MarkdownModule } from 'ngx-markdown';
import { FileHistoryService, StoredFile } from '../services/file.service';
import { FileHistoryComponent } from "../file-history-table/file-history-table";
import { error } from 'console';
import { AuthService } from '../auth.service';
import * as pdfjsLib from 'pdfjs-dist';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/pdf.worker.mjs`;


interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  file?: File;
  fileName?:string;
}

@Component({
  selector: 'app-data-analysis-ai',
  standalone: true,
  imports: [FormsModule, CommonModule, MarkdownModule, FileHistoryComponent],
  templateUrl: './auganalysis.html',
  styleUrls: ['./auganalysis.css'],
})
export class AUGAnalysis {
  @ViewChild('chatWindow') chatWindow!: ElementRef;

  userInput: string = '';
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    file?: File;
    fileName?:string;
  }[] = [];
  loading: boolean = false;
  showPopup = false;
  // === API Setup ===
  //private apiKey = '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'; // 1st account
  private apiKey ='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'; // 2nd account
  private readonly API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
  private botModel ='openai/gpt-oss-20b:free';


  ngOnInit() {
    this.loadMessages();
    this.scrollToBottom();

    window.addEventListener('reuseFile', this.onReuseFile as any);
  }

  onReuseFile = async (e: any) => {
    const stored = e.detail as StoredFile;

    try {
      const blob = await this.fileHistory.downloadFile(stored.id).toPromise(); // <-- use ID

      if (!blob) {
        console.error('❌ No file returned from backend');
        return;
      }

      const file = new File([blob], stored.fileName, { type: blob.type });

      // Extract content
      let content = '';
      const name = file.name.toLowerCase();
      if (name.endsWith('.pdf')) {
        content = await this.extractTextFromPDF(file);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        content = await this.extractTextFromExcel(file);
      } else if (blob.type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.csv')) {
        content = await file.text();
      } else {
        content = 'Unsupported file type for extraction.';
      }

      this.clearChat();
      this.messages.push({
        role: 'system',
        content: `"User uploaded "${file.name}".\n\nExtracted summary:\n${content.substring(0, 1000)}...`,
        file,
        fileName: file.name,
      });

      this.saveMessages();
      this.scrollToBottom();

    } catch (err) {
      console.error('❌ Failed to reuse file:', err);
    }
    this.showPopup = false;

  };





  constructor(private fileHistory: FileHistoryService, private auth:AuthService) {}


  toggleHistory() {
    this.showPopup = !this.showPopup;
  }


  closeFilesForm() {
    this.showPopup = false;
  }

  // === File Upload ===

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const userId = this.auth.getUserId();

    if (!userId) {
      console.error('User is not logged in!');
      return;
    }

    this.clearChat();


    try {
      // 🔹 Extract file content (keep your logic)
      let fileContent = '';
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        fileContent = await this.extractTextFromExcel(file);
      } else if (file.type === 'application/pdf') {
        fileContent = await this.extractTextFromPDF(file);
      } else if (file.type.startsWith('text/')) {
        fileContent = await file.text();
      }

      // 🔹 Upload file to backend (keep only path in DB)
      this.fileHistory.uploadFile(userId, file).subscribe({
        next: (res) => {

          console.log('File uploaded successfully:', res);

          // 🔹 Push message with extracted summary
          this.messages.push({
            role: 'system',
            content: `"User uploaded "${file.name}".\n\nExtracted summary:\n${fileContent.substring(0, 1000)}...`,
            file,
            fileName:file.name,
          });

          this.saveMessages();
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('File upload failed:', err);

          this.messages.push({
            role : "system",
            content : `Reused existing file "${file.name}" .\n\n Extracted summary : \n ${fileContent.substring(0,1000)}...`,
            file,
            fileName:file.name
          });
          this.saveMessages();
          this.scrollToBottom();
        }
      });

    } catch (err) {
      console.error('File processing failed:', err);
    }

    input.value = '';
  }
  cleanAiMessage(msg: string): string {
    return msg
      // drop anything starting with "analysis" until end or until double asterisks
      .replace(/analysis[\s\S]*?(?=(\*\*|$))/gi, '')
      .replace(/assistantfinal/gi, '')
      .trim();
  }

  // === Send Message ===
  // === Send Message ===
async sendMessage() {
  const trimmed = this.userInput.trim();
  if (!trimmed) return;

  this.messages.push({
    role: 'user',
    content: trimmed,
  });

  this.userInput = '';
  this.loading = true;
  this.saveMessages();
  this.scrollToBottom();

  try {
    // Send only last 10 messages
    let recentMessages = this.messages.slice(-10);
    if (this.messages.length > 10) {
      const summary = this.messages
        .slice(0, -3)
        .map(m => `${m.role}: ${m.content}`)
        .join("\n")
        .substring(0, 800);

      recentMessages = [
        { role: "system", content: "You are a strict file assistant. " +
        "You must only answer questions that are directly related to the uploaded files. " +
        "If the user asks about anything unrelated to the uploaded file(s), reply exactly: " +
        "'⚠️ I cannot answer questions not related to the uploaded file(s).'"+"Summary of earlier conversation: " + summary },
        ...this.messages.slice(-10),
      ];
    }

    // 🔹 Retry up to 3 times
    let aiMessage: string | null = null;
    let attempts = 0;

    while (attempts < 3 && !aiMessage) {
      attempts++;

      try {
        const response = await fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.botModel,
            messages: recentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            max_tokens: 2000,
          }),
        });

        const data = await response.json();
        console.log(`🔍 API raw response (attempt ${attempts}):`, data);

        aiMessage =
          data?.choices?.[0]?.message?.content?.[0]?.text ||
          data?.choices?.[0]?.message?.content ||
          null;

          if (aiMessage) {
            aiMessage = this.cleanAiMessage(aiMessage);
          } // ✅ Got response, stop retrying
      } catch (err) {
        console.warn(`⚠️ API request failed (attempt ${attempts}):`, err);
      }
    }

    // ✅ If got response
    if (aiMessage) {
      aiMessage = this.cleanAiMessage(aiMessage);
      this.messages.push({
        role: 'assistant',
        content: aiMessage,
      });
    } else {
      // ❌ If failed after 3 retries
      this.messages.push({
        role: 'assistant',
        content: '⚠️ No response from AI. Only ask about the file.',
      });
    }

  } catch (error) {
    console.error('API error:', error);
    this.messages.push({
      role: 'assistant',
      content: '⚠️ Error: Unable to reach AI API.',
    });
  } finally {
    this.loading = false;
    this.saveMessages();
    this.scrollToBottom();
  }
}


  // === PDF Extraction (placeholder) ===


async extractTextFromPDF(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);

        // Load the PDF
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item: any) => (item.str ? item.str : ''))
            .join(' ');

          fullText += pageText + '\n';
        }

        resolve(fullText.trim());
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

  // === Excel Extraction ===
  async extractTextFromExcel(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          resolve(XLSX.utils.sheet_to_csv(sheet));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  }

  // === Helpers ===
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatWindow) {
        this.chatWindow.nativeElement.scrollTop =
          this.chatWindow.nativeElement.scrollHeight;
      }
    }, 50);
  }

  saveMessages() {
    const capped = this.messages.slice(-20); // keep only last 20
    localStorage.setItem('chatMessages', JSON.stringify(capped));
  }

  loadMessages() {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      this.messages = JSON.parse(saved);
    }
  }

  trackByMessage(index: number, message: ChatMessage) {
    return index;
  }
  clearChat() {
    this.messages = [];
    localStorage.removeItem('chatMessages');
  }
}
