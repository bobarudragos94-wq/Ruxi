/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the Prisma query engine binary is bundled into the serverless
  // (Netlify/Lambda) functions, otherwise runtime queries fail with 500.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**"],
  },
};

export default nextConfig;
