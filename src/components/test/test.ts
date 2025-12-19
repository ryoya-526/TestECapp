import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test.html',
})
export class TestComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      rows: this.fb.array([]),
    });

    // 最初は1行ある状態にする
    this.addRow();
  }

  get rows(): FormArray<FormGroup> {
    return this.form.get('rows') as FormArray<FormGroup>;
  }

  addRow(): void {
    const row = this.fb.group({
      // ラベルとして表示する値（フォームで持ちたいなら FormControl にする）
      label: ['Row', Validators.required],

      // 入力値
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      qty: [1, [Validators.required, Validators.min(1)]],

      // labelだけど「固定IDを保持したい」みたいな用途なら hiddenで持てる
      id: [crypto.randomUUID()],
    });

    this.rows.push(row);
  }

  removeRow(index: number): void {
    if (this.rows.length <= 1) return; // 1行は残す例（不要なら消してOK）
    this.rows.removeAt(index);
  }

  rowTotal(i: number): number {
    const row = this.rows.at(i);
    const price = Number(row.get('price')?.value) || 0;
    const qty = Number(row.get('qty')?.value) || 0;
    return price * qty;
  }

  grandTotal(): number {
    return this.rows.controls.reduce((sum, _, i) => sum + this.rowTotal(i), 0);
  }
}
