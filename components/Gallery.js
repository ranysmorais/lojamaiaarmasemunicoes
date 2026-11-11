'use client';

import { useRef, useState } from 'react';

export default function Gallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const viewport = useRef(null);
  const pointer = useRef(null);
  const multiple = images.length > 1;
  function resetView() {
    setZoom(1);
    if (viewport.current) { viewport.current.scrollLeft = 0; viewport.current.scrollTop = 0; }
  }
  function navigate(next) { setIndex((next + images.length) % images.length); resetView(); }
  function changeZoom(value) { setZoom(Math.min(3, Math.max(1, value))); }

  return <section className="gallery" aria-label={`Galeria de ${name}`} aria-roledescription="carrossel" onKeyDown={event => {
    if (event.target instanceof HTMLInputElement) return;
    if (multiple && event.key === 'ArrowRight') { event.preventDefault(); navigate(index + 1); }
    if (multiple && event.key === 'ArrowLeft') { event.preventDefault(); navigate(index - 1); }
  }}>
    <div className="gallery-topline"><span>LOJA MAIA / DETALHES</span><span aria-live="polite">{index + 1} / {images.length}</span></div>
    <div className="gallery-stage">
      <div className={`gallery-viewport ${zoom > 1 ? 'is-zoomed' : ''}`} ref={viewport} onPointerDown={event => {
        if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
        pointer.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
      }} onPointerMove={event => {
        if (!pointer.current) return;
        event.currentTarget.scrollLeft = pointer.current.left - (event.clientX - pointer.current.x);
        event.currentTarget.scrollTop = pointer.current.top - (event.clientY - pointer.current.y);
      }} onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }}>
        <button className="gallery-image-button" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }} onClick={() => { if (zoom === 1) setZoom(2); }} aria-label={zoom === 1 ? 'Ampliar imagem para 200%' : 'Imagem ampliada; arraste para explorar'}>
          <img src={images[index]} alt={`${name} — imagem ${index + 1} de ${images.length}`} width="1200" height="1200" draggable="false" />
        </button>
      </div>
      {multiple && <><button className="gallery-arrow previous" onClick={() => navigate(index - 1)} aria-label="Imagem anterior">‹</button><button className="gallery-arrow next" onClick={() => navigate(index + 1)} aria-label="Próxima imagem">›</button></>}
      <span className="gallery-hint">{zoom === 1 ? 'Clique na imagem para ampliar' : 'Arraste para explorar os detalhes'}</span>
    </div>
    <div className="gallery-toolbar"><span aria-live="polite">ZOOM {Math.round(zoom * 100)}%</span><div><button onClick={() => changeZoom(zoom - .5)} disabled={zoom <= 1} aria-label="Diminuir zoom">−</button><button onClick={resetView} aria-label="Restaurar imagem ao tamanho original">Ajustar</button><button onClick={() => changeZoom(zoom + .5)} disabled={zoom >= 3} aria-label="Aumentar zoom">+</button></div></div>
    {multiple && <div className="gallery-thumbnails" aria-label="Escolher imagem">{images.map((image, position) => <button key={image} aria-label={`Mostrar imagem ${position + 1} de ${name}`} aria-pressed={index === position} onClick={() => navigate(position)}><img src={image} alt="" width="90" height="75" /></button>)}</div>}
  </section>;
}
