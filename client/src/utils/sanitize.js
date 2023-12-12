import DOMPurify from 'dompurify';

const sanitizeHtml = (inputHtml) => {
    const allowedTags = [
        'strong', 'em', 'b', 'i', 'a', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'p', 'br',]
  
    const sanitizedHtml = DOMPurify.sanitize(inputHtml, {
      ALLOWED_TAGS: allowedTags,
    });
  
    return sanitizedHtml;
  };

export default sanitizeHtml