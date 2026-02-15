import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img-bbs.tah5882.dev",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},
};

export default nextConfig;
