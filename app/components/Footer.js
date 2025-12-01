export default function Footer() {
  return (
    <footer className="w-full border-t bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-sm text-zinc-600">
        <div>© {new Date().getFullYear()} PetaLoka</div>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:underline">
            Kebijakan
          </a>
          <a href="/terms" className="hover:underline">
            Syarat
          </a>
        </div>
      </div>
    </footer>
  );
}
