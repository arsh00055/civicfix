import { renderHook, waitFor } from '@testing-library/react';
import useGeolocation from '@/hooks/useGeoLocation';
 
// Mock navigator.geolocation
const mockGetCurrentPosition = jest.fn();
const mockWatchPosition      = jest.fn();
const mockClearWatch         = jest.fn();
 
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(global.navigator, 'geolocation', {
    writable: true,
    value: {
      getCurrentPosition: mockGetCurrentPosition,
      watchPosition:      mockWatchPosition,
      clearWatch:         mockClearWatch,
    },
  });
});
 
function mockSuccessPosition(lat = 30.7333, lng = 76.7794) {
  mockGetCurrentPosition.mockImplementationOnce((success: any) =>
    success({
      coords: {
        latitude:         lat,
        longitude:        lng,
        accuracy:         10,
        altitude:         null,
        altitudeAccuracy: null,
        heading:          null,
        speed:            null,
      },
      timestamp: Date.now(),
    })
  );
}
 
function mockErrorPosition(code = 1, message = 'User denied') {
  mockGetCurrentPosition.mockImplementationOnce((_: any, error: any) =>
    error({ code, message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 })
  );
}
 
describe('useGeolocation', () => {
 
  test('starts in loading state', () => {
    mockGetCurrentPosition.mockImplementation(() => {}); // never resolves
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBe(true);
    expect(result.current.latitude).toBeNull();
  });
 
  test('returns coordinates on success', async () => {
    mockSuccessPosition(30.7333, 76.7794);
    const { result } = renderHook(() => useGeolocation());
 
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.latitude).toBe(30.7333);
    expect(result.current.longitude).toBe(76.7794);
    expect(result.current.error).toBeNull();
  });
 
  test('returns permission denied error message', async () => {
    mockErrorPosition(1, 'User denied');
    const { result } = renderHook(() => useGeolocation());
 
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/location access denied/i);
    expect(result.current.latitude).toBeNull();
  });
 
  test('returns position unavailable error message', async () => {
    mockErrorPosition(2, 'Position unavailable');
    const { result } = renderHook(() => useGeolocation());
 
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/location information is unavailable/i);
  });
 
  test('returns timeout error message', async () => {
    mockErrorPosition(3, 'Timeout');
    const { result } = renderHook(() => useGeolocation());
 
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/timed out/i);
  });
 
  test('handles missing geolocation API gracefully', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      writable: true,
      value: undefined,
    });
 
    const { result } = renderHook(() => useGeolocation());
 
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/not supported/i);
  });
 
  test('calls watchPosition when watch option is true', () => {
    mockWatchPosition.mockReturnValue(42);
    renderHook(() => useGeolocation({ watch: true }));
    expect(mockWatchPosition).toHaveBeenCalled();
    expect(mockGetCurrentPosition).not.toHaveBeenCalled();
  });
 
  test('passes options to getCurrentPosition', () => {
    mockSuccessPosition();
    renderHook(() => useGeolocation({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 1000,
    }));
 
    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 }
    );
  });
 
  test('clears watch on unmount', () => {
    mockWatchPosition.mockReturnValue(99);
    const { unmount } = renderHook(() => useGeolocation({ watch: true }));
    unmount();
    expect(mockClearWatch).toHaveBeenCalledWith(99);
  });
});