import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: __dirname,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.shinchonkid.com",
			},
			{
				protocol: "http",
				hostname: "www.shinchonkid.com",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/about",
				destination: "/#about",
				permanent: false,
			},
			{
				source: "/contact",
				destination: "/#visit",
				permanent: false,
			},
		];
	},
};

export default nextConfig;
