import Link from 'next/link';

export default function Nav() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">PetaLoka</div>
        <nav>
          <ul className="flex gap-6 text-sm">
            <li>
              <Link href="/" className="hover:underline">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                Tentang
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Kontak
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
