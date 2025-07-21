export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  category: string
  content?: string
  author?: string
}

class NewsService {
  private static instance: NewsService
  private baseUrl = 'https://newsapi.org/v2'
  private apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY

  private constructor() {}

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService()
    }
    return NewsService.instance
  }

  async fetchNews(
    category: string = 'general',
    country: string = 'us',
    page: number = 1,
    pageSize: number = 20
  ): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey || this.apiKey === 'your_news_api_key_here') {
        return this.getMockNews(category, pageSize)
      }

      const response = await fetch(
        `${this.baseUrl}/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.articles?.map((article: Record<string, unknown>, index: number) => ({
        id: `${category}-${page}-${index}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        urlToImage: article.urlToImage || 'https://picsum.photos/400/300',
        publishedAt: article.publishedAt,
        source: article.source,
        category,
        content: article.content,
        author: article.author,
      })) || []
    } catch (error) {
      console.error('Error fetching news:', error)
      return this.getMockNews(category, pageSize)
    }
  }

  async searchNews(
    query: string,
    sortBy: string = 'publishedAt',
    page: number = 1,
    pageSize: number = 20
  ): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey || this.apiKey === 'your_news_api_key_here') {
        return this.getMockNews('general', pageSize, query)
      }

      const response = await fetch(
        `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.articles?.map((article: Record<string, unknown>, index: number) => ({
        id: `search-${query}-${page}-${index}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        urlToImage: article.urlToImage || 'https://picsum.photos/400/300',
        publishedAt: article.publishedAt,
        source: article.source,
        category: 'search',
        content: article.content,
        author: article.author,
      })) || []
    } catch (error) {
      console.error('Error searching news:', error)
      return this.getMockNews('general', pageSize, query)
    }
  }

  async getTopHeadlines(
    country: string = 'us',
    page: number = 1,
    pageSize: number = 20
  ): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey || this.apiKey === 'your_news_api_key_here') {
        return this.getMockNews('general', pageSize)
      }

      const response = await fetch(
        `${this.baseUrl}/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.articles?.map((article: Record<string, unknown>, index: number) => ({
        id: `headlines-${page}-${index}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        urlToImage: article.urlToImage || 'https://picsum.photos/400/300',
        publishedAt: article.publishedAt,
        source: article.source,
        category: 'headlines',
        content: article.content,
        author: article.author,
      })) || []
    } catch (error) {
      console.error('Error fetching headlines:', error)
      return this.getMockNews('general', pageSize)
    }
  }

  private getMockNews(category: string, count: number, query?: string): NewsArticle[] {
    const mockArticles = [
      {
        id: `mock-${category}-1`,
        title: 'Breaking: Technology Revolutionizes Daily Life',
        description: 'Latest technological advancements are transforming how we live and work in unprecedented ways.',
        url: 'https://example.com/tech-news-1',
        urlToImage: 'https://picsum.photos/400/300?random=1',
        publishedAt: new Date().toISOString(),
        source: { name: 'Tech News Today' },
        category,
        author: 'John Doe',
        content: 'Full article content about technology...'
      },
      {
        id: `mock-${category}-2`,
        title: 'Global Markets Show Strong Growth',
        description: 'Financial markets around the world are experiencing significant growth amid positive economic indicators.',
        url: 'https://example.com/business-news-1',
        urlToImage: 'https://picsum.photos/400/300?random=2',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Business Weekly' },
        category,
        author: 'Jane Smith',
        content: 'Full article content about markets...'
      },
      {
        id: `mock-${category}-3`,
        title: 'Climate Change Summit Reaches Historic Agreement',
        description: 'World leaders have agreed on ambitious new targets for reducing carbon emissions.',
        url: 'https://example.com/climate-news-1',
        urlToImage: 'https://picsum.photos/400/300?random=3',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Environmental Report' },
        category,
        author: 'Dr. Sarah Johnson',
        content: 'Full article content about climate...'
      },
      {
        id: `mock-${category}-4`,
        title: 'Sports Championship Breaks Viewership Records',
        description: 'The latest championship game attracted the largest audience in the sport\'s history.',
        url: 'https://example.com/sports-news-1',
        urlToImage: 'https://picsum.photos/400/300?random=4',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Sports Central' },
        category,
        author: 'Mike Wilson',
        content: 'Full article content about sports...'
      },
      {
        id: `mock-${category}-5`,
        title: 'Healthcare Innovation Promises Better Outcomes',
        description: 'New medical technologies are improving patient care and treatment effectiveness.',
        url: 'https://example.com/health-news-1',
        urlToImage: 'https://picsum.photos/400/300?random=5',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Health Today' },
        category,
        author: 'Dr. Emily Davis',
        content: 'Full article content about healthcare...'
      }
    ]

    if (query) {
      return mockArticles
        .filter(article => 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, count)
    }

    return mockArticles.slice(0, count)
  }
}

export default NewsService
