import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hello-card">
        <p className="eyebrow">Papliba</p>
        <h1>Hello World</h1>
        <p>This is the first Next.js screen for Papliba.</p>
        <Link className="hello-link" href="/concept">
          View concept preview
        </Link>
      </section>
    </main>
  );
}
