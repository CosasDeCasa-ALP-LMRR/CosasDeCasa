import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    // Simple render test
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Since App has routing, we just check if it renders successfully
    expect(true).toBe(true);
  });
});
