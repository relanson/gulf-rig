import sqlite3
import feedparser
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE = 'database.db'

# Simple job keywords
JOB_KEYWORDS = ['engineer', 'technician', 'supervisor', 'manager', 'operator', 
                'inspector', 'planner', 'coordinator', 'specialist']

# Oil & gas locations
LOCATIONS = ['Kuwait', 'Qatar', 'UAE', 'Saudi Arabia', 'Oman', 'Bahrain', 
             'Dubai', 'Abu Dhabi', 'Doha', 'Riyadh']

# RSS feeds
RSS_FEEDS = [
    'https://www.rigzone.com/news/rss/rigzone_latest.aspx',
    'https://www.oilandgasjobsearch.com/RSS'
]

def get_db():
    return sqlite3.connect(DATABASE)

def is_job(title, description):
    text = f"{title} {description}".lower()
    return any(kw in text for kw in JOB_KEYWORDS)

def extract_location(text):
    text = text.lower()
    for loc in LOCATIONS:
        if loc.lower() in text:
            return loc
    return 'International'

def job_exists(title, link):
    db = get_db()
    exists = db.execute(
        'SELECT id FROM jobs WHERE title=? OR apply_link=?',
        (title, link)
    ).fetchone()
    db.close()
    return exists is not None

def save_job(title, description, link, location):
    if job_exists(title, link):
        return False
    
    db = get_db()
    slug = title.lower().replace(' ', '-')[:100]
    expiry = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    db.execute('''
        INSERT INTO jobs (title, slug, description, location, industry, 
                         job_category, source, status, expiry_date, user_id, apply_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        title[:200], slug, description[:1000], location,
        'Oil and Gas', 'General', 'crawler', 'approved', expiry, 1, link
    ))
    db.commit()
    db.close()
    return True

def run():
    logger.info("Starting crawler...")
    count = 0
    
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            logger.info(f"Processing {feed_url}: {len(feed.entries)} items")
            
            for entry in feed.entries[:10]:
                title = entry.get('title', '')
                description = entry.get('summary', '') or entry.get('description', '')
                link = entry.get('link', '')
                
                if is_job(title, description):
                    location = extract_location(f"{title} {description}")
                    if save_job(title, description, link, location):
                        count += 1
                        logger.info(f"Added: {title[:50]}...")
                        
        except Exception as e:
            logger.error(f"Error with {feed_url}: {e}")
    
    logger.info(f"Crawler finished. Added {count} jobs.")
    return count

if __name__ == '__main__':
    run()