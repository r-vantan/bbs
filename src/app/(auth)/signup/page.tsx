"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		await authClient.signUp.email(
			{
				name,
				email,
				password,
			},
			{
				onSuccess: () => {
					router.push("/");
				},
				onError: (ctx) => {
					alert(ctx.error.message);
					setLoading(false);
				},
			},
		);
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
			<div className="w-full max-w-md space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight dark:text-zinc-50">
						新規登録
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSignUp}>
					<div className="-space-y-px rounded-md shadow-sm">
						<div>
							<input
								type="text"
								required
								className="relative block w-full rounded-t-md border-0 py-1.5 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
								placeholder="ユーザー名"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div>
							<input
								type="email"
								required
								className="relative block w-full border-0 py-1.5  ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
								placeholder="メールアドレス"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<input
								type="password"
								required
								className="relative block w-full rounded-b-md border-0 py-1.5 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
								placeholder="パスワード"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
						>
							{loading ? "登録中..." : "登録"}
						</button>
					</div>
				</form>
				<div className="text-center">
					<Link
						href="/login"
						className="text-sm text-blue-600 hover:text-blue-500"
					>
						すでにアカウントをお持ちの方はこちら
					</Link>
				</div>
			</div>
		</div>
	);
}
