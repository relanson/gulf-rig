import os
import sqlite3
import random
import string
from datetime import datetime, timedelta
from math import ceil
from functools import wraps
from flask import Flask, render_template, request, redirect, session, url_for, abort, flash, g
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-this')
app.config['DATABASE'] = 'database.db'
app.config['POSTS_PER_PAGE'] = int(os.getenv('POSTS_PER_PAGE', 10))

# Upload settings
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)

# ================= DATABASE =================
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'poster',
            verification_status TEXT DEFAULT 'approved',
            company_name TEXT,
            email_verified BOOLEAN DEFAULT 0,
            otp_code TEXT,
            otp_expiry TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            industry TEXT,
            project_type TEXT,
            duration TEXT,
            salary_min INTEGER,
            salary_max INTEGER,
            experience_years INTEGER,
            contact_email TEXT,
            contact_phone TEXT,
            apply_link TEXT,
            source TEXT DEFAULT 'manual',
            status TEXT DEFAULT 'pending',
            views INTEGER DEFAULT 0,
            expiry_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER,
            currency TEXT DEFAULT '$',
            image_filename TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            title TEXT,
            description TEXT,
            uploaded_by INTEGER,
            status TEXT DEFAULT 'pending',
            views INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
    ''')
    
    db.commit()

def add_currency_column():
    db = get_db()
    try:
        cursor = db.execute("PRAGMA table_info(jobs)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'currency' not in columns:
            db.execute("ALTER TABLE jobs ADD COLUMN currency TEXT DEFAULT '$'")
            db.commit()
            print("✅ Added currency column to jobs table")
    except Exception as e:
        print(f"⚠️ Could not add currency column: {e}")

def add_verification_columns():
    db = get_db()
    try:
        cursor = db.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'email_verified' not in columns:
            db.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0")
            print("✅ Added email_verified column")
        
        if 'otp_code' not in columns:
            db.execute("ALTER TABLE users ADD COLUMN otp_code TEXT")
            print("✅ Added otp_code column")
        
        if 'otp_expiry' not in columns:
            db.execute("ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP")
            print("✅ Added otp_expiry column")
        
        db.commit()
    except Exception as e:
        print(f"⚠️ Could not add verification columns: {e}")

def add_image_column():
    db = get_db()
    try:
        cursor = db.execute("PRAGMA table_info(jobs)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'image_filename' not in columns:
            db.execute("ALTER TABLE jobs ADD COLUMN image_filename TEXT")
            print("✅ Added image_filename column to jobs table")
            db.commit()
    except Exception as e:
        print(f"⚠️ Could not add image column: {e}")

def create_admin():
    db = get_db()
    admin = db.execute("SELECT * FROM users WHERE role='admin'").fetchone()
    if not admin:
        db.execute('''
            INSERT INTO users (username, email, password_hash, role, verification_status, email_verified)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('Admin', os.getenv('ADMIN_EMAIL', 'admin@jobportal.com'), 
              generate_password_hash(os.getenv('ADMIN_PASSWORD', 'admin123')), 'admin', 'approved', 1))
        db.commit()
        print("✅ Admin user created")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email, otp):
    try:
        msg = Message('Email Verification - Job Portal',
                      recipients=[email])
        msg.body = f'''Your OTP for email verification is: {otp}

This OTP will expire in 10 minutes.

If you did not request this, please ignore this email.
'''
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

# ================= DECORATORS =================
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login first', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') != 'admin':
            flash('Access denied', 'danger')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated

def email_verified_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') == 'poster':
            db = get_db()
            user = db.execute('SELECT email_verified FROM users WHERE id=?', 
                            (session['user_id'],)).fetchone()
            if not user or not user['email_verified']:
                flash('Please verify your email before posting jobs', 'warning')
                return redirect(url_for('verify_email'))
        return f(*args, **kwargs)
    return decorated

# ================= CONTEXT PROCESSOR =================
@app.context_processor
def utility_processor():
    def get_recent_images(limit=12):
        db = get_db()
        images = db.execute('''
            SELECT images.*, users.username, users.company_name, users.role 
            FROM images 
            LEFT JOIN users ON images.uploaded_by = users.id 
            WHERE images.status='approved'
            ORDER BY images.created_at DESC
            LIMIT ?
        ''', (limit,)).fetchall()
        return images
    
    def now():
        return datetime.now()
    
    return dict(get_recent_images=get_recent_images, now=now)

# ================= STATIC PAGES =================
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/send-message', methods=['POST'])
def send_message():
    name = request.form.get('name')
    email = request.form.get('email')
    subject = request.form.get('subject')
    message = request.form.get('message')
    
    flash(f'Thank you {name}! Your message has been sent. We\'ll get back to you soon.', 'success')
    return redirect(url_for('contact'))

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

# ================= MAIN ROUTES =================
@app.route('/')
def home():
    page = request.args.get('page', 1, type=int)
    per_page = app.config['POSTS_PER_PAGE']
    offset = (page - 1) * per_page
    
    title = request.args.get('title', '')
    location = request.args.get('location', '')
    
    db = get_db()
    
    query = "SELECT jobs.*, users.company_name FROM jobs LEFT JOIN users ON jobs.user_id = users.id WHERE jobs.status='approved'"
    count_query = "SELECT COUNT(*) FROM jobs WHERE status='approved'"
    params = []
    
    if title:
        query += " AND title LIKE ?"
        count_query += " AND title LIKE ?"
        params.append(f'%{title}%')
    
    if location:
        query += " AND location LIKE ?"
        count_query += " AND location LIKE ?"
        params.append(f'%{location}%')
    
    total_jobs = db.execute(count_query, params).fetchone()[0]
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    jobs = db.execute(query, params + [per_page, offset]).fetchall()
    
    total_pages = ceil(total_jobs / per_page) if total_jobs > 0 else 1
    
    return render_template('home.html', 
                         jobs=jobs, 
                         page=page, 
                         total_pages=total_pages,
                         total_jobs=total_jobs,
                         title=title,
                         location=location)

@app.route('/job/<int:job_id>')
def job_detail(job_id):
    db = get_db()
    job = db.execute('''
        SELECT jobs.*, users.company_name 
        FROM jobs 
        LEFT JOIN users ON jobs.user_id = users.id 
        WHERE jobs.id=? AND jobs.status='approved'
    ''', (job_id,)).fetchone()
    
    if not job:
        abort(404)
    
    db.execute('UPDATE jobs SET views = views + 1 WHERE id=?', (job_id,))
    db.commit()
    
    return render_template('job_detail.html', job=job)

# ================= AUTHENTICATION ROUTES =================
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        company = request.form.get('company_name')
        
        if not all([username, email, password, company]):
            flash('All fields are required', 'danger')
            return render_template('register.html')
        
        db = get_db()
        try:
            db.execute('''
                INSERT INTO users (username, email, password_hash, company_name, role, verification_status, email_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (username, email, generate_password_hash(password), company, 'poster', 'approved', 0))
            db.commit()
            
            user = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
            
            session['user_id'] = user['id']
            session['role'] = user['role']
            session['username'] = user['username']
            session['company_name'] = user['company_name']
            
            flash('Registration successful! Please verify your email to start posting jobs.', 'success')
            return redirect(url_for('verify_email'))
            
        except sqlite3.IntegrityError:
            flash('Email already exists', 'danger')
    
    return render_template('register.html')

@app.route('/verify-email', methods=['GET', 'POST'])
@login_required
def verify_email():
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id=?', (session['user_id'],)).fetchone()
    
    if user['email_verified']:
        flash('Your email is already verified', 'success')
        return redirect(url_for('poster_dashboard'))
    
    if request.method == 'POST':
        otp = request.form.get('otp')
        
        if user['otp_code'] == otp and datetime.now() < datetime.fromisoformat(user['otp_expiry']):
            db.execute('UPDATE users SET email_verified=1, otp_code=NULL, otp_expiry=NULL WHERE id=?', 
                      (session['user_id'],))
            db.commit()
            flash('Email verified successfully! You can now post jobs.', 'success')
            return redirect(url_for('poster_dashboard'))
        else:
            flash('Invalid or expired OTP', 'danger')
    
    return render_template('verify_email.html', email=user['email'])

@app.route('/send-otp')
@login_required
def send_otp():
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id=?', (session['user_id'],)).fetchone()
    
    if user['email_verified']:
        flash('Email already verified', 'info')
        return redirect(url_for('poster_dashboard'))
    
    otp = generate_otp()
    expiry = datetime.now() + timedelta(minutes=10)
    
    db.execute('UPDATE users SET otp_code=?, otp_expiry=? WHERE id=?', 
              (otp, expiry.isoformat(), session['user_id']))
    db.commit()
    
    if send_otp_email(user['email'], otp):
        flash('OTP sent to your email! Check your inbox.', 'success')
    else:
        flash('Failed to send OTP. Please try again.', 'danger')
    
    return redirect(url_for('verify_email'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['role'] = user['role']
            session['username'] = user['username']
            session['company_name'] = user['company_name']
            
            if user['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('poster_dashboard'))
        else:
            flash('Invalid email or password', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

# ================= EMPLOYER DASHBOARD =================
@app.route('/poster/dashboard')
@login_required
def poster_dashboard():
    if session.get('role') != 'poster':
        return redirect(url_for('home'))
    
    db = get_db()
    jobs = db.execute('SELECT * FROM jobs WHERE user_id=? ORDER BY created_at DESC', 
                     (session['user_id'],)).fetchall()
    
    images = db.execute('''
        SELECT * FROM images 
        WHERE uploaded_by=? 
        ORDER BY created_at DESC
    ''', (session['user_id'],)).fetchall()
    
    user = db.execute('SELECT verification_status, email_verified FROM users WHERE id=?', 
                     (session['user_id'],)).fetchone()
    
    approved_jobs = [j for j in jobs if j['status'] == 'approved']
    pending_jobs = [j for j in jobs if j['status'] == 'pending']
    approved_images = [i for i in images if i['status'] == 'approved']
    pending_images = [i for i in images if i['status'] == 'pending']
    
    return render_template('poster_dashboard.html', 
                         jobs=jobs, 
                         images=images,
                         approved_jobs_count=len(approved_jobs),
                         pending_jobs_count=len(pending_jobs),
                         approved_images_count=len(approved_images),
                         pending_images_count=len(pending_images),
                         total_images_count=len(images),
                         status=user['verification_status'], 
                         email_verified=user['email_verified'])

# ================= EMPLOYER DELETE IMAGE =================
@app.route('/poster/delete-image/<int:image_id>')
@login_required
def delete_image_poster(image_id):
    db = get_db()
    
    image = db.execute('SELECT * FROM images WHERE id=? AND uploaded_by=?', 
                      (image_id, session['user_id'])).fetchone()
    
    if not image:
        flash('Image not found or you do not have permission to delete it', 'danger')
        return redirect(url_for('poster_dashboard'))
    
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image['filename'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        db.execute('DELETE FROM images WHERE id=?', (image_id,))
        db.commit()
        
        flash('Image deleted successfully', 'success')
    except Exception as e:
        print(f"Error deleting image: {e}")
        flash('Error deleting image', 'danger')
    
    return redirect(url_for('poster_dashboard'))

# ================= ADD JOB ROUTE =================
@app.route('/poster/add', methods=['GET', 'POST'])
@login_required
@email_verified_required
def add_job():
    if session.get('role') not in ['poster', 'admin']:
        return redirect(url_for('home'))
    
    db = get_db()
    
    if request.method == 'POST':
        title = request.form.get('title')
        location = request.form.get('location')
        description = request.form.get('description')
        
        if not all([title, location, description]):
            flash('Title, location and description are required', 'danger')
            return render_template('add_job.html')
        
        slug = title.lower().replace(' ', '-')[:100]
        expiry = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        status = 'approved' if session.get('role') == 'admin' else 'pending'
        image_filename = session.pop('uploaded_image', None)
        
        db.execute('''
            INSERT INTO jobs (
                title, slug, description, location, industry, 
                project_type, duration, salary_min, salary_max, 
                experience_years, contact_email, contact_phone, 
                apply_link, status, expiry_date, user_id, currency, image_filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            title,
            slug,
            description,
            location,
            request.form.get('industry'),
            request.form.get('project_type'),
            request.form.get('duration'),
            request.form.get('salary_min'),
            request.form.get('salary_max'),
            request.form.get('experience_years'),
            request.form.get('contact_email'),
            request.form.get('contact_phone'),
            request.form.get('apply_link'),
            status,
            expiry,
            session['user_id'],
            request.form.get('currency', '$'),
            image_filename
        ))
        
        db.commit()
        
        if status == 'approved':
            flash('Job posted successfully and is now live!', 'success')
        else:
            flash('Job posted successfully! Pending admin approval.', 'success')
            
        if session.get('role') == 'admin':
            return redirect(url_for('admin_dashboard'))
        else:
            return redirect(url_for('poster_dashboard'))
    
    return render_template('add_job.html')

# ================= IMAGE UPLOAD FOR JOB POSTING =================
@app.route('/upload-job-image', methods=['POST'])
@login_required
def upload_job_image():
    if 'file' not in request.files:
        flash('No file selected', 'danger')
        return redirect(url_for('add_job'))
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No file selected', 'danger')
        return redirect(url_for('add_job'))
    
    if not allowed_file(file.filename):
        flash('Invalid file type. Please upload JPG, PNG, or GIF', 'danger')
        return redirect(url_for('add_job'))
    
    try:
        filename = secure_filename(file.filename)
        import time
        timestamp = int(time.time())
        new_filename = f"{timestamp}_{filename}"
        
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)
        
        session['uploaded_image'] = new_filename
        flash('Image uploaded successfully! It will be added to your job posting.', 'success')
        
    except Exception as e:
        print(f"Upload error: {e}")
        flash('Upload failed. Please try again.', 'danger')
    
    return redirect(url_for('add_job'))

# ================= FEED IMAGE UPLOAD =================
@app.route('/upload-feed-image', methods=['POST'])
@login_required
def upload_feed_image():
    title = request.form.get('title', '')
    description = request.form.get('description', '')
    
    if 'file' not in request.files:
        flash('No file selected', 'danger')
        return redirect(url_for('add_job'))
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No file selected', 'danger')
        return redirect(url_for('add_job'))
    
    if not allowed_file(file.filename):
        flash('Invalid file type. Please upload JPG, PNG, or GIF', 'danger')
        return redirect(url_for('add_job'))
    
    try:
        filename = secure_filename(file.filename)
        import time
        timestamp = int(time.time())
        new_filename = f"{timestamp}_{filename}"
        
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)
        
        status = 'approved' if session.get('role') == 'admin' else 'pending'
        
        db = get_db()
        db.execute('''
            INSERT INTO images (filename, title, description, uploaded_by, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (new_filename, title, description, session['user_id'], status))
        db.commit()
        
        if status == 'approved':
            flash('✅ Image uploaded successfully to the feed!', 'success')
        else:
            flash('✅ Image uploaded! Waiting for admin approval. You can check status in your dashboard.', 'info')
        
    except Exception as e:
        print(f"Upload error: {e}")
        flash('Upload failed. Please try again.', 'danger')
    
    return redirect(url_for('add_job'))

# ================= ADMIN DASHBOARD =================
@app.route('/admin')
@admin_required
def admin_dashboard():
    db = get_db()
    
    # Total employers count
    total_employers_count = db.execute('''
        SELECT COUNT(*) FROM users WHERE role='poster'
    ''').fetchone()[0]
    
    # Total jobs count
    total_jobs_count = db.execute('''
        SELECT COUNT(*) FROM jobs
    ''').fetchone()[0]
    
    # Pending jobs count
    pending_jobs_count = db.execute('''
        SELECT COUNT(*) FROM jobs WHERE status='pending'
    ''').fetchone()[0]
    
    # Approved jobs count
    approved_jobs_count = db.execute('''
        SELECT COUNT(*) FROM jobs WHERE status='approved'
    ''').fetchone()[0]
    
    # Total images count
    total_images_count = db.execute('''
        SELECT COUNT(*) FROM images
    ''').fetchone()[0]
    
    # Pending images count
    pending_images_count = db.execute('''
        SELECT COUNT(*) FROM images WHERE status='pending'
    ''').fetchone()[0]
    
    # Total views count
    total_views_count = db.execute('''
        SELECT (SELECT IFNULL(SUM(views), 0) FROM jobs) + 
               (SELECT IFNULL(SUM(views), 0) FROM images) as total_views
    ''').fetchone()[0]
    
    return render_template('admin_dashboard.html',
                         total_employers_count=total_employers_count,
                         total_jobs_count=total_jobs_count,
                         total_images_count=total_images_count,
                         total_views_count=total_views_count,
                         pending_jobs_count=pending_jobs_count,
                         pending_images_count=pending_images_count,
                         approved_jobs_count=approved_jobs_count)

# ================= ADMIN ALL EMPLOYERS PAGE =================
@app.route('/admin/all-employers')
@admin_required
def admin_all_employers():
    db = get_db()
    
    employers = db.execute('''
        SELECT * FROM users 
        WHERE role='poster'
        ORDER BY created_at DESC
    ''').fetchall()
    
    # Get job and image counts for each employer
    employer_stats = []
    for employer in employers:
        job_count = db.execute('SELECT COUNT(*) FROM jobs WHERE user_id=?', 
                              (employer['id'],)).fetchone()[0]
        image_count = db.execute('SELECT COUNT(*) FROM images WHERE uploaded_by=?', 
                                (employer['id'],)).fetchone()[0]
        employer_stats.append({
            'employer': employer,
            'job_count': job_count,
            'image_count': image_count
        })
    
    return render_template('admin_all_employers.html', employer_stats=employer_stats)

# ================= ADMIN PENDING IMAGES PAGE =================
@app.route('/admin/pending-images')
@admin_required
def admin_pending_images():
    db = get_db()
    
    pending_images = db.execute('''
        SELECT images.*, users.username, users.company_name 
        FROM images 
        LEFT JOIN users ON images.uploaded_by = users.id 
        WHERE images.status='pending'
        ORDER BY images.created_at DESC
    ''').fetchall()
    
    return render_template('admin_pending_images.html', pending_images=pending_images)

@app.route('/admin/approve-image/<int:image_id>')
@admin_required
def admin_approve_image(image_id):
    db = get_db()
    db.execute('UPDATE images SET status="approved" WHERE id=?', (image_id,))
    db.commit()
    flash('Image approved and now visible in feed', 'success')
    return redirect(url_for('admin_pending_images'))

# ================= FIXED ADMIN DELETE IMAGE =================
@app.route('/admin/delete-image/<int:image_id>')
@admin_required
def admin_delete_image(image_id):
    db = get_db()
    
    # Get image info and delete file
    image = db.execute('SELECT * FROM images WHERE id=?', (image_id,)).fetchone()
    
    if image:
        # Delete the physical file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image['filename'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db.execute('DELETE FROM images WHERE id=?', (image_id,))
        db.commit()
        
        flash(f'Image "{image["title"] or "untitled"}" deleted successfully', 'success')
    
    # Redirect back to the page they came from
    referrer = request.referrer
    if referrer and '/admin' in referrer:
        return redirect(referrer)
    return redirect(url_for('home'))

# ================= ADMIN PENDING JOBS PAGE =================
@app.route('/admin/pending-jobs')
@admin_required
def admin_pending_jobs():
    db = get_db()
    
    pending_jobs = db.execute('''
        SELECT jobs.*, users.company_name 
        FROM jobs 
        LEFT JOIN users ON jobs.user_id = users.id 
        WHERE jobs.status='pending'
        ORDER BY jobs.created_at DESC
    ''').fetchall()
    
    return render_template('admin_pending_jobs.html', pending_jobs=pending_jobs)

@app.route('/admin/approve-job/<int:job_id>')
@admin_required
def admin_approve_job(job_id):
    db = get_db()
    db.execute('UPDATE jobs SET status="approved" WHERE id=?', (job_id,))
    db.commit()
    flash('Job approved and now live on site', 'success')
    return redirect(url_for('admin_pending_jobs'))

# ================= FIXED ADMIN DELETE JOB =================
@app.route('/admin/delete-job/<int:job_id>')
@admin_required
def admin_delete_job(job_id):
    db = get_db()
    
    # Get job info before deleting (for flash message)
    job = db.execute('SELECT title FROM jobs WHERE id=?', (job_id,)).fetchone()
    
    # Delete the job
    db.execute('DELETE FROM jobs WHERE id=?', (job_id,))
    db.commit()
    
    flash(f'Job "{job["title"]}" deleted successfully', 'success')
    
    # Redirect back to the page they came from, or home if no referrer
    referrer = request.referrer
    if referrer and ('/admin' in referrer or '/job/' in referrer):
        return redirect(referrer)
    return redirect(url_for('home'))

# ================= KEEP OLD ROUTES FOR BACKWARD COMPATIBILITY =================
@app.route('/admin/reject-job/<int:job_id>')
@admin_required
def admin_reject_job(job_id):
    return redirect(url_for('admin_delete_job', job_id=job_id))

@app.route('/admin/reject-image/<int:image_id>')
@admin_required
def admin_reject_image(image_id):
    return redirect(url_for('admin_delete_image', image_id=image_id))

# ================= ADMIN APPROVED COMPANIES PAGE =================
@app.route('/admin/approved-companies')
@admin_required
def admin_approved_companies():
    db = get_db()
    
    approved_companies = db.execute('''
        SELECT * FROM users 
        WHERE role='poster'
        ORDER BY created_at DESC
    ''').fetchall()
    
    return render_template('admin_approved_companies.html', companies=approved_companies)

# ================= ADMIN DELETE COMPANY =================
@app.route('/admin/delete-company/<int:company_id>')
@admin_required
def admin_delete_company(company_id):
    db = get_db()
    
    # First delete all jobs posted by this company
    db.execute('DELETE FROM jobs WHERE user_id=?', (company_id,))
    
    # Delete all images uploaded by this company
    images = db.execute('SELECT filename FROM images WHERE uploaded_by=?', (company_id,)).fetchall()
    for image in images:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image['filename'])
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.execute('DELETE FROM images WHERE uploaded_by=?', (company_id,))
    
    # Then delete the company/user
    db.execute('DELETE FROM users WHERE id=? AND role="poster"', (company_id,))
    db.commit()
    
    flash('Company and all associated jobs and images deleted successfully', 'success')
    return redirect(url_for('admin_all_employers'))

# ================= API ENDPOINTS FOR INFINITE SCROLL =================
@app.route('/api/jobs')
def api_jobs():
    page = request.args.get('page', 1, type=int)
    title = request.args.get('title', '')
    location = request.args.get('location', '')
    per_page = app.config['POSTS_PER_PAGE']
    
    db = get_db()
    offset = (page - 1) * per_page
    
    query = "SELECT jobs.*, users.company_name FROM jobs LEFT JOIN users ON jobs.user_id = users.id WHERE jobs.status='approved'"
    params = []
    
    if title:
        query += " AND title LIKE ?"
        params.append(f'%{title}%')
    
    if location:
        query += " AND location LIKE ?"
        params.append(f'%{location}%')
    
    # Get total count
    count_query = query.replace("jobs.*, users.company_name", "COUNT(*)")
    total = db.execute(count_query, params).fetchone()[0]
    
    # Get paginated results
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    jobs = db.execute(query, params + [per_page, offset]).fetchall()
    
    # Convert to list of dicts for JSON
    jobs_list = []
    for job in jobs:
        job_dict = dict(job)
        # Convert datetime to string
        job_dict['created_at'] = str(job_dict['created_at']) if job_dict['created_at'] else None
        jobs_list.append(job_dict)
    
    return {
        'jobs': jobs_list,
        'has_more': total > page * per_page,
        'page': page,
        'total': total
    }

# ================= ERROR HANDLERS =================
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# ================= INIT =================
with app.app_context():
    init_db()
    add_currency_column()
    add_verification_columns()
    add_image_column()
    create_admin()

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)