import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <h1>Ecommerce Toolkit</h1>
        <p>Prepare product images quickly, right in your browser.</p>
      </header>
      <p>
        <Link className="button button--primary" href="/optimize">
          Open the Image Optimizer
        </Link>
      </p>
    </main>
  );
}
