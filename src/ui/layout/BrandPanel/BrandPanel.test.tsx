import { render, screen } from '@testing-library/react';
import { BrandPanel } from './BrandPanel';

describe('BrandPanel (002 research.md R9)', () => {
  it('sin props muestra los textos del login', () => {
    render(<BrandPanel />);
    expect(screen.getByText(/Tu dinero,/)).toHaveTextContent('Tu dinero,sin fronteras.');
    expect(screen.getByText(/Envía, recibe y paga en segundos/)).toBeInTheDocument();
  });

  it('FR-001: muestra el titular y el texto de apoyo recibidos', () => {
    render(
      <BrandPanel
        title={['Comienza tu', 'camino financiero.']}
        subtitle="Crea tu cuenta en minutos."
      />,
    );
    expect(screen.getByText(/Comienza tu/)).toHaveTextContent('Comienza tucamino financiero.');
    expect(screen.getByText('Crea tu cuenta en minutos.')).toBeInTheDocument();
    expect(screen.queryByText(/Tu dinero,/)).not.toBeInTheDocument();
  });

  it('la tarjeta ilustrativa es decorativa', () => {
    render(<BrandPanel />);
    expect(screen.getByText('Kyn Card').closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
