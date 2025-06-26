import React, { useEffect, useState } from 'react';
import '../style/OffersList.css';
import axios from 'axios';
import Loading from '../components/Loading';

// Image proxy logic from Allproduct.js
const IMAGE_PROXY_URL = "https://images.weserv.nl/?url=https://drive.google.com/uc?id=";

const cleanDriveId = (id) => {
    if (!id) return null;
    const match = id.match(/[-\w]{25,}/);
    return match ? match[0] : null;
};

const getImageUrl = (cover) => {
    const cleanId = cleanDriveId(cover);
    if (!cleanId) return '/default-image.png';
    return `${IMAGE_PROXY_URL}${cleanId}&w=400&h=300&fit=cover`;
};

const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/default-image.png';
    e.target.style.objectFit = 'contain';
};

const OfferCard = ({ offer }) => {
    const [currentImage, setCurrentImage] = useState(0); // الصورة الحالية
    const [exitingImage, setExitingImage] = useState(null); // الصورة المغادرة

    useEffect(() => {
        const interval = setInterval(() => {
            setExitingImage(currentImage); // تعيين الصورة الحالية كمغادرة
            setTimeout(() => {
                setCurrentImage((prev) => (prev + 1) % offer.images.length); // التبديل إلى الصورة التالية
            }, 1000); // الوقت الكافي لتطبيق تأثير الخروج
        }, 3000); // تبديل الصور كل 3 ثوانٍ

        return () => clearInterval(interval);
    }, [currentImage, offer.images.length]);

    return (
        <div className="offer-card">
            <h2>{offer.name}</h2>
            <div className="image-slider">
                {offer.images.map((image, index) => (
                    <div
                        key={index}
                        className={`slider-image ${
                            index === currentImage
                                ? 'active'
                                : index === exitingImage
                                ? 'exit'
                                : ''
                        }`}
                    >
                        <img
                            src={getImageUrl(image)}
                            alt={`Offer ${index}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto',
                            }}
                            loading="lazy"
                            onError={handleImageError}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch offers from the backend
    const fetchOffers = async () => {
        try {
            const response = await axios.get('https://m-and-m-e-shop-copy-3.onrender.com/api/offer/offers');
            setOffers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching offers');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    if (loading) return <Loading />;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {offers.map((offer) => (
                <OfferCard key={offer.name} offer={offer} />
            ))}
        </div>
    );
};

export default OffersList;
