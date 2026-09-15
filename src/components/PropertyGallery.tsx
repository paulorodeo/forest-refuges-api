import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type GalleryImage = { src: string; alt: string };

export function PropertyGallery({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  if (!images.length) return null;
  const current = selected ?? 0;
  const firstImage = images[0]!;
  const currentImage = images[current]!;
  const previous = () => setSelected((index) => index === null ? 0 : (index - 1 + images.length) % images.length);
  const next = () => setSelected((index) => index === null ? 0 : (index + 1) % images.length);

  return (
    <>
      <button
        type="button"
        onClick={() => setSelected(0)}
        className="mt-6 block w-full cursor-pointer overflow-hidden rounded-xl bg-secondary text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Abrir foto 1 de ${images.length}`}
      >
        <img src={firstImage.src} alt={firstImage.alt} width={1600} height={900} className="aspect-[16/9] w-full object-cover" />
      </button>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.slice(1, 9).map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setSelected(index + 1)}
              className="cursor-pointer overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Abrir foto ${index + 2} de ${images.length}`}
            >
              <img src={image.src} alt={image.alt} width={600} height={450} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          className="flex h-[100dvh] w-screen max-w-none items-center justify-center border-0 bg-black/95 p-4 sm:p-8"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") previous();
            if (event.key === "ArrowRight") next();
          }}
          onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            const end = event.changedTouches[0]?.clientX;
            touchStart.current = null;
            if (start === null || end === undefined || Math.abs(end - start) < 40) return;
            end < start ? next() : previous();
          }}
        >
          <DialogTitle className="sr-only">Galeria de imagens</DialogTitle>
          <img src={currentImage.src} alt={currentImage.alt} className="max-h-full max-w-full object-contain" />
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-sm text-white" aria-live="polite">
            {current + 1} / {images.length}
          </p>
          {images.length > 1 && <>
            <button type="button" onClick={previous} aria-label="Imagem anterior" className="absolute left-3 rounded-full bg-black/60 p-3 text-white hover:bg-black/80"><ChevronLeft /></button>
            <button type="button" onClick={next} aria-label="Próxima imagem" className="absolute right-3 rounded-full bg-black/60 p-3 text-white hover:bg-black/80"><ChevronRight /></button>
          </>}
          <button type="button" onClick={() => setSelected(null)} aria-label="Fechar galeria" className="absolute right-4 top-4 rounded-full bg-black/60 p-3 text-white hover:bg-black/80"><X /></button>
        </DialogContent>
      </Dialog>
    </>
  );
}
