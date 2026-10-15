import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RulesModal } from '../components/RulesModal.tsx';

describe('RulesModal Component', () => {
  it('renders correctly and switches rules tabs', () => {
    render(<RulesModal onClose={vi.fn()} />);

    expect(screen.getByText('Правила и регламент GroupGame')).toBeInTheDocument();
    expect(screen.getByText('Как работает очередь ожидания (FIFO Waitlist)')).toBeInTheDocument();

    // Switch to Cancellation deadline tab
    const cancelTabBtn = screen.getByText('Отмена записи (3 часа)');
    fireEvent.click(cancelTabBtn);

    expect(screen.getByText('Дедлайн отмены и правила выхода из игры')).toBeInTheDocument();
    expect(screen.getByText('Правило 3 часов (Cancellation Deadline)')).toBeInTheDocument();

    // Switch to Attendance tab
    const attendanceTabBtn = screen.getByText('Посещаемость и No-Show');
    fireEvent.click(attendanceTabBtn);

    expect(screen.getByText('Фиксация посещаемости и репутация')).toBeInTheDocument();
    expect(screen.getByText(/Attended \(Присутствовал\)/)).toBeInTheDocument();
    expect(screen.getByText(/NoShow \(Не явился без предупреждения\)/)).toBeInTheDocument();
  });
});
