import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
        ],
    },

    turbopack: {
        root: __dirname,
    },

    ...(process.env.NODE_ENV === 'production' && {
        outputFileTracingRoot: path.join(__dirname, '../'),
    }),
};

export default nextConfig;