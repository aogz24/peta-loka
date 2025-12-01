export default function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-zinc-600 dark:text-zinc-400">
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
