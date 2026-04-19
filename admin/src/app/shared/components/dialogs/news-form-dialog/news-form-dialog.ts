import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { News, NewsArticle } from '../../../models/news.model';
import { firstValueFrom } from 'rxjs';
import { UploadService } from '../../../../core/services/upload.service';

@Component({
  selector: 'app-news-form-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './news-form-dialog.html',
  styleUrl: './news-form-dialog.css'
})
export class NewsFormDialog implements OnInit {
  isEditMode = false;
  isSaving = false;
  formError = '';

  heroFileName = '';
  heroUploadError = '';
  selectedHeroFile: File | null = null;

  subArticleFileNames: string[] = [];
  subArticleUploadErrors: string[] = [];
  selectedSubArticleFiles: Array<File | null> = [];

  formData: Partial<News> = {
    heroTitle: '',
    heroSubtitle: '',
    heroImg: '',
    subArticles: []
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    if (this.config.data?.news) {
      this.isEditMode = true;
      this.formData = JSON.parse(JSON.stringify(this.config.data.news)); // deep copy to handle subArticles
    } else {
      // Add initial sub-article block
      this.addSubArticle();
    }

    this.syncUploadArrays();
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

    this.selectedSubArticleFiles.push(null);
    this.subArticleFileNames.push('');
    this.subArticleUploadErrors.push('');
  }

  removeSubArticle(index: number) {
    if (this.formData.subArticles && this.formData.subArticles.length > 1) {
      this.formData.subArticles.splice(index, 1);
      // Re-adjust positions
      this.formData.subArticles.forEach((article, i) => article.position = i);

      this.selectedSubArticleFiles.splice(index, 1);
      this.subArticleFileNames.splice(index, 1);
      this.subArticleUploadErrors.splice(index, 1);
    }
  }

  onHeroFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.heroUploadError = '';

    if (!input.files || input.files.length === 0) {
      this.selectedHeroFile = null;
      this.heroFileName = '';
      return;
    }

    const file = input.files[0];
    if (!this.validateImageFile(file)) {
      this.selectedHeroFile = null;
      this.heroFileName = '';
      this.heroUploadError = 'Only image files under 1MB are allowed.';
      return;
    }

    this.selectedHeroFile = file;
    this.heroFileName = file.name;
  }

  onSubArticleFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.subArticleUploadErrors[index] = '';

    if (!input.files || input.files.length === 0) {
      this.selectedSubArticleFiles[index] = null;
      this.subArticleFileNames[index] = '';
      return;
    }

    const file = input.files[0];
    if (!this.validateImageFile(file)) {
      this.selectedSubArticleFiles[index] = null;
      this.subArticleFileNames[index] = '';
      this.subArticleUploadErrors[index] = 'Only image files under 1MB are allowed.';
      return;
    }

    this.selectedSubArticleFiles[index] = file;
    this.subArticleFileNames[index] = file.name;
  }

  async save() {
    if (this.isSaving) {
      return;
    }

    this.formError = '';
    this.isSaving = true;

    try {
      if (this.selectedHeroFile) {
        const res = await firstValueFrom(this.uploadService.uploadImage(this.selectedHeroFile));
        this.formData.heroImg = res.url;
      }

      if (this.formData.subArticles && this.formData.subArticles.length > 0) {
        for (let i = 0; i < this.formData.subArticles.length; i++) {
          const file = this.selectedSubArticleFiles[i];
          if (!file) {
            continue;
          }

          const res = await firstValueFrom(this.uploadService.uploadImage(file));
          this.formData.subArticles[i].mediaUrl = res.url;
          this.formData.subArticles[i].mediaType = 'image';
        }
      }

      this.ref.close(this.formData);
    } catch (error) {
      console.error('News media upload failed:', error);
      this.formError = 'Failed to upload one or more images. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  private validateImageFile(file: File): boolean {
    return file.type.startsWith('image/') && file.size <= 1 * 1024 * 1024;
  }

  private syncUploadArrays(): void {
    const count = this.formData.subArticles?.length || 0;
    this.selectedSubArticleFiles = Array.from({ length: count }, () => null);
    this.subArticleFileNames = Array.from({ length: count }, () => '');
    this.subArticleUploadErrors = Array.from({ length: count }, () => '');
  }
}
