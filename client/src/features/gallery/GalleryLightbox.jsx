import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

/** Full-screen photo viewer (zoom, thumbnails, captions, fullscreen). Loaded on first open. */
export default function GalleryLightbox({ slides, index, onClose }) {
  return (
    <Lightbox
      open={index >= 0}
      index={Math.max(0, index)}
      close={onClose}
      slides={slides}
      plugins={[Zoom, Thumbnails, Captions, Fullscreen]}
      thumbnails={{ border: 0, borderRadius: 10, padding: 0, gap: 12, width: 110, height: 72 }}
      zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
      captions={{ descriptionTextAlign: 'center' }}
      styles={{ container: { backgroundColor: 'rgba(6, 12, 28, 0.96)' }, thumbnailsContainer: { backgroundColor: 'rgba(6, 12, 28, 0.9)' } }}
    />
  );
}
