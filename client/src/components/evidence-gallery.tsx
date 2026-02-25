import { useState } from "react";
import { X, Download, Maximize2, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface EvidenceItem {
  name: string;
  url: string;
}

interface EvidenceGalleryProps {
  evidence: EvidenceItem[];
  eventTitle: string;
  eventType: string;
  eventDate: string;
}

export default function EvidenceGallery({ evidence, eventTitle, eventType, eventDate }: EvidenceGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<EvidenceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isImage = (filename: string): boolean => {
    return filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
  };

  const images = evidence.filter(item => isImage(item.name));
  const documents = evidence.filter(item => !isImage(item.name));

  const openImageModal = (item: EvidenceItem) => {
    setSelectedImage(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (evidence.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Evidencia Fotográfica */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Image className="h-4 w-4 text-gray-600" />
            <h5 className="text-sm font-medium text-gray-900">
              Evidencia Fotográfica ({images.length})
            </h5>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {images.map((item, index) => (
              <div
                key={index}
                className="relative group cursor-pointer aspect-square"
                onClick={() => openImageModal(item)}
                data-testid={`evidence-image-${index}`}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-md border border-gray-200 hover:border-primary transition-colors"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-md transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos */}
      {documents.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-4 w-4 text-gray-600" />
            <h5 className="text-sm font-medium text-gray-900">
              Documentos ({documents.length})
            </h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {documents.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:border-primary transition-colors group"
                data-testid={`evidence-document-${index}`}
              >
                <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">Documento</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => window.open(item.url, '_blank')}
                  data-testid={`button-download-document-${index}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para ver imagen completa */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg">{selectedImage?.name}</span>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">{eventType}</Badge>
                  <span className="text-sm text-gray-500">{eventTitle}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{eventDate}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedImage && window.open(selectedImage.url, '_blank')}
                  data-testid="button-download-image"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  data-testid="button-close-modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-[70vh] bg-gray-50 rounded-lg">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain"
                data-testid="modal-image"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}