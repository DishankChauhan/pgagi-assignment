import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'newsapi.org',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'sportshub.cbsistatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.cbsistatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.cnn.com',
      },
      {
        protocol: 'https',
        hostname: '*.bbc.com',
      },
      {
        protocol: 'https',
        hostname: '*.reuters.com',
      },
      {
        protocol: 'https',
        hostname: '*.ap.org',
      },
      {
        protocol: 'https',
        hostname: '*.washingtonpost.com',
      },
      {
        protocol: 'https',
        hostname: '*.nytimes.com',
      },
      {
        protocol: 'https',
        hostname: '*.wsj.com',
      },
      {
        protocol: 'https',
        hostname: '*.usatoday.com',
      },
      {
        protocol: 'https',
        hostname: '*.espn.com',
      },
      {
        protocol: 'https',
        hostname: '*.techcrunch.com',
      },
      {
        protocol: 'https',
        hostname: '*.engadget.com',
      },
      {
        protocol: 'https',
        hostname: '*.theverge.com',
      },
      {
        protocol: 'https',
        hostname: '*.arstechnica.com',
      },
      // Catch-all for other domains
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
