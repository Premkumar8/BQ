import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Product, User, CartItem

import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

app = Flask(__name__)
CORS(app) # Enable CORS for frontend requests

# Configure Database
# For local dev, use ladizo.db SQLite file. For Vercel/Production, use PostgreSQL via DATABASE_URL
database_url = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL')
if database_url:
    # SQLAlchemy requires 'postgresql://' instead of 'postgres://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    # Remove Supabase-specific unsupported options that crash psycopg2
    import re
    database_url = re.sub(r'[\?&]supa=[^&]*', '', database_url)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    basedir = os.path.abspath(os.path.dirname(__name__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'ladizo.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ladizo-super-secret-key-2026')

db.init_app(app)

# Authentication Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2:
                token = parts[1]
                
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# -----------------
# AUTH ROUTES
# -----------------

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    
    if not password and not data.get('google_id'):
        return jsonify({'message': 'Password required for non-Google login.'}), 400
        
    user = None
    if email:
        user = User.query.filter_by(email=email).first()
    elif phone:
        user = User.query.filter_by(phone=phone).first()
        
    if user:
        return jsonify({'message': 'User already exists.'}), 400
        
    hashed_password = generate_password_hash(password, method='scrypt') if password else None
    
    new_user = User(
        email=email,
        phone=phone,
        password_hash=hashed_password,
        google_id=data.get('google_id')
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    google_id = data.get('google_id')
    
    user = None
    if google_id:
        user = User.query.filter_by(google_id=google_id).first()
        # Mock auto-registration for Google
        if not user:
            user = User(email=email, google_id=google_id)
            db.session.add(user)
            db.session.commit()
    elif email:
        user = User.query.filter_by(email=email).first()
    elif phone:
        user = User.query.filter_by(phone=phone).first()
        
    if not user:
        return jsonify({'message': 'User not found!'}), 404
        
    if not google_id:
        if not check_password_hash(user.password_hash, password):
            return jsonify({'message': 'Invalid credentials!'}), 401
            
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({'token': token}), 200

# -----------------
# PRODUCT ROUTES
# -----------------

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([p.to_dict() for p in products]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        return jsonify(product.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------
# CART ROUTES
# -----------------

@app.route('/api/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200

@app.route('/api/cart', methods=['POST'])
@token_required
def add_to_cart(current_user):
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({'message': 'Product ID is required'}), 400
        
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
        
    # Check if already in cart
    cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
        
    db.session.commit()
    return jsonify({'message': 'Product added to cart', 'cart_item': cart_item.to_dict()}), 201

@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(current_user, item_id):
    cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    
    if not cart_item:
        return jsonify({'message': 'Cart item not found'}), 404
        
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({'message': 'Product removed from cart'}), 200

if __name__ == '__main__':
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
    app.run(debug=True, port=5000)
