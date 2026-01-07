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
    // Chỉ định root cho Turbopack là thư mục client
    turbopack: {
        root: __dirname,
    },
    // Chỉ bật outputFileTracingRoot khi build production (deploy)
    ...(process.env.NODE_ENV === 'production' && {
        outputFileTracingRoot: path.join(__dirname, '../'),
    }),
};

export default nextConfig;