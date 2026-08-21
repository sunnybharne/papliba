import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
const scrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: scrollIntoView,
  writable: true,
});

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Papliba product site', () => {
  it('states clearly that the current release is not a working agent UI', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /your pi agent/i })).toBeInTheDocument();
    expect(screen.getByText(/not a working agent ui yet/i)).toBeInTheDocument();
  });

  it('navigates to the architecture from the primary call to action', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /explore the architecture/i }));

    expect(
      screen.getByRole('heading', { name: /a thin interface over the real pi runtime/i }),
    ).toBeInTheDocument();
  });

  it('renders the planned and current states in the documentation', () => {
    renderApp('/docs');

    expect(
      screen.getByRole('heading', { name: /start with what is true today/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/there is no downloadable papliba agent application/i),
    ).toBeInTheDocument();
  });

  it('states the public and private repository boundary', () => {
    renderApp('/docs');

    expect(
      screen.getByRole('heading', { name: /public documentation, private product/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/apache 2\.0 applies to files in this public repository/i),
    ).toBeInTheDocument();
  });

  it('keeps documentation section links inside the docs route', async () => {
    const user = userEvent.setup();
    renderApp('/docs');

    await user.click(screen.getByRole('link', { name: 'Technology' }));

    expect(
      screen.getByRole('heading', { name: /start with what is true today/i }),
    ).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('moves focus without changing routes when the skip link is used', async () => {
    const user = userEvent.setup();
    renderApp('/architecture');

    await user.click(screen.getByRole('link', { name: /skip to content/i }));

    expect(
      screen.getByRole('heading', { name: /a thin interface over the real pi runtime/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(document.getElementById('main-content')).toHaveFocus());
  });
});
