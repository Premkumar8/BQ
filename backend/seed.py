from app import app
from models import db, Product

INITIAL_DATA = [
    {
        "name": "Kanchipuram Silk Saree",
        "price": "15,500 INR",
        "images": "/hero.png,/saree_close.png",
        "details_id": "saree",
        "description": "Experience the regal elegance of our authentic Kanchipuram Silk Saree. Woven by master artisans, this saree features intricate zari work and a luxurious silk drape that is perfect for weddings, festivals, and special occasions. The vibrant colors and traditional motifs are a testament to South Indian heritage."
    },
    {
        "name": "Designer Lehenga",
        "price": "22,000 INR",
        "images": "/collection.png,/lehenga_side.png",
        "details_id": "lehenga",
        "description": "Step into the spotlight with our breathtaking Designer Lehenga. Crafted with premium fabrics and detailed with exquisite hand-embroidery, this piece offers a perfect blend of modern silhouette and traditional craftsmanship. The set includes a heavily embellished skirt, a matching blouse, and a delicate dupatta."
    },
    {
        "name": "Traditional Half-Saree",
        "price": "18,500 INR",
        "images": "/half_saree.png,/half_saree_close.png",
        "details_id": "halfsaree",
        "description": "Embrace timeless beauty with our Traditional Half-Saree (Pattu Pavadai Dhavani). Known for its rich texture and contrasting vibrant colors, this ensemble is a classic choice for coming-of-age ceremonies and festive gatherings. The intricate borders and pure silk finish make it a wardrobe treasure."
    },
    {
        "name": "Elegant Churidar Set",
        "price": "4,500 INR",
        "images": "/churidar.png",
        "details_id": "churidar",
        "description": "Our Elegant Churidar Set is designed for both comfort and style. Featuring soft, breathable fabrics and elegant pastel tones with subtle embroidery, it is the ideal choice for everyday elegance or intimate celebrations. The tailored fit ensures a flattering silhouette."
    },
    {
        "name": "Indo-Western Boutique Dress",
        "price": "8,900 INR",
        "images": "/boutique_dress.png",
        "details_id": "dress",
        "description": "Make a statement with our Indo-Western Fusion Boutique Dress. Blending the best of Western cuts with Indian traditional textiles and motifs, this dress offers a unique, luxurious aesthetic. Perfect for evening parties, cocktail events, and modern receptions."
    },
    {
        "name": "Royal Anarkali Suit",
        "price": "12,000 INR",
        "images": "/anarkali.png",
        "details_id": "anarkali",
        "description": "Exude grace and royalty with our flowing Anarkali Suit. The floor-length gown is adorned with heavy embroidery and rich maroon and gold accents. Its sweeping silhouette flatters every body type, making it a majestic choice for grand celebrations."
    }
]

def seed_db():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        for item in INITIAL_DATA:
            product = Product(**item)
            db.session.add(product)
            
        db.session.commit()
        print("Database seeded successfully with products!")

if __name__ == '__main__':
    seed_db()
