import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'SkillDash Blog | DSE Trading Guides and Insights',
	description:
		'Professional guides on Dhaka Stock Exchange investing, broker comparisons, and risk-free paper trading with SkillDash.',
	alternates: {
		canonical: 'https://skilldash.live/blog',
	},
};

const posts = [
	{
		title: 'How to Open a BO Account in Bangladesh (2026)',
		href: '/blog/how-to-open-bo-account-bangladesh',
		publishedAt: 'April 8, 2026',
		excerpt:
			'Step-by-step BO account opening process, required documents, minimum funding, and safety checks before your first DSE trade.',
	},
	{
		title: 'Compare Top DSE Stock Brokers in Bangladesh (2026)',
		href: '/blog/top-dse-stock-brokers-2026',
		publishedAt: 'April 8, 2026',
		excerpt:
			'A practical comparison of BO account opening costs, annual maintenance, and commission ranges for leading DSE brokers.',
	},
];

export default function BlogPage() {
	return (
		<main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-24 pb-20">
			<section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<header className="mb-12 md:mb-16">
					<p className="text-sm font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400 mb-3">
						SkillDash Journal
					</p>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
						Ideas, Guides, and Market Notes
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
						Research-backed writing focused on Dhaka Stock Exchange education, broker selection, and practical investing workflows.
					</p>
				</header>

				<div className="space-y-6">
					{posts.map((post) => (
						<article
							key={post.href}
							className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm hover:shadow-md transition-all"
						>
							<p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{post.publishedAt}</p>
							<h2 className="text-2xl md:text-3xl font-semibold leading-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
								<Link href={post.href}>{post.title}</Link>
							</h2>
							<p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{post.excerpt}</p>
							<Link
								href={post.href}
								className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all"
							>
								Read article
								<span aria-hidden="true">→</span>
							</Link>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}
