import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { MarkdownModule } from 'ngx-markdown';
import { DbTable, DbTablePopup } from '../db-tables-popup/db-tables-popup';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface TableRow {
  [key: string]: any;
}

@Component({
  selector: 'app-data-analysis-ai',
  standalone: true,
  imports: [FormsModule, CommonModule, MarkdownModule, DbTablePopup, HttpClientModule],
  templateUrl: './data-analysis-ai.html',
  styleUrls: ['./data-analysis-ai.css']
})
export class DataAnalysisAi implements OnInit {
  userInput = '';
  loading = false;

  selectedFile: File | null = null;
  fileTextContent: string | null = null;   // hidden file content (not shown in UI)
  tableTextContent: string | null = null;  // hidden table content (not shown in UI)

  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    file?: File;
  }[] = [];

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  private readonly apiKey = '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'; // 🔒 don't ship in prod
  private readonly API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly botModel = 'openai/gpt-oss-20b:free';

  private readonly STORAGE_KEY = 'ai_chat_messages';

  // Popup state
  showTablesPopup = false;
  tables: DbTable[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) this.messages = JSON.parse(saved);
    this.scrollToBottom();
  }

  // ---------- Tables popup ----------
  openTablesPopup() {
    this.showTablesPopup = true;
    this.http.get<DbTable[]>('http://localhost:5077/api/database/tables')
      .subscribe({
        next: (data) => this.tables = data,
        error: (err) => console.error('Error loading tables:', err)
      });
  }

  sendTableToChat(table: DbTable) {
    // NOTE: make sure DbTable has { name: string } in your popup model
    this.http.get<any[]>(`http://localhost:5077/api/database/tables/${table.name}`)
      .subscribe({
        next: (rows) => {
          this.clearChat();

          // UI: only a short message
          this.messages.push({
            role: 'user',
            content: `📊 Table "${table.name}" is uploaded`
          });
          this.saveMessages();
          this.scrollToBottom();

          // Hidden payload for AI (NOT pushed to messages)
          this.tableTextContent = JSON.stringify({
            table: table.name,
            rows
          });

          this.showTablesPopup = false;
        },

        error: (err) => console.error('Error loading table rows:', err)
      });
  }

  // ---------- Chat helpers ----------
  saveMessages() {
    const capped = this.messages.slice(-20);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(capped));
  }

  trackByMessage(index: number) {
    return index;
  }

  private formatContent(raw: string, isAssistant: boolean): string {
    let content = raw.trim();
    content = content.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    content = content.replace(/\. /g, '.\n\n');
    if (isAssistant) {
      const lines = content.split('\n');
      if (lines.length > 0) lines[0] = `**${lines[0].toUpperCase()}**`;
      content = lines.join('\n');
    }
    return content;
  }

  cleanAiMessage(msg: string): string {
    return msg
      // drop anything starting with "analysis" until end or until double asterisks
      .replace(/analysis[\s\S]*?(?=(\*\*|$))/gi, '')
      .replace(/assistantfinal/gi, '')
      .trim();
  }

  // ---------- Send to AI (with hidden context merged) ----------
  async sendMessage() {
    const trimmed = this.userInput.trim();
    // Only send if user typed something (uploads alone should not auto-query)
    if (!trimmed) return;

    // UI: show only the user's typed text
    this.messages.push({ role: 'user', content: trimmed });
    this.userInput = '';
    this.loading = true;
    this.saveMessages();
    this.scrollToBottom();

    try {
      // Build context
      const baseSystem = {
        role: 'system' as const,
        content:
          "You are a strict file assistant. You must only answer questions related to the uploaded files/tables. " +
          "If the user asks about anything unrelated, reply exactly: " +
          "⚠️ I cannot answer questions not related to the uploaded file(s)."
      };

      let apiContext = [...this.messages.slice(-10)];
      if (this.messages.length > 10) {
        const summary = this.messages
          .slice(0, -3)
          .map(m => `${m.role}: ${m.content}`)
          .join("\n")
          .substring(0, 800);

        apiContext = [
          { role: 'system', content: 'Summary of earlier conversation: ' + summary },
          ...this.messages.slice(-10),
        ];
      }

      // Hidden context (NOT shown in UI)
      const hiddenContext =
        (this.fileTextContent ? `\n\n[File Content]\n${this.fileTextContent}` : '') +
        (this.tableTextContent ? `\n\n[Table Content]\n${this.tableTextContent}` : '');

      // Append hidden context to the LAST user message only
      const apiMessages = [
        baseSystem,
        ...apiContext.map((m, i, arr) => {
          if (m.role === 'user' && i === arr.length - 1 && hiddenContext) {
            return { role: 'user', content: `${m.content}${hiddenContext}` };
          }
          return { role: m.role, content: m.content };
        })
      ];

      // Retry up to 3 times
      let aiMessage: string | null = null;
      for (let attempts = 1; attempts <= 3 && !aiMessage; attempts++) {
        try {
          const response = await fetch(this.API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: this.botModel,
              messages: apiMessages,
              max_tokens: 2000,
            }),
          });

          const data = await response.json();
          console.log(`🔍 API raw response (attempt ${attempts}):`, data);

          aiMessage =
            data?.choices?.[0]?.message?.content?.[0]?.text ||
            data?.choices?.[0]?.message?.content ||
            null;

          if (aiMessage)
           {
            aiMessage = this.cleanAiMessage(aiMessage);
          }
        } catch (err) {
          console.warn(`⚠️ API request failed (attempt ${attempts}):`, err);
        }
      }

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
          content: '⚠️ No response from AI. Only ask about the uploaded table.',
        });
      }
      this.saveMessages();

    } catch (error) {
      console.error('API error:', error);
      this.messages.push({
        role: 'assistant',
        content: '⚠️ Error: Unable to reach AI API.',
      });
      this.saveMessages();
    } finally {
      this.loading = false;
      this.scrollToBottom();
      // Clear hidden buffers AFTER sending
      this.fileTextContent = null;
      this.tableTextContent = null;
    }
  }

  // ---------- UI ----------
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatWindow?.nativeElement) {
        this.chatWindow.nativeElement.scrollTop =
          this.chatWindow.nativeElement.scrollHeight;
      }
    }, 100);
  }

  clearChat() {
    this.messages = [];
    localStorage.removeItem('chatMessages');
  }
}
