import { Link } from 'react-router-dom';

export function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5.5 7.5h3.25c4.75 0 3.5 8.5 7.25 8.5" />
      <path d="M5.5 16H16" />
      <path d="M5.5 24.5h3.25c4.75 0 3.5-8.5 7.25-8.5" />
      <circle cx="17.75" cy="16" r="2.25" />
      <path d="M20 16h6.5" />
      <circle className="brand-mark__endpoint" cx="27" cy="16" r="1.5" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Papliba home">
      <span className="brand-mark" aria-hidden="true">
        <BrandMark />
      </span>
      <span>Papliba</span>
    </Link>
  );
}
