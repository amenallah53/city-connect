import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { News, NewsArticle } from '../../../models/news.model';

@Component({
  selector: 'app-news-form-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './news-form-dialog.html',
  styleUrl: './news-form-dialog.css'
})
export class NewsFormDialog implements OnInit {
  isEditMode = false;

  formData: Partial<News> = {
    heroTitle: '',
    heroSubtitle: '',
    heroImg: '',
    subArticles: []
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit() {
    if (this.config.data?.news) {
      this.isEditMode = true;
      this.formData = JSON.parse(JSON.stringify(this.config.data.news)); // deep copy to handle subArticles
    } else {
      // Add initial sub-article block
      this.addSubArticle();
    }
  }

  addSubArticle() {
    if (!this.formData.subArticles) {
      this.formData.subArticles = [];
    }
    
    const newPosition = this.formData.subArticles.length;
    this.formData.subArticles.push({
      id: `sub-${Date.now()}`, // mock id creation
      position: newPosition,
      title: '',
      content: '',
      mediaUrl: ''
    });
  }

  removeSubArticle(index: number) {
    if (this.formData.subArticles && this.formData.subArticles.length > 1) {
      this.formData.subArticles.splice(index, 1);
      // Re-adjust positions
      this.formData.subArticles.forEach((article, i) => article.position = i);
    }
  }

  save() {
    this.ref.close(this.formData);
  }
}
