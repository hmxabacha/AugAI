import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DbTable {
  name: string;
}

@Component({
  selector: 'app-table-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './db-tables-popup.html',
  styleUrls: ['./db-tables-popup.css']
})
export class DbTablePopup {
  @Input() isOpen = false;
  @Input() tables: DbTable[] = [];
  @Output() tableSelected = new EventEmitter<DbTable>();

  @Output() closed = new EventEmitter<void>();

  selectTable(table: DbTable) {
    this.tableSelected.emit(table);
    this.close();
  }

  close() {
    this.isOpen = false;
    this.closed.emit();
  }
}
