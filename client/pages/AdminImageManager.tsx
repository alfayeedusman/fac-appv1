import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  Download,
  Eye,
  Settings,
  BarChart3,
  FolderPlus,
  FileImage,
  RefreshCw,
  Plus,
  HardDrive,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ImageUploadManager from "@/components/ImageUploadManager";

interface ImageStats {
  totalImages: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  totalStorageBytes: number;
  totalStorageMB: number;
}

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
  uploadedBy?: string;
  createdAt: string;
}

interface ImageCollection {
  id: string;
  name: string;
  description?: string;
  category: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export default function AdminImageManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ImageStats>({
    totalImages: 0,
    categoryBreakdown: [],
    totalStorageBytes: 0,
    totalStorageMB: 0,
  });
  const [images, setImages] = useState<ImageData[]>([]);
  const [collections, setCollections] = useState<ImageCollection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showUploader, setShowUploader] = useState(false);

  // Collection creation state
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    category: "gallery",
    isPublic: true,
  });

  const userEmail = localStorage.getItem("userEmail") || "";
  const userId = localStorage.getItem("userId") || userEmail;

  useEffect(() => {
    loadStats();
    loadImages();
    loadCollections();
  }, [selectedCategory, searchTerm]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/images/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load image stats:', error);
    }
  };

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/images?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data);
      } else {
        setError('Failed to load images');
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/images/collections');
      const result = await response.json();
      
      if (result.success) {
        setCollections(result.data);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Image Deleted",
          description: "Image has been successfully deleted",
        });
        
        await loadImages();
        await loadStats();
      } else {
        setError('Failed to delete image');
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      setError('Failed to delete image');
    }
  };

  const handleDownloadImage = async (image: ImageData) => {
    try {
      const response = await fetch(image.publicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "✅ Download Started",
        description: `Downloading ${image.originalName}`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download image');
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name) {
      setError("Collection name is required");
      return;
    }

    try {
      const response = await fetch('/api/images/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCollection,
          createdBy: userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Collection Created",
          description: `Collection "${newCollection.name}" has been created`,
        });

        setNewCollection({
          name: "",
          description: "",
          category: "gallery",
          isPublic: true,
        });

        await loadCollections();
      } else {
        setError('Failed to create collection');
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
      setError('Failed to create collection');
    }
  };

  const handleUploadComplete = async (uploadedImages: ImageData[]) => {
    toast({
      title: "✅ Upload Complete",
      description: `Successfully uploaded ${uploadedImages.length} image(s)`,
    });

    await loadImages();
    await loadStats();
    setShowUploader(false);
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredImages = images.filter(image =>
    image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-fac-orange-500 p-3 rounded-xl">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Image Manager
              </h1>
              <p className="text-muted-foreground">
                Manage and organize your images and media assets
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              loadStats();
              loadImages();
              loadCollections();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowUploader(!showUploader)}
            className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <FileImage className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalImages}
                </p>
                <p className="text-sm text-muted-foreground">Total Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <HardDrive className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalStorageMB.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">MB Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.categoryBreakdown.length}
                </p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-fac-orange-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {collections.length}
                </p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Image Gallery ({filteredImages.length})
                </CardTitle>
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
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

              {/* Bulk Actions */}
              {selectedImages.length > 0 && (
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedImages.length} image(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedImages([])}>
                      Clear Selection
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Selected
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Images</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedImages.length} selected image(s)?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              for (const imageId of selectedImages) {
                                await handleDeleteImage(imageId);
                              }
                              setSelectedImages([]);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}

              {/* Images Grid/List */}
              {isLoading ? (
                <div className="text-center py-8">Loading images...</div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images found</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
                  : "space-y-2"
                }>
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={viewMode === 'grid' 
                        ? "border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" 
                        : "flex items-center gap-4 p-3 border rounded-lg hover:bg-muted transition-colors"
                      }
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="relative">
                            <div 
                              className="aspect-square bg-muted"
                              onClick={() => toggleImageSelection(image.id)}
                            >
                              <img
                                src={image.publicUrl}
                                alt={image.altText || image.originalName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-2 left-2">
                              <input
                                type="checkbox"
                                checked={selectedImages.includes(image.id)}
                                onChange={() => toggleImageSelection(image.id)}
                                className="rounded"
                              />
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Badge variant="secondary" className="text-xs">
                                {image.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="text-sm font-medium truncate" title={image.originalName}>
                              {image.originalName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(image.size)}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadImage(image)}
                                  title="Download"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this image? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteImage(image.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {image.viewCount || 0}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedImages.includes(image.id)}
                              onChange={() => toggleImageSelection(image.id)}
                              className="rounded"
                            />
                            <img
                              src={image.publicUrl}
                              alt={image.altText || image.originalName}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{image.originalName}</div>
                            <div className="text-sm text-muted-foreground">
                              {image.category} • {formatFileSize(image.size)} • {formatDate(image.createdAt)}
                            </div>
                            {image.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {image.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadImage(image)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this image? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteImage(image.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <ImageUploadManager
            category="general"
            uploadedBy={userId}
            onUploadComplete={handleUploadComplete}
            showGallery={false}
            maxFiles={20}
          />
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections">
          <div className="space-y-6">
            {/* Create Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderPlus className="h-5 w-5 mr-2" />
                  Create New Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="collection-name">Collection Name *</Label>
                    <Input
                      id="collection-name"
                      value={newCollection.name}
                      onChange={(e) => setNewCollection({
                        ...newCollection,
                        name: e.target.value
                      })}
                      placeholder="Enter collection name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection-category">Category</Label>
                    <Select
                      value={newCollection.category}
                      onValueChange={(value) => setNewCollection({
                        ...newCollection,
                        category: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gallery">Gallery</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="banners">Banners</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="collection-description">Description</Label>
                  <Input
                    id="collection-description"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({
                      ...newCollection,
                      description: e.target.value
                    })}
                    placeholder="Enter collection description"
                  />
                </div>
                <Button onClick={handleCreateCollection} className="bg-fac-orange-500 hover:bg-fac-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </CardContent>
            </Card>

            {/* Collections List */}
            <Card>
              <CardHeader>
                <CardTitle>Image Collections ({collections.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.map((collection) => (
                    <Card key={collection.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{collection.name}</h4>
                            <Badge variant="outline">{collection.category}</Badge>
                          </div>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground">
                              {collection.description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Created: {formatDate(collection.createdAt)}
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Button variant="outline" size="sm">
                              View Images
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {collections.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No collections created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Storage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Category Breakdown</h4>
                    <div className="space-y-3">
                      {stats.categoryBreakdown.map((category) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {category.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {category.count} images
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {((category.count / stats.totalImages) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Storage Usage</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Storage</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.totalStorageMB.toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average File Size</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.totalImages > 0 
                            ? formatFileSize(stats.totalStorageBytes / stats.totalImages)
                            : '0 Bytes'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Files</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.totalImages}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
