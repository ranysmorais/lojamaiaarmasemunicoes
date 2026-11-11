const WHATSAPP_NUMBER = '5562993257816';

function canShowContact(product) {
  return product.contactEligible === true;
}

function contactUrl(product) {
  const message = `Olá! Gostaria de informações sobre ${product.name}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ProductContact({ product }) {
  if (!canShowContact(product)) return null;
  return <a className="product-whatsapp" href={contactUrl(product)} target="_blank" rel="noopener noreferrer" aria-label={`Perguntar sobre ${product.name} pelo WhatsApp (abre em nova aba)`}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-13.5 7.8L3 21l1.7-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.5 7.5c-.8 1.5 0 3.4 1.6 5s3.5 2.4 5 1.6l.6-1.3-2-1-1 1c-1.3-.6-2.2-1.5-2.8-2.8l1-1-1-2Z"/></svg>
    Falar pelo WhatsApp <span aria-hidden="true">↗</span>
  </a>;
}
