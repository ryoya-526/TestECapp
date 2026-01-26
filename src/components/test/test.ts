import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, finalize, map, takeUntil } from 'rxjs';

type ApiOption = {
  id: number;
  label: string;
};

type FormValue = {
  category: string;
  apiOption: number | null;
  rows: Array<{
    label: string;
    name: string;
    price: number;
    qty: number;
    id: string;
  }>;
};

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './test.html',
})
export class TestComponent implements OnInit, OnDestroy {
  @Output() formValueChange = new EventEmitter<FormValue>();
  @Output() formSubmit = new EventEmitter<FormValue>();

  form: FormGroup;
  categoryOptions = ['家電', '家具', '食品', '日用品'];
  apiOptions: ApiOption[] = [];
  isLoadingApiOptions = false;
  apiError = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
      category: ['', Validators.required],
      apiOption: [null, Validators.required],
      rows: this.fb.array([]),
    });

    // 最初は1行ある状態にする
    this.addRow();
  }

  ngOnInit(): void {
    this.loadApiOptions();

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.formValueChange.emit(value as FormValue);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value as FormValue);
  }

  private loadApiOptions(): void {
    this.isLoadingApiOptions = true;
    this.apiError = '';
    this.http
      .get<Array<{ id: number; name: string }>>('https://jsonplaceholder.typicode.com/users')
      .pipe(
        map((items) =>
          items.map((item) => ({
            id: item.id,
            label: item.name,
          })),
        ),
        finalize(() => {
          this.isLoadingApiOptions = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (options) => {
          this.apiOptions = options;
        },
        error: () => {
          this.apiError = 'APIの読み込みに失敗しました。';
        },
      });
  }
}
