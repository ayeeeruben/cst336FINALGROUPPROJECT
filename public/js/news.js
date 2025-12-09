const API_KEY = 'f4b41ca048f24f408b84057334a2565d';
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=pickleball&sortBy=publishedAt&language=en&pageSize=12&apiKey=${API_KEY}`;

fetch(NEWS_API_URL)
    .then(res => res.json())
    .then(data => {
        const newsFeed = document.getElementById('news-feed');
        newsFeed.innerHTML = '';
        
        if (data.articles && data.articles.length > 0) {
            data.articles.forEach(article => {
                const newsCard = document.createElement('div');
                newsCard.className = 'col-md-4 mb-4';
                newsCard.innerHTML = `
                    <div class="news-card card h-100">
                        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
                        <div class="news-card-body">
                            <h5 class="card-title">${article.title}</h5>
                            <p class="card-text">${article.description || 'No description available'}</p>
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer">Read More</a>
                            <div class="news-source">
                                <strong>${article.source.name}</strong> - ${new Date(article.publishedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                `;
                newsFeed.appendChild(newsCard);
            });
        } else {
            newsFeed.innerHTML = '<p>No news articles found.</p>';
        }
    })
    .catch(err => {
        document.getElementById('news-feed').innerHTML = '<p>Error loading news. Please try again later.</p>';
        console.error('News API error:', err);
    });
    