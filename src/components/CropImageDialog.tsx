import {useRef} from "react";
import {Cropper, ReactCropperElement} from "react-cropper";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import "cropperjs/dist/cropper.css";

/**
 * Dialog for upload images.
 */
interface CropImageDialogProps {
  src: string;
  cropAspectRatio: number;
  onCropped: (blob: Blob | null) => void;
  onClose: () => void;
}

export default function CropImageDialog(props: CropImageDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null);

  function crop() {
    const cropper = cropperRef.current?.cropper;

    if (!cropper) return;
    cropper
      .getCroppedCanvas()
      .toBlob((blob) => props.onCropped(blob), "image/webp");
    props.onClose();
  }

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>
        <Cropper
          src={props.src}
          aspectRatio={props.cropAspectRatio}
          guides={false}
          zoomable={false}
          ref={cropperRef}
          className="mx-auto size-fit"
        ></Cropper>
        <DialogFooter>
          <Button variant="secondary" onClick={props.onClose}>
            Cancel
          </Button>
          <Button onClick={crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
