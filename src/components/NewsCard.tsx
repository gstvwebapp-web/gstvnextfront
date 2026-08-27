import Image from 'next/image';
import { NewsItem } from '@/services/newsApi';
import {
  formatDate,
  truncateText,
  stripHtml,
  formatViews,
  getFirstCategory,
  getImageUrl,
  handleImageError,
  openInNewTab,
  generateNewsUrl,
  getLanguageFontClass
} from '@/utils/commonFunctions';

interface NewsCardProps {
  news: NewsItem;
  onClick?: (news: NewsItem) => void;
}

export default function NewsCard({ news, onClick }: NewsCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(news);
    } else {
      // Default behavior: open news article
      console.log('News clicked:', news.slug);
      const newsUrl = generateNewsUrl(news.slug);
      openInNewTab(newsUrl);
    }
  };

  return (
    <div className="news-card" onClick={handleClick}>
      <div className="news-image-container">
        {news.featureImage || news.imageURL ? (
          <Image
            src={getImageUrl(news.featureImage, news.imageURL)}
            alt={news.title}
            width={300}
            height={200}
            className="news-image"
            onError={handleImageError}
          />
        ) : (
          <div className="news-placeholder">
            <i className="fas fa-newspaper"></i>
          </div>
        )}
        
        {news.videoURL && (
          <div className="video-indicator">
            <i className="fas fa-play"></i>
          </div>
        )}
        
        <div className="news-category">
          <span className={`category-tag ${getLanguageFontClass(getFirstCategory(news.category_slugs))}`}>
            {getFirstCategory(news.category_slugs)}
          </span>
        </div>
      </div>

      <div className="news-content">
        <h3 className={`news-title ${getLanguageFontClass(news.title)}`}>
          {truncateText(news.title, 80)}
        </h3>

        <p className={`news-description ${getLanguageFontClass(news.description)}`}>
          {truncateText(stripHtml(news.description), 120)}
        </p>
        
        <div className="news-meta">
          <span className="news-time custom-gujrati-font">
            <i className="far fa-clock"></i>
            {formatDate(news.updated_at)}
          </span>
          
          <span className="news-views custom-gujrati-font">
            <i className="far fa-eye"></i>
            {formatViews(news.viewer)}
          </span>
        </div>
      </div>
    </div>
  );
}
