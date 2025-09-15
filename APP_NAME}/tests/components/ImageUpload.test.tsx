import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUpload from '../../src/features/authenticity/ImageUpload';

describe('ImageUpload Component', () => {
  test('renders upload button', () => {
    render(<ImageUpload />);
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    expect(uploadButton).toBeInTheDocument();
  });

  test('displays error message on invalid file type', () => {
    render(<ImageUpload />);
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(uploadButton, { target: { files: [file] } });
    const errorMessage = screen.getByText(/invalid file type/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays image preview on valid file upload', () => {
    render(<ImageUpload />);
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(uploadButton, { target: { files: [file] } });
    const imagePreview = screen.getByAltText(/uploaded image preview/i);
    expect(imagePreview).toBeInTheDocument();
  });
});