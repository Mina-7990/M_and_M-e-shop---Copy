import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        images: [''],
        description: '',
        quantity: '',
        cover: '',
        sizes: [{ size: '', price: '' }],
    });

    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo ? userInfo.token : '';

    const handleChange = (e) => {
        const { name, value, dataset } = e.target;

        if (name === "images") {
            const newImages = [...formData.images];
            newImages[dataset.index] = value;
            setFormData({
                ...formData,
                images: newImages,
            });
        } else if (name === "sizes") {
            const newSizes = [...formData.sizes];
            newSizes[dataset.index][dataset.field] = value;
            setFormData({
                ...formData,
                sizes: newSizes,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleAddImageField = () => {
        setFormData({
            ...formData,
            images: [...formData.images, ''],
        });
    };

    const handleRemoveImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            images: newImages,
        });
    };

    const handleAddSizeField = () => {
        setFormData({
            ...formData,
            sizes: [...formData.sizes, { size: '', price: '' }],
        });
    };

    const handleRemoveSizeField = (index) => {
        const newSizes = formData.sizes.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            sizes: newSizes,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            console.log("No token found");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/product/newproduct',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );
            console.log('Product added successfully', response.data);
            setMessage("Product added successfully!");
            setIsSuccess(true);
            setFormData({
                name: '',
                category: '',
                images: [''],
                description: '',
                quantity: '',
                cover: '',
                sizes: [{ size: '', price: '' }],
            });
        } catch (error) {
            console.error('Error adding product', error.response?.data || error.message);
            setMessage("Error adding product. Please try again!");
            setIsSuccess(false);
        }
    };

    return (
        <div>
            <h1>Add Product</h1>

            {message && (
                <div style={{ color: isSuccess ? 'green' : 'red' }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Category:
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Cover Image (URL):
                    <input
                        type="text"
                        name="cover"
                        value={formData.cover}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Images (URLs):
                    {formData.images.map((image, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                name="images"
                                value={image}
                                onChange={handleChange}
                                data-index={index}
                                required
                            />
                            <button type="button" onClick={() => handleRemoveImageField(index)}>
                                Remove Image
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddImageField}>Add Another Image</button>
                </label>

                <label>
                    Sizes:
                    {formData.sizes.map((s, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                name="sizes"
                                placeholder="Size"
                                value={s.size}
                                data-index={index}
                                data-field="size"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="number"
                                name="sizes"
                                placeholder="Price"
                                value={s.price}
                                data-index={index}
                                data-field="price"
                                onChange={handleChange}
                                required
                            />
                            <button type="button" onClick={() => handleRemoveSizeField(index)}>
                                Remove Size
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSizeField}>Add Another Size</button>
                </label>

                <label>
                    Description:
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Quantity:
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProduct;
