import React, { ChangeEvent, DragEvent } from 'react';
import '../App.css'; // Importing global styles or we could make module css

interface Props {
    onImageSelect: (file: File) => void;
    onValidationError: (message: string) => void;
    isLoading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ImageUpload: React.FC<Props> = ({ onImageSelect, onValidationError, isLoading }) => {
    const processFile = (file: File | undefined) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            onValidationError('Please select a JPG, PNG, or another image file.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            onValidationError('Image size must be 5 MB or less.');
            return;
        }

        onImageSelect(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        processFile(e.target.files?.[0]);
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        if (!isLoading) processFile(e.dataTransfer.files[0]);
    };

    return (
        <div style={{ width: '100%' }}>
            <label
                htmlFor="image-upload"
                className={`upload-label ${isLoading ? 'disabled' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="upload-text"><strong>Click to upload</strong> or drag and drop</p>
                    <p className="upload-subtext">JPG, PNG (MAX. 5MB)</p>
                </div>
                <input
                    id="image-upload"
                    type="file"
                    className="hidden-input"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={isLoading}
                />
            </label>
        </div>
    );
};

export default ImageUpload;
