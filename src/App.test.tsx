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
  it('states clearly that the working alpha remains private', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /agent work/i })).toBeInTheDocument();
    expect(screen.getByText(/working private alpha is in active development/i)).toBeInTheDocument();
  });

  it('navigates to the architecture from the primary call to action', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /see how it works/i }));

    expect(
      screen.getByRole('heading', { name: /a controlled route from intent to execution/i }),
    ).toBeInTheDocument();
  });

  it('renders public and private-alpha states in the documentation', () => {
    renderApp('/docs');

    expect(
      screen.getByRole('heading', { name: /public facts. private implementation/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/working alpha is not distributed/i)).toBeInTheDocument();
  });

  it('keeps documentation section links inside the docs route', async () => {
    const user = userEvent.setup();
    renderApp('/docs');

    await user.click(screen.getByRole('link', { name: 'Technology' }));

    expect(
      screen.getByRole('heading', { name: /public facts. private implementation/i }),
    ).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('moves focus without changing routes when the skip link is used', async () => {
    const user = userEvent.setup();
    renderApp('/architecture');

    await user.click(screen.getByRole('link', { name: /skip to content/i }));

    expect(
      screen.getByRole('heading', { name: /a controlled route from intent to execution/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(document.getElementById('main-content')).toHaveFocus());
  });
});
