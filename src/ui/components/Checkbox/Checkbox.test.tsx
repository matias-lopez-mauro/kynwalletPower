import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Checkbox } from './Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Recordarme" checked={checked} onChange={setChecked} />;
}

describe('Checkbox', () => {
  it('US5-2: casilla con etiqueta que alterna su estado', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(screen.getByText('Recordarme'));
    expect(checkbox).not.toBeChecked();
  });

  it('002 REG-US2-8: muestra el error vinculado con aria-describedby', () => {
    render(<Checkbox label="Acepto" checked={false} onChange={() => {}} error="Debes aceptar" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar');
  });

  it('002: admite un nombre accesible propio y contenido junto a la etiqueta', () => {
    render(
      <Checkbox
        label="Acepto los"
        accessibleName="Acepto los términos y condiciones"
        checked={false}
        onChange={() => {}}
        after={<button type="button">términos y condiciones</button>}
      />,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'términos y condiciones' })).toBeInTheDocument();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Controlled />);
    await expectNoA11yViolations(container);
  });
});
