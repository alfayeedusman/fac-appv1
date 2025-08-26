import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Upload,
  Camera,
  FileImage,
  Download,
  Trash2,
  Eye,
  X,
  Calendar,
  User,
  Clock,
  MapPin
} from 'lucide-react';

interface ImageAttachment {
  id: string;
  bookingId: string;
  type: 'before' | 'after' | 'receipt' | 'damage' | 'other';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  base64Data: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

interface ImageUploadManagerProps {
  bookingId?: string;
  allowedTypes?: Array<'before' | 'after' | 'receipt' | 'damage' | 'other'>;
  maxFileSize?: number; // in MB
  onImageUploaded?: (image: ImageAttachment) => void;
  currentUser?: any;
}

export default function ImageUploadManager({ 
  bookingId, 
  allowedTypes = ['before', 'after', 'receipt', 'damage', 'other'],
  maxFileSize = 5,
  onImageUploaded,
  currentUser
}: ImageUploadManagerProps) {
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  const [uploadType, setUploadType] = useState<'before' | 'after' | 'receipt' | 'damage' | 'other'>('before');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images for the booking
  const loadImages = () => {
    try {
      const allImages = JSON.parse(localStorage.getItem('booking_images') || '[]');
      const bookingImages = bookingId 
        ? allImages.filter((img: ImageAttachment) => img.bookingId === bookingId)
        : allImages;
      setImages(bookingImages);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Initialize images on component mount
  useState(() => {
    loadImages();
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please select an image smaller than ${maxFileSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imageData: ImageAttachment = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bookingId: bookingId || '',
          type: uploadType,
          filename: `${uploadType}_${Date.now()}_${file.name}`,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          base64Data: e.target?.result as string,
          uploadedBy: currentUser?.id || 'unknown',
          uploadedAt: new Date().toISOString(),
          description: description.trim(),
        };

        // Save to localStorage
        const existingImages = JSON.parse(localStorage.getItem('booking_images') || '[]');
        existingImages.push(imageData);
        localStorage.setItem('booking_images', JSON.stringify(existingImages));

        // Update local state
        setImages(prev => [...prev, imageData]);

        // Reset form
        setDescription('');
        setIsUploadOpen(false);
        setIsUploading(false);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Callback
        if (onImageUploaded) {
          onImageUploaded(imageData);
        }

        toast({
          title: "Image Uploaded",
          description: `${uploadType} image uploaded successfully`,
        });

      } catch (error) {
        console.error('Error uploading image:', error);
        setIsUploading(false);
        toast({
          title: "Upload Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Read Error",
        description: "Failed to read the selected file",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
  };

  const deleteImage = (imageId: string) => {
    try {
      const allImages = JSON.parse(localStorage.getItem('booking_images') || '[]');
      const filteredImages = allImages.filter((img: ImageAttachment) => img.id !== imageId);
      localStorage.setItem('booking_images', JSON.stringify(filteredImages));
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: "Image Deleted",
        description: "Image has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (image: ImageAttachment) => {
    try {
      const link = document.createElement('a');
      link.href = image.base64Data;
      link.download = image.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Image Downloaded",
        description: "Image has been downloaded to your device",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      before: 'bg-blue-100 text-blue-800',
      after: 'bg-green-100 text-green-800',
      receipt: 'bg-purple-100 text-purple-800',
      damage: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupedImages = images.reduce((acc, image) => {
    if (!acc[image.type]) acc[image.type] = [];
    acc[image.type].push(image);
    return acc;
  }, {} as Record<string, ImageAttachment[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Image Management</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage images for {bookingId ? `booking ${bookingId}` : 'bookings'}
          </p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fac-orange-500 hover:bg-fac-orange-600">
              <Camera className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Image Type</Label>
                <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Image
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this image..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Select Image File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: {maxFileSize}MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="bg-fac-orange-500 hover:bg-fac-orange-600"
              >
                {isUploading ? 'Uploading...' : 'Select File'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Images Grid */}
      {Object.keys(groupedImages).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedImages).map(([type, typeImages]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileImage className="h-5 w-5 mr-2" />
                    {type.charAt(0).toUpperCase() + type.slice(1)} Images
                    <Badge className={`ml-2 ${getTypeColor(type)}`}>
                      {typeImages.length}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={image.base64Data}
                          alt={image.description || image.originalName || "Uploaded image"}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => {
                            setSelectedImage(image);
                            setIsViewerOpen(true);
                          }}
                          onError={(e) => {
                            console.warn(`Failed to load image: ${image.originalName || image.id}`);
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDNIOGEyIDIgMCAwIDAtMiAydjEyYTIgMiAwIDAgMCAyIDJoMTNhMiAyIDAgMCAwIDItMlY1YTIgMiAwIDAgMC0yLTJ6IiBzdHJva2U9IiM5Y2E3YjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41IiBzdHJva2U9IiM5Y2E3YjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0yMSAxNS00LTQtNC41IDQuNS0zLTMiIHN0cm9rZT0iIzljYTdiMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                            e.currentTarget.className = "w-full h-full object-contain cursor-not-allowed opacity-50";
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image: ${image.originalName || image.id}`);
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedImage(image);
                              setIsViewerOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(image)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <p className="font-medium text-sm truncate" title={image.originalName}>
                            {image.originalName}
                          </p>
                          {image.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2" title={image.description}>
                              {image.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(image.size)}</span>
                            <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Upload images to document the booking process
            </p>
            <Button onClick={() => setIsUploadOpen(true)} className="bg-fac-orange-500 hover:bg-fac-orange-600">
              <Camera className="h-4 w-4 mr-2" />
              Upload First Image
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Image Viewer</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedImage.base64Data}
                  alt={selectedImage.description || selectedImage.originalName || "Selected image"}
                  className="max-w-full max-h-96 object-contain"
                  onError={(e) => {
                    console.warn(`Failed to load selected image: ${selectedImage.originalName || selectedImage.id}`);
                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDNIOGEyIDIgMCAwIDAtMiAydjEyYTIgMiAwIDAgMCAyIDJoMTNhMiAyIDAgMCAwIDItMlY1YTIgMiAwIDAgMC0yLTJ6IiBzdHJva2U9IiM5Y2E3YjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41IiBzdHJva2U9IiM5Y2E3YjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0yMSAxNS00LTQtNC41IDQuNS0zLTMiIHN0cm9rZT0iIzljYTdiMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                    e.currentTarget.className = "max-w-full max-h-96 object-contain opacity-50";
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Filename:</strong> {selectedImage.originalName}</p>
                  <p><strong>Type:</strong> <Badge className={getTypeColor(selectedImage.type)}>{selectedImage.type}</Badge></p>
                  <p><strong>Size:</strong> {formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <p><strong>Uploaded:</strong> {new Date(selectedImage.uploadedAt).toLocaleString()}</p>
                  <p><strong>Booking ID:</strong> {selectedImage.bookingId || 'N/A'}</p>
                </div>
              </div>
              {selectedImage.description && (
                <div>
                  <p><strong>Description:</strong></p>
                  <p className="text-muted-foreground">{selectedImage.description}</p>
                </div>
              )}
              <div className="flex justify-center gap-2">
                <Button onClick={() => downloadImage(selectedImage)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    deleteImage(selectedImage.id);
                    setIsViewerOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
