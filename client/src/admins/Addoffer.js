import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddOffer = () => {
    const [name, setName] = useState('');
    const [images, setImages] = useState(['']);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [offers, setOffers] = useState([]);

    // Fetch offers from the backend
    const fetchOffers = async () => {
        try {
            const response = await axios.get('https://m-and-m-e-shop-copy-3.onrender.com/api/offer/offers');
            setOffers(response.data);
        } catch (err) {
            // console.error('Error fetching offers:', err.message);
        }
    };

    // Call fetchOffers when the component mounts
    useEffect(() => {
        fetchOffers();
    }, []);

    const handleAddOffer = async () => {
        if (!name || images.some(img => img === '')) {
            setError('Please provide a name and at least one image.');
            return;
        }

        try {
            const response = await axios.post('https://m-and-m-e-shop-copy-1.onrender.com/api/offer/add-Offer', {
                name,
                images,
            });

            setSuccessMessage('Offer added successfully!');
            setName('');
            setImages(['']);
            fetchOffers(); // Reload offers after adding a new one
        } catch (err) {
            setError('Error adding offer');
        }
    };

    const handleImageChange = (index, event) => {
        const newImages = [...images];
        newImages[index] = event.target.value;
        setImages(newImages);
    };

    const handleAddImage = () => {
        setImages([...images, '']);
    };

    const handleDeleteOffer = async (id) => {
        try {
            await axios.delete(`https://m-and-m-e-shop-copy-1.onrender.com/api/offer/offers/${id}`);
            setOffers(offers.filter((offer) => offer._id !== id)); // Remove the deleted offer from the state
            setSuccessMessage('Offer deleted successfully!');
        } catch (err) {
            setError('Error deleting offer');
        }
    };

    return (
        <div className="add-offer-container">
            <h2>Add New Offer</h2>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div>
                <label>Offer Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter offer name"
                />
            </div>

            <div>
                <label>Offer Images:</label>
                {images.map((image, index) => (
                    <div key={index} className="image-input">
                        <input
                            type="text"
                            value={image}
                            onChange={(e) => handleImageChange(index, e)}
                            placeholder="Enter image URL"
                        />
                    </div>
                ))}

                <button onClick={handleAddImage}>Add Another Image</button>
            </div>

            <button onClick={handleAddOffer}>Add Offer</button>

            <div className="offers-list">
                <h3>All Offers</h3>
                {offers.length > 0 ? (
                    offers.map((offer) => (
                        <div key={offer._id} className="offer-item">
                            <h4>{offer.name}</h4>
                            <div>
                                {offer.images.map((img, index) => (
                                    <img key={index} src={img} alt={`offer-image-${index}`} loading="lazy" />
                                ))}
                            </div>
                            <button onClick={() => handleDeleteOffer(offer._id)}>Delete Offer</button>
                        </div>
                    ))
                ) : (
                    <p>No offers available.</p>
                )}
            </div>
        </div>
    );
};

export default AddOffer;
