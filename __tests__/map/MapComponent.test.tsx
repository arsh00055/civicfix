// ─────────────────────────────────────────────────────────────────────────────
// __tests__/components/MapComponent.test.tsx
// ─────────────────────────────────────────────────────────────────────────────
// MapComponent uses Leaflet which requires a real DOM + canvas.
// We mock the heavy parts and test the logic around them.

import { render, screen } from '@testing-library/react';
import MapComponent from '@/components/map/mapComponent';

// Mock Leaflet entirely — it tries to access canvas APIs jsdom doesn't have
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype:    {},
      mergeOptions: jest.fn(),
    },
  },
  icon: jest.fn().mockReturnValue({}),
}));

jest.mock('react-leaflet', () => ({
  MapContainer:  ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer:     () => <div data-testid="tile-layer" />,
  Marker:        ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup:         ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMapEvents:  jest.fn(),
}));

jest.mock('next/navigation', () => ({ useRouter: jest.fn(() => ({ push: jest.fn() })) }));

const MOCK_ISSUES = [
  {
    id: 'i1', title: 'Pothole', description: 'Big hole', latitude: 30.73, longitude: 76.69,
    status: 'reported' as const, priority: 'high' as const, category: 'infrastructure',
    location: 'Main St', upvotes: 5, voters: [], views: 0, commentsCount: 0,
    images: [], reporterId: 'u1', createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), reportedAt: new Date().toISOString(),
  },
];

describe('MapComponent', () => {
  test('shows loading state on server (before client mount)', () => {
    // isClient starts false — override useState to keep it false
    jest.spyOn(require('react'), 'useState')
      .mockImplementationOnce(() => [false, jest.fn()]); // isClient = false
    render(<MapComponent />);
    expect(screen.getByText(/loading map/i)).toBeInTheDocument();
    jest.restoreAllMocks();
  });

  test('renders map container when client-side', () => {
    render(<MapComponent />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('renders a marker for each issue', () => {
    render(<MapComponent issues={MOCK_ISSUES} />);
    expect(screen.getAllByTestId('marker')).toHaveLength(1);
  });

  test('renders issue title in popup', () => {
    render(<MapComponent issues={MOCK_ISSUES} />);
    expect(screen.getByText('Pothole')).toBeInTheDocument();
  });

  test('renders no markers when issues array is empty', () => {
    render(<MapComponent issues={[]} />);
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
  });

  test('renders View Details button when onIssueClick is provided', () => {
    render(<MapComponent issues={MOCK_ISSUES} onIssueClick={jest.fn()} />);
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
  });

  test('renders TileLayer', () => {
    render(<MapComponent />);
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });
});