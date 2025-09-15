import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../src/components/Button';

describe('Button Component', () => {
    it('renders the button with the correct text', () => {
        render(<Button label="Click Me" />);
        const buttonElement = screen.getByText(/Click Me/i);
        expect(buttonElement).toBeInTheDocument();
    });

    it('calls the onClick function when clicked', () => {
        const handleClick = jest.fn();
        render(<Button label="Click Me" onClick={handleClick} />);
        const buttonElement = screen.getByText(/Click Me/i);
        fireEvent.click(buttonElement);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when the disabled prop is true', () => {
        render(<Button label="Click Me" disabled={true} />);
        const buttonElement = screen.getByText(/Click Me/i);
        expect(buttonElement).toBeDisabled();
    });

    it('is not disabled when the disabled prop is false', () => {
        render(<Button label="Click Me" disabled={false} />);
        const buttonElement = screen.getByText(/Click Me/i);
        expect(buttonElement).toBeEnabled();
    });
});