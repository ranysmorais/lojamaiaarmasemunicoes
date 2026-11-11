export function getImages(product) {
  const images = Array.isArray(product.images) ? product.images.filter(image => typeof image === 'string' && image.trim()) : [];
  return images.length ? [...new Set(images)] : product.image ? [product.image] : ['/placeholder.svg'];
}
