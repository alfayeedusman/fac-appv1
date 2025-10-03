import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileImage, 
  Trash2, 
  Download, 
  Eye,
  Search,
  Filter,
  Grid,
  List,
  Plus
} from 'lucide-react';

interface ImageData {
  id: string;
  fileName: string;
  originalName: string;
  publicUrl: string;
  category: string;
  size: number;
  mimeType: string;
  altText?: string;
  description?: string;
  tags?: string[];
  viewCount?: number;
  downloadCount?: number;
  createdAt: string;
}

interface ImageUploadManagerProps {
  className?: string;
  category?: string;
  associatedWith?: string;
  associatedId?: string;
  uploadedBy?: string;
  onUploadComplete?: (images: ImageData[]) => void;
  showGallery?: boolean;
  maxFiles?: number;
}

export default function ImageUploadManager({
  className = '',
  category = 'general',
  associatedWith,
  associatedId,
  uploadedBy,
  onUploadComplete,
  showGallery = true,
  maxFiles = 10
}: ImageUploadManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state for metadata
  const [formData, setFormData] = useState({
    altText: '',
    description: '',
    tags: '',
    category: category
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Load existing images
  useEffect(() => {
    if (showGallery) {
      loadImages();
    }
  }, [showGallery, filterCategory]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(associatedWith && { associatedWith }),
        ...(associatedId && { associatedId }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/images?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data);
      } else {
        setError('Failed to load images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  // File drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelection(files);
    }
  };

  const handleFileSelection = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return false;
      }
      return true;
    });

    if (validFiles.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Add metadata
      formData.append('category', formData.get('category') || category);
      formData.append('altText', formData.get('altText') || '');
      formData.append('description', formData.get('description') || '');
      formData.append('tags', formData.get('tags') || '[]');
      
      if (associatedWith) formData.append('associatedWith', associatedWith);
      if (associatedId) formData.append('associatedId', associatedId);
      if (uploadedBy) formData.append('uploadedBy', uploadedBy);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/images/upload-multiple`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSelectedFiles([]);
        setUploadProgress(100);
        
        // Reset form
        setFormData({
          altText: '',
          description: '',
          tags: '',
          category: category
        });

        // Reload images if gallery is shown
        if (showGallery) {
          await loadImages();
        }

        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageClick = async (image: ImageData) => {
    // Increment view count
    try {
      await fetch(`/api/images/${image.id}?incrementView=true`);
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { ...img, viewCount: (img.viewCount || 0) + 1 }
          : img
      ));
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handleImageDownload = async (image: ImageData) => {
    try {
      // Add timeout for external resource fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(image.publicUrl, {
        signal: controller.signal,
        mode: 'cors', // Explicitly handle CORS
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Increment download count
      const updateController = new AbortController();
      const updateTimeoutId = setTimeout(() => updateController.abort(), 5000);

      try {
        await fetch(`/api/images/${image.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            downloadCount: (image.downloadCount || 0) + 1
          }),
          signal: updateController.signal,
        });
        clearTimeout(updateTimeoutId);
      } catch (updateError) {
        clearTimeout(updateTimeoutId);
        console.warn('Failed to update download count:', updateError);
      }
    } catch (error) {
      console.error('Download failed:', error);

      // Show user-friendly error message
      if (error.name === 'AbortError') {
        alert('Download timeout - the image took too long to download. Please try again.');
      } else if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
        alert('Unable to download this image due to security restrictions. Please contact support.');
      } else {
        alert('Failed to download image. Please try again.');
      }
    }
  };

  const filteredImages = images.filter(image => 
    image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Upload and manage your images. Supported formats: JPG, PNG, GIF, WebP (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Drag and Drop Zone */}
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Up to {maxFiles} files, max 10MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length})</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      <span className="text-sm truncate">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                placeholder="Describe the image for accessibility"
                value={formData.altText}
                onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="branch">Branch</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {showGallery && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image Gallery
                </CardTitle>
                <CardDescription>
                  Manage your uploaded images
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="branch">Branch</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading images...</div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images found
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                : "space-y-2"
              }>
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={viewMode === 'grid' 
                      ? "border rounded-lg overflow-hidden hover:shadow-lg transition-shadow" 
                      : "flex items-center gap-4 p-2 border rounded-lg"
                    }
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div 
                          className="aspect-square bg-muted cursor-pointer"
                          onClick={() => handleImageClick(image)}
                        >
                          <img
                            src={image.publicUrl}
                            alt={image.altText || image.originalName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <div className="text-sm font-medium truncate" title={image.originalName}>
                            {image.originalName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(image.size)}
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleImageDownload(image)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {image.viewCount || 0}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={image.publicUrl}
                          alt={image.altText || image.originalName}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() => handleImageClick(image)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{image.originalName}</div>
                          <div className="text-sm text-muted-foreground">
                            {image.category} • {formatFileSize(image.size)}
                          </div>
                          {image.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {image.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleImageDownload(image)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {image.viewCount || 0}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
