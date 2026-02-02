export function LandingFooter() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} The Blog OS. All rights reserved.</p>
                    <p>
                        Designed & Built by{" "}
                        <a
                            href="https://lukeduff.co.uk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-900 font-medium hover:text-indigo-600 transition-colors"
                        >
                            Luke Duff
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
