/**
 * Setup chung cho vitest.
 *
 * - jest-dom bo sung cac matcher DOM (toBeInTheDocument, toHaveTextContent...)
 *   ma khong co san trong expect cua vitest.
 * - React 18 + testing-library can cleanup sau moi test, neu khong se con
 *   node cu trong document va cac test sau se tim thay phan tu da render.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
