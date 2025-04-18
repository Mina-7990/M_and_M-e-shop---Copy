import React, { useEffect, useState } from 'react';
import '../style/OffersList.css';
import axios from 'axios';
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
                            src={image}
                            alt={`Offer ${index}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
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
            const response = await axios.get('http://localhost:5000/api/offer/offers');
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

    if (loading) return <p>Loading...</p>;
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
