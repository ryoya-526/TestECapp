import { Component, Input } from '@angular/core';
import { Product } from '../../app/models/product.model';
import { CommonModule } from '@angular/common';
// import { Home } from '../home/home';
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {

  @Input() Product!: Product;
  
}
