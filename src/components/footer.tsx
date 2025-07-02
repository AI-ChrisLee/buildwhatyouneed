import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2025 Build What You Need. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}