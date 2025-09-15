import React, { useState } from 'react';

const ImageUpload = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            uploadImage(file);
        }
    };

    const uploadImage = (file) => {
        const formData = new FormData();
        formData.append('image', file);

        fetch('/api/detect', {
            method: 'POST',
            body: formData,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            },
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data
            console.log(data);
            setUploadProgress(100); // Complete upload
        })
        .catch(err => {
            setError('Image upload failed. Please try again.');
            console.error(err);
        });
    };

    return (
        <div className="image-upload">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {selectedImage && <img src={selectedImage} alt="Preview" />}
            {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default ImageUpload;