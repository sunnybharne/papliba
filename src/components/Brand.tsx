import { Link } from 'react-router-dom';

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Papliba home">
      <span className="brand-mark" aria-hidden="true">
        P
      </span>
      <span>Papliba</span>
    </Link>
  );
}
