import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './ImageCarousel.module.css';

interface Props {
  images: string[];
  initialIndex?: number;
}

export function ImageCarousel({ images, initialIndex = 0 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const CarouselContent = () => (
    <div className={isFullscreen ? styles.fullscreenContainer : styles.carouselContainer}>
      {isFullscreen && (
        <button className={styles.closeBtn} onClick={() => setIsFullscreen(false)}>
          <X size={24} />
        </button>
      )}
      
      <div className={styles.imageWrapper} onClick={() => !isFullscreen && setIsFullscreen(true)}>
        <img 
          src={images[currentIndex]} 
          alt={`Imagen ${currentIndex + 1} del portafolio`} 
          className={styles.image} 
        />
      </div>

      {images.length > 1 && (
        <>
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft size={24} />
          </button>
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight size={24} />
          </button>
          
          <div className={styles.dots}>
            {images.map((_, idx) => (
              <span 
                key={idx} 
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className={styles.fullscreenOverlay}>
        <CarouselContent />
      </div>
    );
  }

  return <CarouselContent />;
}
